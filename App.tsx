import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Page, User } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import JobManagement from './pages/JobManagement';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import BulkUpload from './pages/BulkUpload';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ResumeScore from './pages/ResumeScore';
import Chat from './pages/Chat';
import Plugins from './pages/Plugins';
import Discover from './pages/Discover';
import Plans from './pages/Plans';
import { db } from './services/db';





const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(db.getUser());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    navigate('/');
  };

  const handleAuthSuccess = () => {
    setUser(db.getUser());
    navigate('/dashboard');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };


  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  if (!user && !isPublicPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isPublicPage) {
    return <Navigate to="/dashboard" replace />;
  }

  const getActivePage = () => {
    const path = location.pathname.substring(1);
    if (!path || path === '' || path === 'dashboard') return Page.Home;
    return path as Page;
  };


  return (
    <div className="flex h-screen w-full bg-[#EAEAEA] md:p-4 lg:p-6 overflow-hidden">
      {!isPublicPage && user ? (
        <div className="flex h-full w-full max-w-[1600px] bg-background-main md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto border border-white/20 relative">
          <Sidebar
            activePage={getActivePage()}
            onNavigate={(page) => navigate(`/${page}`)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            user={user}
          />

          <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
            <Header
              title={getActivePage().replace('-', ' ').toUpperCase()}
              onMenuClick={() => setIsSidebarOpen(true)}
              user={user}
            />
            <main className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-12 pb-10 no-scrollbar">
              <Routes>
                <Route path="/dashboard" element={<Dashboard onJobClick={(id) => navigate(`/candidates?jobId=${id}`)} />} />
                <Route path="/jobs" element={<JobManagement />} />
                <Route path="/candidates" element={<Candidates onCandidateClick={(id) => navigate(`/candidate-detail/${id}`)} />} />
                <Route path="/candidate-detail/:id" element={<CandidateDetail />} />
                <Route path="/bulk-upload" element={<BulkUpload />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings onUserUpdate={handleUserUpdate} />} />

                <Route path="/resume-score" element={<ResumeScore />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/plans" element={<Plans />} />

                <Route path="/plugins" element={<Plugins />} />
                <Route path="/community" element={<Navigate to="/dashboard" replace />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />

              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="w-full h-full overflow-y-auto no-scrollbar">
          <Routes>
            <Route path="/" element={<Landing onRegisterClick={() => navigate('/register')} onLoginClick={() => navigate('/login')} />} />
            <Route path="/register" element={<Register onSuccess={handleAuthSuccess} onLoginClick={() => navigate('/login')} />} />
            <Route path="/login" element={<Login onSuccess={handleAuthSuccess} onRegisterClick={() => navigate('/register')} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
