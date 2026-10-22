import Hackathon from '../models/Hackathon.js';
import TeamRequest from '../models/TeamRequest.js';
import { safeRegex, escapeRegex } from '../utils/sanitize.js';

/**
 * @route   GET /api/hackathons
 * @desc    Get hackathons (Global + same college if authenticated)
 * @access  Public / Optional Auth
 */
export const getHackathons = async (req, res) => {
  try {
    const now = new Date();
    const filter = {};

    // 1. Status & Timeline Filtering
    const timeline = req.query.timeline;
    const statusQuery = req.query.status;

    if (statusQuery && statusQuery !== 'All') {
      filter.status = statusQuery;
    } else if (timeline === 'Past') {
      filter.status = 'Inactive';
    } else if (timeline === 'Closing Soon') {
      filter.status = 'Active';
      filter.registrationDeadline = {
        $gte: now,
        $lte: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      };
    } else if (timeline === 'Upcoming') {
      filter.status = 'Active';
      filter.$or = [{ startDate: { $gt: now } }, { registrationDeadline: { $gt: now } }];
    } else if (!statusQuery) {
      // Default to Active hackathons unless explicitly requesting All or Past
      filter.status = 'Active';
    }

    // 2. Visibility rules (college isolation)
    let visibilityCondition = null;
    if (req.user) {
      if (req.user.role === 'superAdmin') {
        // Super Admin sees all
      } else {
        const userCollegeId = req.user.collegeId?._id || req.user.collegeId;
        visibilityCondition = {
          $or: [
            { visibility: 'Global' },
            { visibility: 'College', collegeId: userCollegeId },
          ],
        };
      }
    } else {
      // Unauthenticated viewers only see Global hackathons
      visibilityCondition = { visibility: 'Global' };
    }

    // 3. Source Filtering
    if (req.query.source && req.query.source !== 'All') {
      if (req.query.source === 'external') {
        filter.isExternal = true;
      } else if (req.query.source === 'manual') {
        filter.isExternal = { $ne: true };
      } else {
        filter.source = req.query.source;
      }
    }

    if (req.query.mode && req.query.mode !== 'All') {
      filter.mode = req.query.mode;
    }

    if (req.query.tag && req.query.tag !== 'All') {
      const tagQuery = escapeRegex(String(req.query.tag).trim().slice(0, 50));
      if (tagQuery) {
        filter.tags = { $regex: new RegExp(`^${tagQuery}$`, 'i') };
      }
    }

    // Combine conditions cleanly
    const andClauses = [];
    if (visibilityCondition) {
      andClauses.push(visibilityCondition);
    }

    if (filter.$or) {
      andClauses.push({ $or: filter.$or });
      delete filter.$or;
    }

    if (req.query.search) {
      const searchRegex = safeRegex(String(req.query.search));
      if (searchRegex) {
        andClauses.push({
          $or: [
            { title: searchRegex },
            { organizer: searchRegex },
            { description: searchRegex },
            { location: searchRegex },
          ],
        });
      }
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    // Sort order
    let sortOption = { startDate: 1, registrationDeadline: 1 };
    if (timeline === 'Recently Added') {
      sortOption = { createdAt: -1 };
    } else if (timeline === 'Closing Soon') {
      sortOption = { registrationDeadline: 1 };
    } else if (timeline === 'Past') {
      sortOption = { endDate: -1, startDate: -1 };
    }

    const hackathons = await Hackathon.find(filter)
      .populate('collegeId', 'name code')
      .populate('postedBy', 'name email avatarUrl')
      .sort(sortOption);

    res.json({
      success: true,
      count: hackathons.length,
      hackathons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hackathons',
    });
  }
};

/**
 * @route   GET /api/hackathons/:id
 * @desc    Get single hackathon details & associated team requests
 * @access  Public / Optional Auth
 */
export const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('collegeId', 'name code location')
      .populate('postedBy', 'name email avatarUrl');

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon listing not found',
      });
    }

    // Check college visibility if visibility is College
    if (hackathon.visibility === 'College') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'This is a college-specific hackathon. Please log in to view details.',
        });
      }

      if (req.user.role !== 'superAdmin') {
        const userColId = (req.user.collegeId?._id || req.user.collegeId).toString();
        const hackColId = (hackathon.collegeId?._id || hackathon.collegeId).toString();

        if (userColId !== hackColId) {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: This hackathon is restricted to another college.',
          });
        }
      }
    }

    // Fetch team requests for this hackathon
    // Respect college isolation for students!
    const reqFilter = { hackathon: hackathon._id };
    if (req.user && req.user.role !== 'superAdmin') {
      reqFilter.collegeId = req.user.collegeId?._id || req.user.collegeId;
    }

    const teamRequests = await TeamRequest.find(reqFilter)
      .populate('postedBy', 'name email avatarUrl experienceLevel skills')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      hackathon,
      teamRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching hackathon details',
    });
  }
};

/**
 * @route   POST /api/hackathons
 * @desc    Create new hackathon listing
 * @access  Private
 */
export const createHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      organizer,
      mode,
      location,
      startDate,
      endDate,
      registrationDeadline,
      registrationLink,
      tags,
      visibility,
    } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Hackathon title is required.',
      });
    }

    const isSuperAdmin = req.user.role === 'superAdmin';
    // STRICT TENANT ISOLATION: Non-superAdmins can ONLY create College-scoped hackathons affiliated with their own institution
    const hackathonVisibility = isSuperAdmin && visibility === 'Global' ? 'Global' : 'College';
    const userCollegeId = req.user.collegeId?._id || req.user.collegeId;
    const assignedCollegeId = hackathonVisibility === 'College' ? userCollegeId : null;

    const hackathon = await Hackathon.create({
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      organizer: typeof organizer === 'string' ? organizer.trim() : '',
      mode: mode && ['Online', 'Offline', 'Hybrid'].includes(mode) ? mode : 'Online',
      location: typeof location === 'string' ? location.trim() : '',
      startDate,
      endDate,
      registrationDeadline,
      registrationLink: typeof registrationLink === 'string' ? registrationLink.trim() : '',
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      visibility: hackathonVisibility,
      collegeId: assignedCollegeId,
      postedBy: req.user._id,
      status: 'Active',
    });

    const populated = await Hackathon.findById(hackathon._id)
      .populate('collegeId', 'name code')
      .populate('postedBy', 'name email avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Hackathon listing created successfully',
      hackathon: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating hackathon',
    });
  }
};

/**
 * @route   PUT /api/hackathons/:id
 * @desc    Update hackathon listing
 * @access  Private (Author or SuperAdmin)
 */
export const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    const isAuthor = hackathon.postedBy && hackathon.postedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isAuthor && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit hackathons you created.',
      });
    }

    // STRICT MASS-ASSIGNMENT PROTECTION: Use explicit field allowlist
    const {
      title,
      description,
      organizer,
      mode,
      location,
      startDate,
      endDate,
      registrationDeadline,
      registrationLink,
      tags,
      status,
      visibility,
    } = req.body;

    if (title !== undefined && typeof title === 'string') hackathon.title = title.trim();
    if (description !== undefined && typeof description === 'string') hackathon.description = description.trim();
    if (organizer !== undefined && typeof organizer === 'string') hackathon.organizer = organizer.trim();
    if (mode !== undefined && ['Online', 'Offline', 'Hybrid'].includes(mode)) hackathon.mode = mode;
    if (location !== undefined && typeof location === 'string') hackathon.location = location.trim();
    if (startDate !== undefined) hackathon.startDate = startDate;
    if (endDate !== undefined) hackathon.endDate = endDate;
    if (registrationDeadline !== undefined) hackathon.registrationDeadline = registrationDeadline;
    if (registrationLink !== undefined && typeof registrationLink === 'string') {
      hackathon.registrationLink = registrationLink.trim();
    }
    if (Array.isArray(tags)) {
      hackathon.tags = tags.map((t) => String(t).trim()).filter(Boolean);
    }
    if (status !== undefined && ['Active', 'Inactive'].includes(status)) {
      hackathon.status = status;
    }
    // Only superAdmin can change visibility to Global
    if (isSuperAdmin && visibility && ['Global', 'College'].includes(visibility)) {
      hackathon.visibility = visibility;
    }

    // Protected fields (collegeId, isExternal, source, postedBy, syncStatus, externalId)
    // are strictly excluded from update to prevent BOLA and identity tampering.
    await hackathon.save();

    res.json({
      success: true,
      message: 'Hackathon updated successfully',
      hackathon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating hackathon',
    });
  }
};

/**
 * @route   DELETE /api/hackathons/:id
 * @desc    Delete hackathon listing
 * @access  Private (Author or SuperAdmin)
 */
export const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    const isAuthor = hackathon.postedBy && hackathon.postedBy.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'superAdmin';

    if (!isAuthor && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete hackathons you created.',
      });
    }

    await Hackathon.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hackathon deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting hackathon',
    });
  }
};
