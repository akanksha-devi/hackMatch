import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserById, getTeamRequests, getResponses } from '../services/storageService';
import { SkillTag } from '../components/SkillTag';
import { TeamRequestCard } from '../components/TeamRequestCard';
import { 
  User as UserIcon, 
  Code2,
  Share2,
  Globe, 
  Edit3, 
  Calendar, 
  Trophy, 
  Inbox,
  Code
} from 'lucide-react';

export const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [userResponses, setUserResponses] = useState([]);

  const isOwnProfile = !id || (currentUser && currentUser.id === id);

  useEffect(() => {
    const targetId = id || currentUser?.id;
    if (targetId) {
      const u = getUserById(targetId) || currentUser;
      setProfileUser(u);

      // Fetch team requests created by user
      const allReqs = getTeamRequests();
      const myReqs = allReqs.filter((r) => {
        const posterId = typeof r.postedBy === 'object' ? r.postedBy?.id : r.postedBy;
        return posterId === targetId;
      });
      setUserRequests(myReqs);

      // Fetch responses sent by user
      const allRes = getResponses();
      const myRes = allRes.filter((res) => {
        const respId = typeof res.respondent === 'object' ? res.respondent?.id : res.respondentId;
        return respId === targetId;
      });
      setUserResponses(myRes);
    }
  }, [id, currentUser]);

  if (!profileUser) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
        <Link to="/users" className="text-indigo-400 font-semibold hover:underline">
          Browse Developers
        </Link>
      </div>
    );
  }

  const {
    name,
    email,
    bio,
    skills = [],
    experienceLevel = 'Intermediate',
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    avatarUrl,
    createdAt
  } = profileUser;

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Banner & Info */}
      <div className="glass-panel p-8 rounded-3xl border border-gray-800 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-2xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{name}</h1>
                <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {experienceLevel} Developer
                </span>
              </div>
              <p className="text-xs text-gray-400">{email}</p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Member since {new Date(createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="btn-glow px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs flex items-center gap-2 hover:brightness-110 transition-all self-start sm:self-auto"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Link>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <div className="pt-2">
            <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">{bio}</p>
          </div>
        )}

        {/* Skills List */}
        <div className="space-y-2 pt-4 border-t border-gray-800">
          <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-cyan-400" />
            Skills & Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <SkillTag key={s} name={s} size="md" isHighlight />
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-800 text-xs">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800"
            >
              <Code2 className="w-4 h-4 text-indigo-400" /> GitHub Profile
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800"
            >
              <Share2 className="w-4 h-4 text-cyan-400" /> LinkedIn
            </a>
          )}
          {portfolioUrl && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800"
            >
              <Globe className="w-4 h-4 text-purple-400" /> Portfolio Website
            </a>
          )}
        </div>
      </div>

      {/* Posted Requests by this User */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-400" />
          Team Requests Created ({userRequests.length})
        </h3>

        {userRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRequests.map((req) => (
              <TeamRequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No active team requests posted by this user.</p>
        )}
      </div>

    </div>
  );
};
