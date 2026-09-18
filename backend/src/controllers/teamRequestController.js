import TeamRequest from '../models/TeamRequest.js';
import Hackathon from '../models/Hackathon.js';
import { normalizeSkills, findMatchingCandidates } from '../services/matchingService.js';

/**
 * @route   GET /api/team-requests
 * @desc    List team requests (Strictly scoped to authenticated student's college)
 * @access  Private
 */
export const getTeamRequests = async (req, res) => {
  try {
    const filter = {};

    // STRICT COLLEGE ISOLATION:
    if (req.user.role !== 'superAdmin') {
      const userCollegeId = req.user.collegeId?._id || req.user.collegeId;
      filter.collegeId = userCollegeId;
    } else if (req.query.collegeId) {
      filter.collegeId = req.query.collegeId;
    }

    if (req.query.hackathon) {
      filter.hackathon = req.query.hackathon;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.skill) {
      filter.skillsNeeded = { $regex: new RegExp(`^${req.query.skill.trim()}$`, 'i') };
    }

    if (req.query.postedBy) {
      filter.postedBy = req.query.postedBy;
    }

    const teamRequests = await TeamRequest.find(filter)
      .populate('hackathon', 'title organizer mode location startDate endDate')
      .populate('postedBy', 'name email avatarUrl experienceLevel skills')
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teamRequests.length,
      teamRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team requests',
    });
  }
};

/**
 * @route   GET /api/team-requests/:id
 * @desc    Get single team request details
 * @access  Private
 */
export const getTeamRequestById = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id)
      .populate('hackathon', 'title organizer mode location startDate endDate')
      .populate('postedBy', 'name email avatarUrl experienceLevel skills')
      .populate('collegeId', 'name code');

    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found',
      });
    }

    // CROSS-COLLEGE SECURITY CHECK:
    if (req.user.role !== 'superAdmin') {
      const userColId = (req.user.collegeId?._id || req.user.collegeId).toString();
      const reqColId = (teamRequest.collegeId?._id || teamRequest.collegeId).toString();

      if (userColId !== reqColId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot view team requests from another college.',
        });
      }
    }

    res.json({
      success: true,
      teamRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching team request',
    });
  }
};

/**
 * @route   POST /api/team-requests
 * @desc    Create a new team request (College assigned automatically from user)
 * @access  Private
 */
export const createTeamRequest = async (req, res) => {
  try {
    const hackathon = req.body.hackathon || req.body.hackathonId;
    const { title, description, skillsNeeded, teamSizeNeeded } = req.body;

    if (!hackathon || !title || !skillsNeeded || skillsNeeded.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hackathon, title, and at least one required skill are required.',
      });
    }

    const hackathonDoc = await Hackathon.findById(hackathon);
    if (!hackathonDoc) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon listing not found.',
      });
    }

    // Assign author and college strictly from authenticated user
    const userCollegeId = req.user.collegeId?._id || req.user.collegeId;

    const newRequest = await TeamRequest.create({
      hackathon: hackathonDoc._id,
      postedBy: req.user._id,
      collegeId: userCollegeId,
      title: title.trim(),
      description: description ? description.trim() : '',
      skillsNeeded: normalizeSkills(skillsNeeded),
      teamSizeNeeded: Number(teamSizeNeeded) || 1,
      status: 'Open',
    });

    const populated = await TeamRequest.findById(newRequest._id)
      .populate('hackathon', 'title organizer mode')
      .populate('postedBy', 'name email avatarUrl experienceLevel skills')
      .populate('collegeId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Team request published successfully',
      teamRequest: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating team request',
    });
  }
};

/**
 * @route   PUT /api/team-requests/:id
 * @desc    Edit or close team request
 * @access  Private (Owner or SuperAdmin)
 */
export const updateTeamRequest = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id);
    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found',
      });
    }

    const isOwner = teamRequest.postedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own team requests.',
      });
    }

    const { title, description, skillsNeeded, teamSizeNeeded, status } = req.body;

    if (title) teamRequest.title = title.trim();
    if (description !== undefined) teamRequest.description = description.trim();
    if (skillsNeeded) teamRequest.skillsNeeded = normalizeSkills(skillsNeeded);
    if (teamSizeNeeded) teamRequest.teamSizeNeeded = Number(teamSizeNeeded);
    if (status && ['Open', 'Closed'].includes(status)) teamRequest.status = status;

    await teamRequest.save();

    const updated = await TeamRequest.findById(teamRequest._id)
      .populate('hackathon', 'title organizer mode')
      .populate('postedBy', 'name email avatarUrl')
      .populate('collegeId', 'name code');

    res.json({
      success: true,
      message: 'Team request updated successfully',
      teamRequest: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating team request',
    });
  }
};

/**
 * @route   DELETE /api/team-requests/:id
 * @desc    Delete team request
 * @access  Private (Owner, CollegeAdmin of same college, or SuperAdmin)
 */
export const deleteTeamRequest = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id);
    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found',
      });
    }

    const isOwner = teamRequest.postedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';
    const isSameCollegeAdmin =
      req.user.role === 'collegeAdmin' &&
      (req.user.collegeId?._id || req.user.collegeId).toString() === teamRequest.collegeId.toString();

    if (!isOwner && !isSuperAdmin && !isSameCollegeAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this request.',
      });
    }

    await TeamRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Team request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting team request',
    });
  }
};

/**
 * @route   GET /api/team-requests/:id/matches
 * @desc    Smart Matching Engine: find compatible teammates for this request
 * @access  Private
 */
export const getTeamRequestMatches = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id);
    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found',
      });
    }

    // Verify college match
    if (req.user.role !== 'superAdmin') {
      const userColId = (req.user.collegeId?._id || req.user.collegeId).toString();
      const reqColId = (teamRequest.collegeId?._id || teamRequest.collegeId).toString();

      if (userColId !== reqColId) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You cannot run match queries on another college\'s request.',
        });
      }
    }

    // Execute Smart Matching Engine strictly scoped to teamRequest.collegeId
    const matches = await findMatchingCandidates({
      collegeId: teamRequest.collegeId,
      skillsNeeded: teamRequest.skillsNeeded,
      excludeUserId: teamRequest.postedBy,
      limit: 30,
    });

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error executing matching query',
    });
  }
};

/**
 * @route   POST /api/team-requests/preview-matches
 * @desc    Live match preview while drafting a team request (before posting)
 * @access  Private
 */
export const previewMatches = async (req, res) => {
  try {
    const { skillsNeeded } = req.body;
    const userCollegeId = req.user.collegeId?._id || req.user.collegeId;

    if (!userCollegeId) {
      return res.status(400).json({
        success: false,
        message: 'User college ID required for matching.',
      });
    }

    const matches = await findMatchingCandidates({
      collegeId: userCollegeId,
      skillsNeeded: skillsNeeded || [],
      excludeUserId: req.user._id,
      limit: 15,
    });

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating match preview',
    });
  }
};
