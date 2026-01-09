import React from 'react';
import { NavLink } from 'react-router-dom';
import { Page, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: User | null;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, user, activePage, onNavigate }) => {
  const navItems = [
    { id: Page.Home, path: '/dashboard', label: 'Home', icon: 'home' },
    { id: Page.Chat, path: '/chat', label: 'Chat', icon: 'chat_bubble' },
    { id: Page.Discover, path: '/discover', label: 'Discover', icon: 'explore' },
    { id: Page.ResumeScore, path: '/resume-score', label: 'Resume Score', icon: 'military_tech' },
    { id: Page.Plugins, path: '/plugins', label: 'Plugins', icon: 'category' },
    { id: 'divider', path: '', label: '', icon: '' },
    { id: Page.Community, path: '/community', label: 'Community', icon: 'groups', badge: 'NEW' },
    { id: Page.Plans, path: '/plans', label: 'Plans', icon: 'crown' },
    { id: Page.Settings, path: '/settings', label: 'Settings', icon: 'settings' },
  ];


  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-primary/20 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-background-main lg:static lg:block
        lg:w-[260px] flex flex-col py-8 px-6 shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-4 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white rounded-full size-10 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-[24px]">change_history</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-text-main lg:block">Recruit<span className="font-light">AI</span></span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden size-10 rounded-xl hover:bg-blue-50 flex items-center justify-center text-text-secondary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            if (item.id === 'divider') {
              return <div key="divider" className="my-4 border-t border-text-tertiary/20" />;
            }
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group
                  ${isActive
                    ? 'bg-primary/10 text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:bg-blue-50/50 hover:text-primary'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="lg:block text-[15px] flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <NavLink to="/profile" onClick={onClose} className="flex flex-col gap-4 p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl shadow-soft cursor-pointer hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-cover bg-center border-2 border-white group-hover:border-primary transition-colors" style={{ backgroundImage: `url(${user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0d33f2&color=fff`})` }}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-main truncate">{user?.name || 'Recruiter'}</p>
                <p className="text-[11px] text-primary truncate">View Profile</p>
              </div>
            </div>
          </NavLink>

          <div className="flex gap-2 justify-start lg:px-2">
            <button
              onClick={onLogout}
              className="size-11 rounded-xl bg-white border border-blue-50 flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-red-50 shadow-soft transition-all hover:scale-105"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
