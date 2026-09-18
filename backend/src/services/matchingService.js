import User from '../models/User.js';

/**
 * Normalizes a list of skills (trims, lowercases, deduplicates while preserving display casing)
 */
export const normalizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];
  const map = new Map();
  skills.forEach((raw) => {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed) {
        const lower = trimmed.toLowerCase();
        if (!map.has(lower)) {
          map.set(lower, trimmed);
        }
      }
    }
  });
  return Array.from(map.values());
};

/**
 * Calculate match metrics between a user's skills and required skills
 */
export const calculateSkillMatch = (userSkills = [], skillsNeeded = []) => {
  const normNeeded = normalizeSkills(skillsNeeded);
  const normUser = normalizeSkills(userSkills);

  if (normNeeded.length === 0) {
    return {
      overlapCount: 0,
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const userSkillMap = new Map();
  normUser.forEach((s) => userSkillMap.set(s.toLowerCase(), s));

  const matchedSkills = [];
  const missingSkills = [];

  normNeeded.forEach((needed) => {
    const key = needed.toLowerCase();
    if (userSkillMap.has(key)) {
      matchedSkills.push(userSkillMap.get(key));
    } else {
      missingSkills.push(needed);
    }
  });

  const overlapCount = matchedSkills.length;
  const matchScore = Math.round((overlapCount / normNeeded.length) * 100);

  return {
    overlapCount,
    matchScore,
    matchedSkills,
    missingSkills,
  };
};

/**
 * Find and rank matching candidates for a team request.
 * Strictly scopes query to targetCollegeId (SAME college).
 */
export const findMatchingCandidates = async ({
  collegeId,
  skillsNeeded = [],
  excludeUserId = null,
  limit = 20,
}) => {
  if (!collegeId) {
    throw new Error('collegeId is required for skill matching');
  }

  const query = {
    collegeId,
    status: 'Active',
    role: 'student',
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  // Fetch all active students from the same college
  const candidates = await User.find(query)
    .select('-password')
    .populate('collegeId', 'name code')
    .lean();

  const results = candidates.map((candidate) => {
    const match = calculateSkillMatch(candidate.skills || [], skillsNeeded);
    return {
      user: candidate,
      ...match,
    };
  });

  // Filter candidates with at least 1 matching skill if skillsNeeded is provided
  // or sort all candidates by match score
  const filtered = skillsNeeded.length > 0
    ? results.filter((r) => r.overlapCount > 0)
    : results;

  // Rank: 1. overlapCount descending, 2. matchScore descending
  filtered.sort((a, b) => {
    if (b.overlapCount !== a.overlapCount) {
      return b.overlapCount - a.overlapCount;
    }
    return b.matchScore - a.matchScore;
  });

  return filtered.slice(0, limit);
};
