import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import TeamRequest from '../models/TeamRequest.js';
import Notification from '../models/Notification.js';

/**
 * Escapes characters for safe RegExp construction to prevent ReDoS / injection
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Curated navigation pages based on user roles
 */
const getNavigablePages = (user) => {
  const isAdmin = user.role === 'collegeAdmin' || user.role === 'superAdmin';
  const isSuperAdmin = user.role === 'superAdmin';

  const pages = [
    {
      id: 'page-dashboard',
      category: 'pages',
      title: 'Student Dashboard',
      subtitle: 'Overview, stats, recent requests and campus events',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      keywords: ['dashboard', 'home', 'stats', 'overview', 'metrics'],
    },
    {
      id: 'page-hackathons',
      category: 'pages',
      title: 'Browse Hackathons',
      subtitle: 'Explore campus and global hackathon listings',
      path: '/hackathons',
      icon: 'Trophy',
      keywords: ['hackathons', 'events', 'competitions', 'calendar', 'contests'],
    },
    {
      id: 'page-users',
      category: 'pages',
      title: 'Find Teammates',
      subtitle: 'Discover campus peers and filter by skills',
      path: '/users',
      icon: 'Users',
      keywords: ['users', 'teammates', 'students', 'peers', 'profiles', 'skills'],
    },
    {
      id: 'page-post-request',
      category: 'pages',
      title: 'Post Team Request',
      subtitle: 'Recruit teammates for an upcoming hackathon',
      path: '/post-request',
      icon: 'PlusCircle',
      keywords: ['post', 'create', 'recruit', 'request', 'team'],
    },
    {
      id: 'page-my-requests',
      category: 'pages',
      title: 'My Requests & Responses',
      subtitle: 'Manage recruitment listings and incoming applications',
      path: '/my-requests',
      icon: 'Inbox',
      keywords: ['my requests', 'responses', 'applications', 'status', 'applicants'],
    },
    {
      id: 'page-notifications',
      category: 'pages',
      title: 'Notifications Hub',
      subtitle: 'Review verification alerts and team request updates',
      path: '/notifications',
      icon: 'Bell',
      keywords: ['notifications', 'alerts', 'updates', 'messages', 'inbox'],
    },
    {
      id: 'page-profile',
      category: 'pages',
      title: 'My Profile',
      subtitle: 'View and showcase your developer bio and skills',
      path: `/profile/${user._id}`,
      icon: 'User',
      keywords: ['profile', 'portfolio', 'skills', 'experience', 'me'],
    },
    {
      id: 'page-edit-profile',
      category: 'pages',
      title: 'Edit Profile Settings',
      subtitle: 'Update bio, skills, GitHub, LinkedIn, and portfolio',
      path: '/edit-profile',
      icon: 'Settings',
      keywords: ['edit', 'profile', 'settings', 'account', 'links', 'github'],
    },
  ];

  if (isAdmin) {
    pages.push(
      {
        id: 'page-admin-dashboard',
        category: 'pages',
        title: 'Admin Dashboard',
        subtitle: 'Institution overview and administrative control',
        path: '/admin',
        icon: 'Shield',
        keywords: ['admin', 'institution', 'management', 'controls'],
      },
      {
        id: 'page-admin-verification',
        category: 'pages',
        title: 'Admin Verification Queue',
        subtitle: 'Review and verify student experience claims',
        path: '/admin/verification',
        icon: 'ShieldCheck',
        keywords: ['admin verification', 'approve', 'reject', 'experience'],
      },
      {
        id: 'page-admin-students',
        category: 'pages',
        title: 'Admin Students Directory',
        subtitle: 'Manage campus student rosters and accounts',
        path: '/admin/students',
        icon: 'GraduationCap',
        keywords: ['admin students', 'roster', 'users', 'deactivate'],
      },
      {
        id: 'page-admin-requests',
        category: 'pages',
        title: 'Admin Team Requests',
        subtitle: 'Audit and monitor student team recruitment',
        path: '/admin/team-requests',
        icon: 'FolderKanban',
        keywords: ['admin team requests', 'audit', 'monitor'],
      }
    );
  }

  if (isSuperAdmin) {
    pages.push(
      {
        id: 'page-admin-colleges',
        category: 'pages',
        title: 'Admin Colleges Management',
        subtitle: 'Configure multi-college tenants and domains',
        path: '/admin/colleges',
        icon: 'Building2',
        keywords: ['admin colleges', 'tenants', 'campuses', 'superadmin'],
      },
      {
        id: 'page-admin-audit',
        category: 'pages',
        title: 'Admin Security Audit Logs',
        subtitle: 'Inspect immutable system event audit trail',
        path: '/admin/audit-logs',
        icon: 'FileText',
        keywords: ['audit logs', 'security', 'compliance', 'trail'],
      }
    );
  }

  return pages;
};

/**
 * Quick system actions matching user queries
 */
const getQuickActions = (user) => {
  return [
    {
      id: 'action-post-team-request',
      category: 'actions',
      title: 'Create Team Request',
      subtitle: 'Post an open teammate request for a hackathon',
      path: '/post-request',
      icon: 'PlusCircle',
      keywords: ['create', 'post', 'request', 'recruit', 'new team'],
    },
    {
      id: 'action-find-teammates',
      category: 'actions',
      title: 'Find Teammates',
      subtitle: 'Filter campus peers by required skills',
      path: '/users',
      icon: 'Users',
      keywords: ['find', 'search teammates', 'discover', 'peers'],
    },
    {
      id: 'action-edit-profile',
      category: 'actions',
      title: 'Update Developer Profile',
      subtitle: 'Edit your tech stack, github, and experience level',
      path: '/edit-profile',
      icon: 'Edit3',
      keywords: ['update', 'edit profile', 'change bio', 'skills'],
    },
    {
      id: 'action-view-notifications',
      category: 'actions',
      title: 'Check Notifications',
      subtitle: 'Read alerts and response updates',
      path: '/notifications',
      icon: 'Bell',
      keywords: ['check notifications', 'alerts', 'messages'],
    },
  ];
};

/**
 * @desc    Universal Search across isolated campus entities
 * @route   GET /api/search?q=...
 * @access  Private (strictly authenticated & isolated)
 */
export const universalSearch = async (req, res, next) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    if (!rawQuery) {
      return res.json({
        success: true,
        query: '',
        counts: { pages: 0, hackathons: 0, teammates: 0, teamRequests: 0, notifications: 0, actions: 0, total: 0 },
        results: {
          pages: [],
          hackathons: [],
          teammates: [],
          teamRequests: [],
          notifications: [],
          actions: [],
        },
      });
    }

    // Limit length to avoid expensive queries
    const sanitized = rawQuery.slice(0, 80);
    const escaped = escapeRegex(sanitized);
    const searchRegex = new RegExp(escaped, 'i');

    const currentUser = req.user;
    const isSuperAdmin = currentUser.role === 'superAdmin';
    const userCollegeId = currentUser.collegeId?._id || currentUser.collegeId;

    // Filter Static Pages & Actions
    const pagesList = getNavigablePages(currentUser);
    const matchedPages = pagesList
      .filter((page) => {
        return (
          searchRegex.test(page.title) ||
          searchRegex.test(page.subtitle) ||
          page.keywords.some((k) => searchRegex.test(k))
        );
      })
      .slice(0, 4);

    const actionsList = getQuickActions(currentUser);
    const matchedActions = actionsList
      .filter((action) => {
        return (
          searchRegex.test(action.title) ||
          searchRegex.test(action.subtitle) ||
          action.keywords.some((k) => searchRegex.test(k))
        );
      })
      .slice(0, 3);

    // Build database queries with strict isolation
    // 1. Hackathons: Global OR user's college
    const hackathonQuery = {
      status: { $ne: 'Inactive' },
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { organizer: searchRegex },
        { tags: searchRegex },
      ],
    };
    if (!isSuperAdmin) {
      hackathonQuery.$and = [
        {
          $or: [
            { visibility: 'Global' },
            { collegeId: userCollegeId },
          ],
        },
      ];
    }

    // 2. Teammates: MUST be in user's college (airtight isolation)
    const teammateQuery = {
      status: 'Active',
      _id: { $ne: currentUser._id },
      $or: [
        { name: searchRegex },
        { bio: searchRegex },
        { skills: searchRegex },
      ],
    };
    if (!isSuperAdmin) {
      teammateQuery.collegeId = userCollegeId;
    }

    // 3. Team Requests: MUST be in user's college
    const teamRequestQuery = {
      status: 'Open',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { skillsNeeded: searchRegex },
      ],
    };
    if (!isSuperAdmin) {
      teamRequestQuery.collegeId = userCollegeId;
    }

    // 4. Notifications: MUST belong to user
    const notificationQuery = {
      recipient: currentUser._id,
      $or: [
        { title: searchRegex },
        { message: searchRegex },
      ],
    };

    // Execute queries concurrently
    const [hackathons, teammates, teamRequests, notifications] = await Promise.all([
      Hackathon.find(hackathonQuery)
        .select('_id title organizer mode startDate endDate registrationDeadline tags isExternal source')
        .sort({ startDate: 1 })
        .limit(5)
        .lean(),

      TeammatesSearch(teammateQuery),

      TeamRequest.find(teamRequestQuery)
        .select('_id title description skillsNeeded teamSizeNeeded createdAt hackathon postedBy')
        .populate('hackathon', 'title mode location')
        .populate('postedBy', 'name avatarUrl experienceVerificationStatus')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Notification.find(notificationQuery)
        .select('_id title message type link isRead createdAt')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
    ]);

    // Format results uniformly for front-end consumption
    const formattedHackathons = hackathons.map((h) => ({
      id: h._id.toString(),
      category: 'hackathons',
      title: h.title,
      subtitle: `${h.organizer || 'Official'} • ${h.mode || 'Online'}`,
      path: `/hackathons/${h._id}`,
      tags: h.tags || [],
      badge: h.mode,
    }));

    const formattedTeammates = teammates.map((u) => ({
      id: u._id.toString(),
      category: 'teammates',
      title: u.name,
      subtitle: u.skills?.slice(0, 3).join(', ') || u.experienceLevel || 'Student',
      path: `/profile/${u._id}`,
      avatarUrl: u.avatarUrl,
      verified: u.experienceVerificationStatus === 'Verified',
      skills: u.skills || [],
    }));

    const formattedRequests = teamRequests.map((r) => ({
      id: r._id.toString(),
      category: 'teamRequests',
      title: r.title,
      subtitle: `For ${r.hackathon?.title || 'Hackathon'} • By ${r.postedBy?.name || 'Peer'}`,
      path: `/hackathons/${r.hackathon?._id || ''}`,
      skills: r.skillsNeeded || [],
    }));

    const formattedNotifications = notifications.map((n) => ({
      id: n._id.toString(),
      category: 'notifications',
      title: n.title,
      subtitle: n.message,
      path: n.link || '/notifications',
      isRead: n.isRead,
      type: n.type,
    }));

    const counts = {
      pages: matchedPages.length,
      hackathons: formattedHackathons.length,
      teammates: formattedTeammates.length,
      teamRequests: formattedRequests.length,
      notifications: formattedNotifications.length,
      actions: matchedActions.length,
    };
    counts.total =
      counts.pages +
      counts.hackathons +
      counts.teammates +
      counts.teamRequests +
      counts.notifications +
      counts.actions;

    return res.json({
      success: true,
      query: sanitized,
      counts,
      results: {
        pages: matchedPages,
        hackathons: formattedHackathons,
        teammates: formattedTeammates,
        teamRequests: formattedRequests,
        notifications: formattedNotifications,
        actions: matchedActions,
      },
    });
  } catch (error) {
    console.error('[UniversalSearch] Error executing search query:', error);
    next(error);
  }
};

/**
 * Helper to fetch teammates with clean projections
 */
async function TeammatesSearch(query) {
  return User.find(query)
    .select('_id name bio skills experienceLevel avatarUrl experienceVerificationStatus collegeId')
    .sort({ experienceVerificationStatus: -1, createdAt: -1 })
    .limit(5)
    .lean();
}

export default {
  universalSearch,
};
