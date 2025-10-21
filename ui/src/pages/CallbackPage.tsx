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
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        
        const response = await fetch(`${backendUrl}/auth/github/callback?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Backend callback failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Backend callback response:', data);

        if (data.success && data.user && data.accessToken) {
          // Store authentication data
          localStorage.setItem('github_access_token', data.accessToken);
          localStorage.setItem('github_user', JSON.stringify(data.user));
          localStorage.setItem('github_session_token', data.sessionToken || data.accessToken);
          
          setUser(data.user);
          setStatus('success');

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('Invalid response from backend: missing required data');
        }
        
      } catch (error) {
        console.error('❌ Error during OAuth callback:', error);
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
