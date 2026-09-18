import Response from '../models/Response.js';
import TeamRequest from '../models/TeamRequest.js';
import { calculateSkillMatch } from '../services/matchingService.js';
import { createApplicationNotification } from '../services/notificationService.js';

/**
 * @route   POST /api/responses
 * @desc    Apply / respond to an open team request
 * @access  Private
 */
export const createResponse = async (req, res) => {
  try {
    const { teamRequestId, message } = req.body;

    if (!teamRequestId) {
      return res.status(400).json({
        success: false,
        message: 'teamRequestId is required.',
      });
    }

    const teamRequest = await TeamRequest.findById(teamRequestId);
    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found.',
      });
    }

    if (teamRequest.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'This team request has been closed and is no longer accepting responses.',
      });
    }

    // CROSS-COLLEGE SECURITY CHECK:
    // Student can only apply to requests belonging to their OWN college
    const userColId = (req.user.collegeId?._id || req.user.collegeId).toString();
    const reqColId = (teamRequest.collegeId?._id || teamRequest.collegeId).toString();

    if (userColId !== reqColId) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You cannot apply to team requests from another college institution.',
      });
    }

    // Cannot apply to your own team request
    if (teamRequest.postedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own team request.',
      });
    }

    // Check for existing pending/accepted response
    const existing = await Response.findOne({
      teamRequest: teamRequest._id,
      respondent: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You have already applied to this team request (Status: ${existing.status}).`,
      });
    }

    const response = await Response.create({
      teamRequest: teamRequest._id,
      respondent: req.user._id,
      collegeId: teamRequest.collegeId,
      message: message ? message.trim() : '',
      status: 'Pending',
    });

    const populated = await Response.findById(response._id)
      .populate({
        path: 'teamRequest',
        populate: { path: 'hackathon', select: 'title organizer mode' },
      })
      .populate('respondent', 'name email avatarUrl skills experienceLevel');

    // Notify team request owner about incoming application
    try {
      await createApplicationNotification({
        recipient: teamRequest.postedBy,
        actor: req.user._id,
        collegeId: teamRequest.collegeId,
        type: 'APPLICATION_RECEIVED',
        teamTitle: teamRequest.title,
        applicantName: req.user.name,
        responseId: response._id,
        requestId: teamRequest._id,
      });
    } catch (notifErr) {
      console.error('[Application Notification Error]:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      response: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting application',
    });
  }
};

/**
 * @route   GET /api/responses/my
 * @desc    Get sent applications and received applicant responses
 * @access  Private
 */
export const getMyResponses = async (req, res) => {
  try {
    // 1. Applications sent by the user
    const sentResponses = await Response.find({ respondent: req.user._id })
      .populate({
        path: 'teamRequest',
        populate: [
          { path: 'hackathon', select: 'title organizer mode startDate' },
          { path: 'postedBy', select: 'name email avatarUrl' },
          { path: 'collegeId', select: 'name code' },
        ],
      })
      .sort({ createdAt: -1 });

    // 2. Requests created by the user
    const myRequests = await TeamRequest.find({ postedBy: req.user._id })
      .populate('hackathon', 'title organizer mode')
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    const myRequestIds = myRequests.map((r) => r._id);

    // 3. Applications received for the user's requests
    const receivedResponses = await Response.find({
      teamRequest: { $in: myRequestIds },
    })
      .populate('respondent', 'name email avatarUrl skills experienceLevel githubUrl linkedinUrl')
      .populate({
        path: 'teamRequest',
        select: 'title skillsNeeded teamSizeNeeded status hackathon',
        populate: { path: 'hackathon', select: 'title' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich received responses with smart skill match metrics against the request's skillsNeeded!
    const enrichedReceived = receivedResponses.map((resItem) => {
      const needed = resItem.teamRequest?.skillsNeeded || [];
      const userSkills = resItem.respondent?.skills || [];
      const matchMetrics = calculateSkillMatch(userSkills, needed);

      return {
        ...resItem,
        matchMetrics,
      };
    });

    res.json({
      success: true,
      sentApplications: sentResponses,
      receivedApplications: enrichedReceived,
      myRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user applications',
    });
  }
};

/**
 * @route   PUT /api/responses/:id
 * @desc    Accept or reject an applicant response
 * @access  Private (Team Request owner only)
 */
export const updateResponseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Pending, Accepted, or Rejected.',
      });
    }

    const response = await Response.findById(req.params.id).populate('teamRequest');
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response record not found.',
      });
    }

    // Verify current user is the owner of the team request
    const isOwner = response.teamRequest.postedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the team request owner can accept or reject applicants.',
      });
    }

    response.status = status;
    await response.save();

    // Notify applicant of status update
    try {
      if (status === 'Accepted' || status === 'Rejected') {
        await createApplicationNotification({
          recipient: response.respondent,
          actor: req.user._id,
          collegeId: response.collegeId,
          type: status === 'Accepted' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_REJECTED',
          teamTitle: response.teamRequest?.title || 'Hackathon Team',
          applicantName: req.user.name,
          responseId: response._id,
          requestId: response.teamRequest?._id,
        });
      }
    } catch (notifErr) {
      console.error('[Response Status Notification Error]:', notifErr.message);
    }

    res.json({
      success: true,
      message: `Application has been marked as ${status}.`,
      response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating response status',
    });
  }
};
