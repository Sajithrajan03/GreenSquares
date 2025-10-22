import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    console.log('🔍 LandingPage: Starting authentication check...');

    try {
      // Check for error states first
      const urlParams = new URLSearchParams(location.search);
      const error = urlParams.get('error');

      if (error) {
        console.error('❌ Authentication error:', error);
        return; // Stay on landing page
      }

      // Check for existing authentication
      const token = localStorage.getItem('github_session_token');
      const accessToken = localStorage.getItem('github_access_token');
      const user = localStorage.getItem('github_user');

      console.log('🔍 Auth check results:', {
        hasToken: !!token,
        hasAccessToken: !!accessToken,
        hasUser: !!user,
        tokenValue: token ? 'present' : 'null',
        userValue: user ? user : 'null'
      });

      if ((token || accessToken) && user) {
        // User is already authenticated, redirect to dashboard
        console.log('✅ User already authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        // No authentication found, stay on landing page
        console.log('❌ No authentication found, staying on landing page');
      }
    } catch (error) {
      console.error('❌ Error during authentication check:', error);
      // In case of any error, stay on landing page
    }
  }, [navigate, location.search]);

  const authGithub = () => {
    setIsAuthenticating(true);
    // Clear any existing auth data before new authentication
    localStorage.removeItem('github_session_token');
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');

    // Redirect to backend OAuth endpoint
    window.location.href = `${backendUrl}/auth/github`;
  };

  return (
    <div className="min-h-screen hero-gradient text-github-text font-github">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 glass-effect z-50 border-b border-github-border">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse-slow drop-shadow-[0_0_8px_#39d353]">🟩</span>
            <span className="text-xl font-bold text-gradient">GreenSquare</span>
          </div>
          <div className='flex items-center gap-3'>
            <button
              className={`btn-primary text-sm ${isAuthenticating ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={authGithub}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Redirecting...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Sign in with GitHub
                </>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 lg:px-12 xl:px-16">
        <div className="w-full grid lg:grid-cols-2 gap-8 xl:gap-12 items-center">
          <div className="space-y-2 lg:max-w-none xl:pr-8 2xl:pr-16">
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-github-text to-github-muted bg-clip-text text-transparent">
                  Keep Your GitHub Streak
                </span>
                <br />
                <span className="relative">
                  <span className="text-gradient animate-gradient bg-[length:200%_200%] bg-gradient-to-r from-github-green-400 via-github-green-500 to-github-green-600">
                    Alive
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-github-green-400 to-github-green-600 rounded-full opacity-50 animate-pulse"></div>
                </span>
              </h1>
              <p className="text-base lg:text-lg xl:text-xl text-github-muted leading-relaxed">
                Turn productivity into a game. Never break your contribution streak again with
                <span className="text-github-green-400 font-semibold"> smart reminders</span>,
                <span className="text-github-green-400 font-semibold"> streak tracking</span>, and
                <span className="text-github-green-400 font-semibold"> gamified coding habits</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className={`btn-primary text-lg group ${isAuthenticating ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={authGithub}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Get Started Free
                  </>
                )}
              </button>
              <button className="btn-secondary text-lg">
                <span className="animate-pulse">✨</span>
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 xl:gap-6 pt-6 justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-github-green-500/10 to-github-green-400/10 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                <div className="relative bg-github-surface/40 backdrop-blur-sm border border-github-border/50 rounded-xl p-4 text-center hover:border-github-green-500/50 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl xl:text-3xl font-bold text-gradient animate-pulse">1000+</div>
                  <div className="text-xs xl:text-sm text-github-muted font-medium">Active Users</div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-github-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-github-green-400/10 to-github-green-600/10 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                <div className="relative bg-github-surface/40 backdrop-blur-sm border border-github-border/50 rounded-xl p-4 text-center hover:border-github-green-500/50 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl xl:text-3xl font-bold text-gradient animate-pulse" style={{ animationDelay: '0.5s' }}>50K+</div>
                  <div className="text-xs xl:text-sm text-github-muted font-medium">Streaks Saved</div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-github-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-github-green-600/10 to-github-green-500/10 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                <div className="relative bg-github-surface/40 backdrop-blur-sm border border-github-border/50 rounded-xl p-4 text-center hover:border-github-green-500/50 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl xl:text-3xl font-bold text-gradient animate-pulse" style={{ animationDelay: '1s' }}>99%</div>
                  <div className="text-xs xl:text-sm text-github-muted font-medium">Uptime</div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-github-green-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex flex-col items-center gap-4 animate-float lg:items-end xl:items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-github-green-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-github-surface/60 backdrop-blur-sm border border-github-border/50 rounded-2xl p-8">
                <div className="grid grid-cols-13 gap-2">
                  {Array.from({ length: 91 }, (_, i) => (
                    <div
                      key={i}
                      className={`contribution-square ${i < 65 ? 'filled' :
                          i < 78 ? 'partial' :
                            i < 85 ? 'light' : 'empty'
                        }`}
                      style={{ animationDelay: `${i * 5}ms` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 text-xs text-github-muted">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="contribution-square empty"></div>
                    <div className="contribution-square light"></div>
                    <div className="contribution-square partial"></div>
                    <div className="contribution-square filled"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-github-green-500/20 rounded-xl blur-lg animate-pulse"></div>
              <div className="relative bg-github-surface/60 backdrop-blur-sm border border-github-green-500/20 rounded-xl p-6 min-w-[160px]">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="text-2xl font-bold text-github-green-400">127</span>
                  </div>
                  <div className="text-sm text-github-muted font-medium">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="px-6 lg:px-12 xl:px-16">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-github-green-500/20 via-github-green-400/30 to-github-green-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-github-green-500/10 to-github-green-600/10 border border-github-green-500/30 rounded-full px-6 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-github-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-github-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-github-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-github-green-400 font-semibold tracking-wide">FEATURES</span>
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-github-text via-github-green-400 to-github-text bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                Why Choose GreenSquare?
              </span>
            </h2>
            <p className="text-xl text-github-muted max-w-3xl mx-auto leading-relaxed">
              The ultimate toolkit for maintaining your GitHub contribution streak with intelligent automation and gamification
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-github-surface/40 border border-github-border/50 rounded-lg p-6 hover:border-github-green-500/50 transition-all duration-300 hover:bg-github-surface/60">
              <div className="w-10 h-10 bg-github-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-github-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-github-text">Smart Reminders</h3>
              <p className="text-sm text-github-muted leading-relaxed">
                Get intelligent notifications when your streak is at risk. AI-powered alerts ensure you never miss a day.
              </p>
            </div>

            <div className="bg-github-surface/40 border border-github-border/50 rounded-lg p-6 hover:border-github-green-500/50 transition-all duration-300 hover:bg-github-surface/60">
              <div className="w-10 h-10 bg-github-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-github-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-github-text">Advanced Analytics</h3>
              <p className="text-sm text-github-muted leading-relaxed">
                Beautiful insights into your coding patterns, peak hours, and productivity trends with detailed charts.
              </p>
            </div>

            <div className="bg-github-surface/40 border border-github-border/50 rounded-lg p-6 hover:border-github-green-500/50 transition-all duration-300 hover:bg-github-surface/60">
              <div className="w-10 h-10 bg-github-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-github-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-github-text">Gamification</h3>
              <p className="text-sm text-github-muted leading-relaxed">
                Earn badges, climb leaderboards, and unlock achievements. Make coding a competitive and fun experience.
              </p>
            </div>

            <div className="bg-github-surface/40 border border-github-border/50 rounded-lg p-6 hover:border-github-green-500/50 transition-all duration-300 hover:bg-github-surface/60">
              <div className="w-10 h-10 bg-github-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-github-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-github-text">Quick Actions</h3>
              <p className="text-sm text-github-muted leading-relaxed">
                One-click commit suggestions and repository shortcuts to make daily contributions completely effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6 lg:px-12 xl:px-16">
        <div className="w-full text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="group flex items-center gap-2 text-github-muted hover:text-github-green-400 transition-colors duration-300 cursor-default">
              <span className="text-github-green-400">★★★★★</span>
              <span className="relative">
                Loved by developers
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-github-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </span>
            </div>
            <div className="text-github-green-400">•</div>
            <div className="group text-github-muted hover:text-github-green-400 transition-colors duration-300 cursor-default">
              <span className="relative">
                Featured on GitHub
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-github-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </span>
            </div>
            <div className="text-github-green-400">•</div>
            <div className="group text-github-muted hover:text-github-green-400 transition-colors duration-300 cursor-default">
              <span className="relative">
                Open Source
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-github-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </span>
            </div>
            <div className="text-github-green-400">•</div>
            <div className="group text-github-muted hover:text-github-green-400 transition-colors duration-300 cursor-default">
              <span className="relative">
                Privacy First
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-github-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-6 px-6 lg:px-12 xl:px-16 bg-gradient-to-b from-github-surface/50 to-github-bg text-center">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-github-text to-github-muted bg-clip-text text-transparent">
                Ready to Level Up Your
              </span>
              <br />
              <span className="text-gradient">GitHub Game?</span>
            </h2>
            <p className="text-xl text-github-muted mb-8">
              Join thousands of developers who never miss a contribution day
            </p>
          </div>

          <div className="relative inline-block">
            <div className="absolute inset-0 bg-github-green-500/20 rounded-2xl blur-2xl animate-pulse"></div>
            <button className="relative btn-primary text-xl px-12 py-6 group" onClick={authGithub}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:rotate-12 transition-transform">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Start Your Streak Journey
            </button>
          </div>

          <p className="text-sm text-github-muted mt-6">
            No credit card required • Free forever • Open source
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-github-bg to-github-bg/80 border-t border-github-border/50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-20 gap-1 h-full">
            {[...Array(400)].map((_, i) => (
              <div key={i} className="contribution-square opacity-30"></div>
            ))}
          </div>
        </div>

        <div className="relative py-4 px-8 lg:px-16 xl:px-20">
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid lg:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="text-3xl animate-pulse">🟩</span>
                    <div className="absolute inset-0 blur-sm opacity-50 animate-pulse bg-github-green-400 rounded-full"></div>
                  </div>
                  <span className="text-2xl font-bold text-gradient">GreenSquare</span>
                </div>
                <p className="text-github-muted text-lg leading-relaxed max-w-lg">
                  Keeping your GitHub contributions green, one square at a time. Transform your coding habits into streaks that matter and build consistency that leads to success.
                </p>
                <div className="flex items-center gap-2 text-sm text-github-muted">
                  <span>Built with</span>
                  <span className="text-red-400 animate-pulse">❤</span>
                  <span>for the developer community</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-github-text mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="#features" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    Features
                  </a>
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    How It Works
                  </a>
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    Documentation
                  </a>
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    API Reference
                  </a>
                </div>
              </div>

              {/* Support & Community */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-github-text mb-4">Community</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    GitHub Repository
                  </a>
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    Discord Server
                  </a>
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    Support Center
                  </a>
                  <a href="#" className="block text-github-muted hover:text-github-green-400 transition-all duration-200 hover:translate-x-1">
                    Bug Reports
                  </a>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-github-surface/60 via-github-surface/40 to-github-surface/60 backdrop-blur-sm border border-github-border/30 p-8 mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-github-green-500/5 via-transparent to-github-green-500/5"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-github-green-400 to-transparent"></div>

              <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div className="group space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-github-green-400/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative text-3xl xl:text-4xl font-bold text-gradient hover:scale-110 transition-transform duration-300 cursor-default">1,000+</div>
                  </div>
                  <div className="text-sm text-github-muted font-medium group-hover:text-github-green-400 transition-colors">Active Users</div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-github-green-400 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="group space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-github-green-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="relative text-3xl xl:text-4xl font-bold text-gradient hover:scale-110 transition-transform duration-300 cursor-default">50,000+</div>
                  </div>
                  <div className="text-sm text-github-muted font-medium group-hover:text-github-green-400 transition-colors">Tracked Commits</div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-github-green-500 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="group space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-github-green-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="relative text-3xl xl:text-4xl font-bold text-gradient hover:scale-110 transition-transform duration-300 cursor-default">365</div>
                  </div>
                  <div className="text-sm text-github-muted font-medium group-hover:text-github-green-400 transition-colors">Days Supported</div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-github-green-600 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="group space-y-3">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-github-green-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    <div className="relative text-3xl xl:text-4xl font-bold text-gradient hover:scale-110 transition-transform duration-300 cursor-default">100%</div>
                  </div>
                  <div className="text-sm text-github-muted font-medium group-hover:text-github-green-400 transition-colors">Open Source</div>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-github-green-400 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Floating particles and shooting stars animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* GitHub Green themed shooting stars with random positions */}
                <div className="absolute -top-4" style={{ left: '12%', animation: 'shootingStar1 4s infinite linear' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/30 to-github-green-400/90 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-12 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/50 to-github-green-400/95 transform rotate-45"></div>
                  </div>
                </div>

                <div className="absolute -top-4" style={{ left: '67%', animation: 'shootingStar2 5s infinite linear' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/25 to-github-green-500/85 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-14 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/45 to-github-green-500/90 transform rotate-45"></div>
                  </div>
                </div>

                <div className="absolute -top-4" style={{ left: '28%', animation: 'shootingStar3 4.5s infinite linear' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-18 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/30 to-github-green-600/80 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-13 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/40 to-github-green-600/85 transform rotate-45"></div>
                  </div>
                </div>

                <div className="absolute -top-4" style={{ left: '84%', animation: 'shootingStar4 3.8s infinite linear' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-22 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/35 to-github-green-400/90 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-16 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/50 to-github-green-400/95 transform rotate-45"></div>
                    {/* Shooting star head */}
                  </div>
                </div>

                <div className="absolute -top-4" style={{ left: '45%', animation: 'shootingStar5 4.2s infinite linear' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-19 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/28 to-github-green-500/82 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-14 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/42 to-github-green-500/87 transform rotate-45"></div>
                  </div>
                </div>

                <div className="absolute -top-4" style={{ left: '7%', animation: 'shootingStar1 6s infinite linear', animationDelay: '2s' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-14 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/25 to-github-green-600/80 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-10 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/40 to-github-green-600/85 transform rotate-45"></div>
                  </div>
                </div>

                <div className="absolute -top-4" style={{ left: '92%', animation: 'shootingStar3 5.5s infinite linear', animationDelay: '3s' }}>
                  <div className="relative">
                    {/* Shooting star tail */}
                    <div className="absolute w-17 h-0.5 bg-gradient-to-r from-transparent via-github-green-900/32 to-github-green-500/88 transform rotate-45 blur-[0.5px]"></div>
                    <div className="absolute w-11 h-0.5 bg-gradient-to-r from-transparent via-github-green-800/48 to-github-green-500/92 transform rotate-45"></div>
                  </div>
                </div>

                {/* Twinkling stars only - removed floating bubbles */}
                <div className="absolute top-8 left-1/5 w-1 h-1 bg-github-green-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-12 right-1/5 w-0.5 h-0.5 bg-github-green-500 rounded-full animate-ping opacity-40" style={{ animationDelay: '2.5s' }}></div>
                <div className="absolute top-20 right-1/2 w-1 h-1 bg-github-green-600 rounded-full animate-ping opacity-25" style={{ animationDelay: '4s' }}></div>
                <div className="absolute bottom-6 left-1/2 w-0.5 h-0.5 bg-github-green-400 rounded-full animate-ping opacity-35" style={{ animationDelay: '0.8s' }}></div>

                {/* Glowing orbs - simplified and green */}
                <div className="absolute top-4 right-8 w-2 h-2 bg-github-green-400 rounded-full opacity-10 animate-pulse blur-sm"></div>
                <div className="absolute bottom-4 left-8 w-3 h-3 bg-github-green-500 rounded-full opacity-8 animate-pulse blur-sm" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 right-4 w-1.5 h-1.5 bg-github-green-600 rounded-full opacity-12 animate-pulse blur-sm" style={{ animationDelay: '3s' }}></div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="flex flex-col lg:flex-row items-center justify-between pt-8 border-t border-github-border/30 gap-6">
              <div className="flex flex-wrap items-center gap-6 text-sm text-github-muted">
                <a href="#" className="hover:text-github-green-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-github-green-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-github-green-400 transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-github-green-400 transition-colors">Security</a>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-github-muted">© 2025 GreenSquare</span>
                <div className="flex items-center gap-3">
                  <a href="#" className="text-github-muted hover:text-github-green-400 transition-colors p-2 rounded-lg hover:bg-github-border/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a href="#" className="text-github-muted hover:text-github-green-400 transition-colors p-2 rounded-lg hover:bg-github-border/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a href="#" className="text-github-muted hover:text-github-green-400 transition-colors p-2 rounded-lg hover:bg-github-border/20">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
