import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Mail, Lock, User, Code, Plus, ArrowRight, School } from 'lucide-react';
import { SkillChip } from '../components/SkillChip';
import apiService from '../services/apiService';
import { useTheme } from '../context/ThemeContext';
import { SpatialCard, SpatialDropdown, SpatialButton, SpatialInput, SpatialTextarea } from '../components/spatial';
import { FormErrorSummary } from '../components/common/FormErrorSummary';
import { useFormErrors } from '../hooks/useFormErrors';

const SUGGESTED_SKILLS = [
  "React", "Python", "Node.js", "AI", "PyTorch", "UI/UX", 
  "Solidity", "TypeScript", "TailwindCSS", "Figma", "MongoDB", "Express"
];

export const Signup = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [skills, setSkills] = useState(["React", "Node.js"]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    fieldErrors,
    formError,
    summaryRef,
    summaryId,
    handleFieldErrors,
    handleApiError,
    clearFieldError,
    clearAllErrors,
    scrollToTarget,
  } = useFormErrors({ navbarOffset: 88, summaryId: 'signup-error-banner' });

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await apiService.getColleges();
        if (res.success && res.colleges) {
          setColleges(res.colleges);
          if (res.colleges.length > 0) {
            setCollegeId(res.colleges[0]._id || res.colleges[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading colleges:', err);
      } finally {
        setCollegesLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
      if (fieldErrors.skills) clearFieldError('skills');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAllErrors();

    const newFieldErrors = {};

    if (!name.trim()) {
      newFieldErrors.name = 'Full Name is required.';
    }

    if (!email.trim()) {
      newFieldErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newFieldErrors.email = 'Please enter a valid email address.';
    }

    if (!collegeId) {
      newFieldErrors.collegeId = 'Please select your College / University.';
    }

    if (!password) {
      newFieldErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters long.';
    }

    if (skills.length === 0) {
      newFieldErrors.skills = 'Please select at least one skill to complete your hacker profile.';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      handleFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        collegeId,
        bio: bio.trim(),
        experienceLevel,
        skills,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      handleApiError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h2 className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Create Developer Profile</h2>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>List your skills and get matched into hackathon teams instantly</p>
        </div>

        {/* Signup Form */}
        <SpatialCard as="form" onSubmit={handleSubmit} noValidate elevation="floating" padding="large" className="space-y-5">
          {/* Error Summary Banner with live region */}
          <FormErrorSummary
            ref={summaryRef}
            id={summaryId}
            error={formError}
            fieldErrors={fieldErrors}
            onFieldClick={(fieldKey) => scrollToTarget(`signup-${fieldKey}`)}
          />

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Full Name *
              </label>
              <SpatialInput
                id="signup-name"
                name="name"
                required
                icon={User}
                value={name}
                error={fieldErrors.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) clearFieldError('name');
                }}
                placeholder="Alex Rivera"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Email Address *
              </label>
              <SpatialInput
                id="signup-email"
                name="email"
                type="email"
                required
                icon={Mail}
                value={email}
                error={fieldErrors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) clearFieldError('email');
                }}
                placeholder="alex@example.com"
              />
            </div>
          </div>

          {/* College / Institution Selector */}
          <div className="space-y-1.5" id="signup-college-section">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <label htmlFor="signup-college" className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                <School className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                Select Your College / University *
              </label>
              <span className={`text-[11px] font-normal ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Strict college-scoped team matching
              </span>
            </div>
            <SpatialDropdown
              id="signup-college"
              name="collegeId"
              value={collegeId}
              error={fieldErrors.collegeId}
              onChange={(e) => {
                setCollegeId(e.target.value);
                if (fieldErrors.collegeId) clearFieldError('collegeId');
              }}
              disabled={collegesLoading}
              fullWidth
              options={
                collegesLoading
                  ? [{ value: '', label: 'Loading institutions...' }]
                  : colleges.length === 0
                  ? [{ value: '', label: 'No active colleges available' }]
                  : colleges.map((c) => ({
                      value: c._id || c.id,
                      label: `${c.name} (${c.code || c.name})`,
                    }))
              }
              placeholder="Select Your College / University..."
              icon={School}
            />
          </div>

          {/* Password & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Password *
              </label>
              <SpatialInput
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={6}
                icon={Lock}
                value={password}
                error={fieldErrors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) clearFieldError('password');
                }}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-experience" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Experience Level
              </label>
              <SpatialDropdown
                id="signup-experience"
                name="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                fullWidth
                options={[
                  { value: 'Beginner', label: 'Beginner (1-2 Hackathons)' },
                  { value: 'Intermediate', label: 'Intermediate (3-5 Hackathons)' },
                  { value: 'Advanced', label: 'Advanced (Hackathon Veteran / Winner)' },
                ]}
                placeholder="Select Experience Level..."
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="signup-bio" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              Short Bio
            </label>
            <SpatialTextarea
              id="signup-bio"
              name="bio"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell teammates what you love building..."
            />
          </div>

          {/* Skill Selector Component */}
          <div id="signup-skills" className={`space-y-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-gray-800/60'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                <Code className="w-4 h-4 text-cyan-500" />
                Select Your Skills *
              </label>
              <span className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                {skills.length} selected
              </span>
            </div>

            {/* Suggested Skill Pills */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_SKILLS.map((sk) => {
                const isSelected = skills.includes(sk);
                return (
                  <SkillChip
                    key={sk}
                    skill={sk}
                    size="md"
                    variant="interactive"
                    selected={isSelected}
                    onToggle={() => {
                      toggleSkill(sk);
                      if (fieldErrors.skills) clearFieldError('skills');
                    }}
                  />
                );
              })}
            </div>

            {fieldErrors.skills && (
              <p id="signup-skills-error" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {fieldErrors.skills}
              </p>
            )}

            {/* Custom Skill Input */}
            <div className="flex items-center gap-2 pt-1">
              <SpatialInput
                size="sm"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Add custom skill (e.g. OpenCV, Rust)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill(e);
                  }
                }}
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

            {/* Selected Skills Tags Display */}
            {skills.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                  Active Skills ({skills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <SkillChip
                      key={s}
                      skill={s}
                      size="md"
                      variant="removable"
                      onRemove={() => setSkills(skills.filter((k) => k !== s))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-gray-800/60'}`}>
            <div className="space-y-1">
              <label htmlFor="signup-github" className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                GitHub Profile URL
              </label>
              <SpatialInput
                id="signup-github"
                name="githubUrl"
                size="sm"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="signup-linkedin" className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                LinkedIn Profile URL
              </label>
              <SpatialInput
                id="signup-linkedin"
                name="linkedinUrl"
                size="sm"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          {/* Submit Button */}
          <SpatialButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Create Account & Join
          </SpatialButton>
        </SpatialCard>

        <p className={`text-center text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Already registered?{' '}
          <Link to="/login" className={`font-semibold hover:underline ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
};
