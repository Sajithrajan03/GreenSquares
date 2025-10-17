import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<GitHubUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('github_user');
    const token = localStorage.getItem('github_access_token');

    if (!userData || !token) {
      navigate('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-github-bg text-github-text">
      {/* Header */}
      <header className="bg-github-surface border-b border-github-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟩</span>
              <span className="text-xl font-bold text-gradient">GreenSquare</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.login}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{user.name || user.login}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || user.login}! 👋</h1>
          <p className="text-github-muted">Ready to keep your GitHub streak alive?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-github-surface border border-github-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-github-muted">Public Repositories</p>
                <p className="text-2xl font-bold text-github-green-400">{user.public_repos}</p>
              </div>
              <div className="text-github-green-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-github-surface border border-github-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-github-muted">Followers</p>
                <p className="text-2xl font-bold text-github-green-400">{user.followers}</p>
              </div>
              <div className="text-github-green-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-github-surface border border-github-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-github-muted">Following</p>
                <p className="text-2xl font-bold text-github-green-400">{user.following}</p>
              </div>
              <div className="text-github-green-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-github-surface border border-github-border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">Dashboard Coming Soon!</h2>
          <p className="text-github-muted mb-6">
            We're working hard to bring you streak tracking, analytics, and more awesome features.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Set Up Reminders
            </button>
            <button className="btn-secondary">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              View Repositories
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
