import { INITIAL_HACKATHONS, INITIAL_USERS, INITIAL_TEAM_REQUESTS, INITIAL_RESPONSES } from "./mockData";

const KEYS = {
  USERS: "hackmatch_users_v1",
  HACKATHONS: "hackmatch_hackathons_v1",
  TEAM_REQUESTS: "hackmatch_team_requests_v1",
  RESPONSES: "hackmatch_responses_v1",
  AUTH: "hackmatch_current_user_v1"
};

// Initialize localStorage with seed data if empty
export function initStorage() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.HACKATHONS)) {
    localStorage.setItem(KEYS.HACKATHONS, JSON.stringify(INITIAL_HACKATHONS));
  }
  if (!localStorage.getItem(KEYS.TEAM_REQUESTS)) {
    localStorage.setItem(KEYS.TEAM_REQUESTS, JSON.stringify(INITIAL_TEAM_REQUESTS));
  }
  if (!localStorage.getItem(KEYS.RESPONSES)) {
    localStorage.setItem(KEYS.RESPONSES, JSON.stringify(INITIAL_RESPONSES));
  }
  if (!localStorage.getItem(KEYS.AUTH)) {
    // Default logged in user for immediate seamless testing (Alex Rivera)
    localStorage.setItem(KEYS.AUTH, JSON.stringify(INITIAL_USERS[0]));
  }
}

// User Helpers
export function getUsers() {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function saveUser(userData) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userData.id);
  if (index >= 0) {
    users[index] = { ...users[index], ...userData };
  } else {
    users.push(userData);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  // If current logged-in user updated their own profile
  const authUser = getCurrentAuthUser();
  if (authUser && authUser.id === userData.id) {
    setCurrentAuthUser({ ...authUser, ...userData });
  }

  return userData;
}

export function getCurrentAuthUser() {
  initStorage();
  const data = localStorage.getItem(KEYS.AUTH);
  return data ? JSON.parse(data) : null;
}

export function setCurrentAuthUser(user) {
  if (!user) {
    localStorage.removeItem(KEYS.AUTH);
  } else {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
  }
}

// Hackathon Helpers
export function getHackathons() {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.HACKATHONS) || "[]");
}

export function getHackathonById(id) {
  const hackathons = getHackathons();
  return hackathons.find((h) => h.id === id) || null;
}

export function createHackathon(hackathonData) {
  const hackathons = getHackathons();
  const newHackathon = {
    ...hackathonData,
    id: `h_${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  hackathons.unshift(newHackathon);
  localStorage.setItem(KEYS.HACKATHONS, JSON.stringify(hackathons));
  return newHackathon;
}

// Team Request Helpers
export function getTeamRequests() {
  initStorage();
  const requests = JSON.parse(localStorage.getItem(KEYS.TEAM_REQUESTS) || "[]");
  const users = getUsers();
  const hackathons = getHackathons();

  // Populate references
  return requests.map((req) => ({
    ...req,
    postedBy: users.find((u) => u.id === req.postedBy) || req.postedBy,
    hackathon: hackathons.find((h) => h.id === req.hackathonId) || req.hackathonId
  }));
}

export function getTeamRequestById(id) {
  const requests = getTeamRequests();
  return requests.find((r) => r.id === id) || null;
}

export function createTeamRequest(data) {
  initStorage();
  const requests = JSON.parse(localStorage.getItem(KEYS.TEAM_REQUESTS) || "[]");
  const newReq = {
    id: `tr_${Date.now()}`,
    hackathonId: data.hackathonId,
    postedBy: data.postedById,
    title: data.title,
    description: data.description,
    skillsNeeded: data.skillsNeeded,
    teamSizeNeeded: Number(data.teamSizeNeeded) || 1,
    status: "Open",
    createdAt: new Date().toISOString()
  };
  requests.unshift(newReq);
  localStorage.setItem(KEYS.TEAM_REQUESTS, JSON.stringify(requests));
  return getTeamRequestById(newReq.id);
}

export function updateTeamRequestStatus(id, newStatus) {
  initStorage();
  const requests = JSON.parse(localStorage.getItem(KEYS.TEAM_REQUESTS) || "[]");
  const index = requests.findIndex((r) => r.id === id);
  if (index >= 0) {
    requests[index].status = newStatus;
    localStorage.setItem(KEYS.TEAM_REQUESTS, JSON.stringify(requests));
  }
  return getTeamRequestById(id);
}

// Response Helpers
export function getResponses() {
  initStorage();
  const responses = JSON.parse(localStorage.getItem(KEYS.RESPONSES) || "[]");
  const users = getUsers();
  const requests = getTeamRequests();

  return responses.map((res) => ({
    ...res,
    respondent: users.find((u) => u.id === res.respondentId) || res.respondentId,
    teamRequest: requests.find((r) => r.id === res.teamRequestId) || res.teamRequestId
  }));
}

export function createResponse(data) {
  initStorage();
  const responses = JSON.parse(localStorage.getItem(KEYS.RESPONSES) || "[]");
  const newRes = {
    id: `res_${Date.now()}`,
    teamRequestId: data.teamRequestId,
    respondentId: data.respondentId,
    message: data.message,
    status: "Pending",
    createdAt: new Date().toISOString()
  };
  responses.unshift(newRes);
  localStorage.setItem(KEYS.RESPONSES, JSON.stringify(responses));
  return newRes;
}

export function updateResponseStatus(responseId, newStatus) {
  initStorage();
  const responses = JSON.parse(localStorage.getItem(KEYS.RESPONSES) || "[]");
  const index = responses.findIndex((r) => r.id === responseId);
  if (index >= 0) {
    responses[index].status = newStatus;
    localStorage.setItem(KEYS.RESPONSES, JSON.stringify(responses));
  }
}

// Skill Matching Logic (MongoDB $in replication in JS)
export function getSuggestedMatches(skillsNeeded = [], currentUserId = null) {
  if (!skillsNeeded || skillsNeeded.length === 0) return [];
  const users = getUsers();

  const matches = users
    .filter((u) => u.id !== currentUserId)
    .map((user) => {
      const userSkillsLower = (user.skills || []).map((s) => s.toLowerCase());
      const overlappingSkills = skillsNeeded.filter((needed) =>
        userSkillsLower.includes(needed.toLowerCase())
      );
      
      const overlapCount = overlappingSkills.length;
      const matchScore = Math.round((overlapCount / Math.max(skillsNeeded.length, 1)) * 100);

      return {
        user,
        overlappingSkills,
        overlapCount,
        matchScore
      };
    })
    .filter((match) => match.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount || b.matchScore - a.matchScore);

  return matches;
}
