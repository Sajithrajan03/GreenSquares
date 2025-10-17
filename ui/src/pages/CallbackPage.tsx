import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [user, setUser] = useState<GitHubUser | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        setStatus('error');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        setStatus('error');
        return;
      }

      try {
        // For demonstration purposes, we'll simulate success with mock data
        // In a real app, you'd exchange the code for an access token via your backend
        console.log('Authorization code received:', code);
        
        // Mock user data for demonstration
        const mockUserData = {
          login: 'demo-user',
          name: 'Demo User',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          public_repos: 42,
          followers: 123,
          following: 56,
        };
        
        // Store mock data
        localStorage.setItem('github_access_token', 'demo-token');
        localStorage.setItem('github_user', JSON.stringify(mockUserData));
        
        setUser(mockUserData);
        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } catch (error) {
        console.error('Error during OAuth callback:', error);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-github-text mb-2">Completing sign in...</h2>
          <p className="text-github-muted">Please wait while we verify your GitHub account</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-github-text mb-2">Authentication Failed</h2>
          <p className="text-github-muted mb-4">There was an error signing you in with GitHub</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-github-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-github-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-github-text mb-2">Welcome, {user?.name || user?.login}!</h2>
        <p className="text-github-muted mb-4">Successfully signed in with GitHub</p>
        <p className="text-sm text-github-muted">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default CallbackPage;
