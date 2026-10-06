import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, Globe, Code2, Share2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SpatialIconButton } from './spatial';

export const Footer = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <footer className={`border-t pt-12 pb-8 mt-20 text-sm transition-colors duration-200 ${
      isLight
        ? 'bg-white/80 border-slate-200 text-slate-600'
        : 'bg-[#05070a] border-gray-800/60 text-gray-400'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <span className={`font-bold text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                HackMatch
              </span>
            </Link>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Empowering hackers and developers worldwide to form high-impact teams, match complementary skills, and win hackathons together.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className={`font-semibold text-sm mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/hackathons" className={`${isLight ? 'hover:text-indigo-600' : 'hover:text-indigo-400'} transition-colors`}>
                  Explore Hackathons
                </Link>
              </li>
              <li>
                <Link to="/users" className={`${isLight ? 'hover:text-indigo-600' : 'hover:text-indigo-400'} transition-colors`}>
                  Find Developers
                </Link>
              </li>
              <li>
                <Link to="/post-request" className={`${isLight ? 'hover:text-indigo-600' : 'hover:text-indigo-400'} transition-colors`}>
                  Post Team Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className={`font-semibold text-sm mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Popular Domains
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className={`${isLight ? 'hover:text-cyan-600' : 'hover:text-cyan-400'} transition-colors cursor-pointer`}>Artificial Intelligence & LLMs</span></li>
              <li><span className={`${isLight ? 'hover:text-cyan-600' : 'hover:text-cyan-400'} transition-colors cursor-pointer`}>Web3 & Decentralized Tech</span></li>
              <li><span className={`${isLight ? 'hover:text-cyan-600' : 'hover:text-cyan-400'} transition-colors cursor-pointer`}>Full-Stack Web & Mobile</span></li>
              <li><span className={`${isLight ? 'hover:text-cyan-600' : 'hover:text-cyan-400'} transition-colors cursor-pointer`}>UI/UX & Product Design</span></li>
            </ul>
          </div>

          {/* Social & Connect */}
          <div>
            <h4 className={`font-semibold text-sm mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Connect
            </h4>
            <div className="flex items-center gap-2">
              <SpatialIconButton
                as="a"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                icon={Code2}
                label="GitHub"
                size="sm"
                variant="secondary"
              />
              <SpatialIconButton
                as="a"
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                icon={Share2}
                label="Twitter / X"
                size="sm"
                variant="secondary"
              />
              <SpatialIconButton
                as="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                icon={Globe}
                label="LinkedIn"
                size="sm"
                variant="secondary"
              />
            </div>
          </div>
        </div>

        <div className={`border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-gray-800/60 text-gray-400'
        }`}>
          <p>© {new Date().getFullYear()} HackMatch. Built for hackathon builders everywhere.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Hackathons
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
