import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, Globe, Code2, Share2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#05070a] border-t border-gray-800/60 pt-12 pb-8 mt-20 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <span className="font-bold text-lg text-white">HackMatch</span>
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed">
              Empowering hackers and developers worldwide to form high-impact teams, match complementary skills, and win hackathons together.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/hackathons" className="hover:text-indigo-400 transition-colors">
                  Explore Hackathons
                </Link>
              </li>
              <li>
                <Link to="/users" className="hover:text-indigo-400 transition-colors">
                  Find Developers
                </Link>
              </li>
              <li>
                <Link to="/post-request" className="hover:text-indigo-400 transition-colors">
                  Post Team Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Popular Domains</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Artificial Intelligence & LLMs</span></li>
              <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Web3 & Decentralized Tech</span></li>
              <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">Full-Stack Web & Mobile</span></li>
              <li><span className="hover:text-cyan-400 transition-colors cursor-pointer">UI/UX & Product Design</span></li>
            </ul>
          </div>

          {/* Social & Connect */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500 transition-all" title="GitHub">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500 transition-all" title="Twitter / X">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-indigo-500 transition-all" title="LinkedIn">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} HackMatch. Built for hackathon builders everywhere.</p>
          <p className="flex items-center gap-1 text-gray-500">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Hackathons
          </p>
        </div>
      </div>
    </footer>
  );
};
