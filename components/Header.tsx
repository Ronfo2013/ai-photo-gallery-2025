import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { NavLink as NavLinkType } from '../types';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeClass = 'bg-gray-700 text-white shadow-md shadow-teal-500/20';
  const inactiveClass = 'text-gray-300 hover:bg-gray-800 hover:text-white transform hover:-translate-y-px';
  
  return (
    <Link to={to} className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? activeClass : inactiveClass}`}>
      {children}
    </Link>
  );
};

const Header: React.FC = () => {
  const { siteSettings } = useAppContext();

  return (
    <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-teal-500/15 border-b border-gray-800/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {siteSettings.logoUrl ? (
                <img src={siteSettings.logoUrl} alt="Site Logo" className="h-8 w-auto" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <span className="text-xl font-bold text-white tracking-wider">{siteSettings.appName}</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {siteSettings.navLinks.map((link: NavLinkType) => (
                <NavLink key={link.id} to={link.to}>{link.text}</NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
