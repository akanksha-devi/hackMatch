import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { SkillTag } from '../components/SkillTag';
import { 
  User, 
  Code, 
  Code2, 
  Share2, 
  Globe, 
  Save, 
  ArrowLeft, 
  Check, 
  Plus, 
  AlertCircle,
  Camera,
  Trash2,
  Upload,
  Loader2,
  BadgeCheck,
} from 'lucide-react';

const COMMON_SKILLS = [
  "React", "Python", "Node.js", "AI", "PyTorch", "UI/UX", 
  "Solidity", "TypeScript", "TailwindCSS", "Figma", "MongoDB", "Express", "Docker", "FastAPI"
];

export const EditProfile = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [skills, setSkills] = useState(user?.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
  );
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isVerified = user?.experienceVerificationStatus === 'Verified';

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarSuccess('');

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // 1. Fetch server-signed upload parameters
      const signatureData = await apiService.getAvatarUploadSignature();

      // 2. Upload photo to Cloudinary (or local fallback)
      const uploadResult = await apiService.uploadAvatarToCloudinary(file, signatureData);

      // 3. Save new avatar on backend
      const res = await apiService.updateAvatar({
        avatarUrl: uploadResult.avatarUrl,
        avatarPublicId: uploadResult.avatarPublicId,
      });

      setAvatarUrl(res.avatarUrl);
      setAvatarSuccess('Profile photo uploaded and saved successfully!');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setAvatarError(err.response?.data?.message || err.message || 'Failed to upload image.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setAvatarError('');
    setAvatarSuccess('');
    setUploadingAvatar(true);

    try {
      const res = await apiService.deleteAvatar();
      setAvatarUrl(res.avatarUrl);
      setAvatarSuccess('Profile photo removed.');
      if (refreshUser) await refreshUser();
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to remove photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (skills.length === 0) {
      setError('Please keep at least one skill in your profile.');
      return;
    }

    setSubmitting(true);
    try {
      await updateUser({
        name,
        bio,
        experienceLevel,
        skills,
        avatarUrl,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
      });

      setSuccess('Profile updated successfully!');
      if (refreshUser) await refreshUser();

      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Edit Profile</h1>
          <p className="text-xs text-gray-400">Update your photo, technical skills, and developer credentials</p>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-8">
        {/* AVATAR PHOTO UPLOAD SECTION */}
        <div className="space-y-4 pb-6 border-b border-gray-800">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-purple-400" />
            Profile Picture
          </label>

          {avatarSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              {avatarSuccess}
            </div>
          )}
          {avatarError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
              {avatarError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-purple-500/30 shadow-xl"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                </button>

                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>

              <p className="text-[11px] text-gray-500">
                Supports JPG, PNG, WebP up to 5MB. Photo is securely signed and optimized via Cloudinary.
              </p>
            </div>
          </div>
        </div>

        {/* PROFILE DETAILS FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {success}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">Experience Level *</label>
                {isVerified && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {isVerified && experienceLevel !== user?.experienceLevel && (
                <p className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30 mt-1">
                  ⚠️ Note: Changing your experience level will reset your verification status to Unverified and require re-approval by your campus admin.
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students about your passions, hackathon achievements, and project goals..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Skills Selection */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-cyan-400" />
              Skills & Tech Stack (Selected: {skills.length})
            </label>

            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2 max-w-sm pt-1">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom tech skill..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">Social & Portfolio Links</h3>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Code2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Share2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.dev"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-5 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-glow px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
