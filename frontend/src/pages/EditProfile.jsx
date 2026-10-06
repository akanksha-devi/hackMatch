import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { SkillChip } from '../components/SkillChip';
import { VerificationBadge } from '../components/VerificationBadge';
import { useTheme } from '../context/ThemeContext';
import { SpatialPanel, SpatialDropdown, SpatialButton, SpatialInput, SpatialTextarea } from '../components/spatial';
import { Avatar } from '../components/Avatar';
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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');
  const [skills, setSkills] = useState(user?.skills || []);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [customSkill, setCustomSkill] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.bio) setBio(user.bio);
      if (user.experienceLevel) setExperienceLevel(user.experienceLevel);
      if (user.skills) setSkills(user.skills);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      if (user.githubUrl) setGithubUrl(user.githubUrl);
      if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl);
      if (user.portfolioUrl) setPortfolioUrl(user.portfolioUrl);
    }
  }, [user]);

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
      <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
        <div>
          <h1 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Edit Profile</h1>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Update your photo, technical skills, and developer credentials</p>
        </div>

        <SpatialButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          icon={ArrowLeft}
        >
          Cancel
        </SpatialButton>
      </div>

      <SpatialPanel padding="loose" className="space-y-8">
        {/* AVATAR PHOTO UPLOAD SECTION */}
        <div className={`space-y-4 pb-6 border-b ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            <Camera className="w-4 h-4 text-purple-500" />
            Profile Picture
          </label>

          {avatarSuccess && (
            <div className={`p-3 rounded-xl border text-xs ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}>
              {avatarSuccess}
            </div>
          )}
          {avatarError && (
            <div className={`p-3 rounded-xl border text-xs ${
              isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}>
              {avatarError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <Avatar
                src={avatarUrl}
                name={name || user?.name || 'User'}
                size="2xl"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
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
                <SpatialButton
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={uploadingAvatar}
                  isLoading={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                >
                  {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                </SpatialButton>

                <SpatialButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                  icon={Trash2}
                >
                  Remove
                </SpatialButton>
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
              <label htmlFor="edit-profile-name" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Full Name *</label>
              <SpatialInput
                id="edit-profile-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Experience Level *</label>
                {isVerified && (
                  <VerificationBadge status="Verified" size="sm" />
                )}
              </div>
              <SpatialDropdown
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                options={[
                  { value: 'Beginner', label: 'Beginner' },
                  { value: 'Intermediate', label: 'Intermediate' },
                  { value: 'Advanced', label: 'Advanced' },
                ]}
                placeholder="Select Experience Level..."
              />

              {isVerified && experienceLevel !== user?.experienceLevel && (
                <p className={`text-[11px] p-2 rounded-lg border mt-1 ${
                  isLight
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : 'text-amber-400 bg-amber-950/40 border-amber-500/30'
                }`}>
                  ⚠️ Note: Changing your experience level will reset your verification status to Unverified and require re-approval by your campus admin.
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="edit-profile-bio" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Bio</label>
            <SpatialTextarea
              id="edit-profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students about your passions, hackathon achievements, and project goals..."
            />
          </div>

          {/* Skills Selection */}
          <div className="space-y-3 pt-2">
            <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <Code className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Skills & Tech Stack (Selected: {skills.length})
            </label>

            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <SkillChip
                    key={skill}
                    skill={skill}
                    variant="interactive"
                    selected={isSelected}
                    onToggle={() => toggleSkill(skill)}
                  />
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2 max-w-sm pt-1">
              <SpatialInput
                id="edit-custom-skill"
                aria-label="Add custom tech skill"
                size="sm"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom tech skill..."
              />
              <SpatialButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddCustomSkill}
                icon={Plus}
              >
                Add
              </SpatialButton>
            </div>

            {/* Custom Skills Display */}
            {skills.filter((s) => !COMMON_SKILLS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills
                  .filter((s) => !COMMON_SKILLS.includes(s))
                  .map((s) => (
                    <SkillChip
                      key={s}
                      skill={s}
                      variant="removable"
                      size="md"
                      onRemove={() => toggleSkill(s)}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            <h3 className={`text-xs uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Social & Portfolio Links</h3>

            <div className="space-y-3">
              <SpatialInput
                id="edit-github-url"
                aria-label="GitHub Profile URL"
                size="sm"
                type="url"
                icon={Code2}
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
              />

              <SpatialInput
                id="edit-linkedin-url"
                aria-label="LinkedIn Profile URL"
                size="sm"
                type="url"
                icon={Share2}
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />

              <SpatialInput
                id="edit-portfolio-url"
                aria-label="Portfolio / Personal Website URL"
                size="sm"
                type="url"
                icon={Globe}
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className={`flex items-center justify-end gap-3 pt-6 border-t ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            <SpatialButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </SpatialButton>
            <SpatialButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              icon={Save}
            >
              Save Changes
            </SpatialButton>
          </div>
        </form>
      </SpatialPanel>
    </div>
  );
};

export default EditProfile;
