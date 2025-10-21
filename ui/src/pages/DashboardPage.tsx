import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
}

interface UserStats {
  recentContributions: number;
  lastActivity: string | null;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

interface UserData {
  success: boolean;
  user: GitHubUser;
  stats: UserStats;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  default_branch: string;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha: string;
  download_url?: string;
}

interface FileTreeNode extends FileItem {
  children?: FileTreeNode[];
  expanded?: boolean;
  loading?: boolean;
}

// Repositories Section Component
const RepositoriesSection = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const sessionToken = localStorage.getItem('github_session_token') || localStorage.getItem('github_access_token');
        if (!sessionToken) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/repositories`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRepositories(data.repositories);
          }
        }
      } catch {
        setError('Failed to fetch repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return (
      <div className="bg-github-surface border border-github-border rounded-lg p-8 mb-8">
        <h3 className="text-xl font-bold mb-6">Your Repositories</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-github-border/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-github-surface border border-github-border rounded-lg p-8 mb-8">
      <h3 className="text-xl font-bold mb-6">Your Repositories 📚</h3>
      {error ? (
        <p className="text-red-400">{error}</p>
      ) : repositories.length === 0 ? (
        <p className="text-github-muted">No repositories found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repositories.slice(0, 6).map((repo) => (
            <div key={repo.id} className="bg-github-bg border border-github-border rounded-lg p-4 hover:border-github-green-500/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-github-green-400 truncate">{repo.name}</h4>
                {repo.private && (
                  <span className="text-xs bg-github-border/50 text-github-muted px-2 py-1 rounded">Private</span>
                )}
              </div>
              {repo.description && (
                <p className="text-sm text-github-muted mb-3 line-clamp-2">{repo.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-github-muted">
                <div className="flex items-center gap-3">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-github-green-400 rounded-full"></span>
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                </div>
                <a 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-github-green-400 hover:underline"
                >
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// File Explorer Component (VS Code-like)
const FileExplorer = ({ 
  repository, 
  onFileSelect, 
  selectedFile 
}: { 
  repository: Repository; 
  onFileSelect: (path: string, content?: string) => void;
  selectedFile: string | null;
}) => {
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const fetchDirectoryContents = async (path: string = ''): Promise<FileItem[]> => {
    const sessionToken = localStorage.getItem('github_session_token') || localStorage.getItem('github_access_token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const [owner, repo] = repository.full_name.split('/');
    
    const response = await fetch(`${backendUrl}/api/repositories/${owner}/${repo}/contents?path=${path}`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data.contents) ? data.contents : [];
    }
    return [];
  };

  const fetchFileContent = async (path: string): Promise<string> => {
    const sessionToken = localStorage.getItem('github_session_token') || localStorage.getItem('github_access_token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const [owner, repo] = repository.full_name.split('/');
    
    const response = await fetch(`${backendUrl}/api/repositories/${owner}/${repo}/contents?path=${path}`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.contents && data.contents.content) {
        return atob(data.contents.content);
      }
    }
    return '';
  };

  useEffect(() => {
    const loadRootFiles = async () => {
      try {
        const contents = await fetchDirectoryContents();
        const nodes: FileTreeNode[] = contents.map(item => ({
          ...item,
          children: item.type === 'dir' ? [] : undefined,
          expanded: false,
          loading: false,
        }));
        setFileTree(nodes);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRootFiles();
  }, [repository]);

  const toggleDirectory = async (path: string) => {
    const newExpanded = new Set(expandedPaths);
    
    if (expandedPaths.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
      
      // Load directory contents if not already loaded
      const updateTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map(node => {
          if (node.path === path && node.type === 'dir' && (!node.children || node.children.length === 0)) {
            return { ...node, loading: true };
          }
          if (node.children) {
            return { ...node, children: updateTree(node.children) };
          }
          return node;
        });
      };

      setFileTree(updateTree);

      try {
        const contents = await fetchDirectoryContents(path);
        const childNodes: FileTreeNode[] = contents.map(item => ({
          ...item,
          children: item.type === 'dir' ? [] : undefined,
          expanded: false,
          loading: false,
        }));

        const updateTreeWithContents = (nodes: FileTreeNode[]): FileTreeNode[] => {
          return nodes.map(node => {
            if (node.path === path && node.type === 'dir') {
              return { ...node, children: childNodes, loading: false };
            }
            if (node.children) {
              return { ...node, children: updateTreeWithContents(node.children) };
            }
            return node;
          });
        };

        setFileTree(updateTreeWithContents);
      } catch (error) {
        console.error('Failed to load directory contents:', error);
      }
    }
    
    setExpandedPaths(newExpanded);
  };

  const handleFileClick = async (file: FileTreeNode) => {
    if (file.type === 'file') {
      try {
        const content = await fetchFileContent(file.path);
        onFileSelect(file.path, content);
      } catch (error) {
        console.error('Failed to load file content:', error);
        onFileSelect(file.path);
      }
    }
  };

  const getFileIcon = (file: FileTreeNode) => {
    if (file.type === 'dir') {
      return expandedPaths.has(file.path) ? '📂' : '📁';
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return '🟨';
      case 'ts': case 'tsx': return '🔷';
      case 'py': return '🐍';
      case 'md': return '📝';
      case 'json': return '📋';
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼️';
      default: return '📄';
    }
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-github-border/20 cursor-pointer text-sm ${
            selectedFile === node.path ? 'bg-github-green-500/20 text-github-green-400' : 'text-github-text'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => node.type === 'dir' ? toggleDirectory(node.path) : handleFileClick(node)}
        >
          <span className="text-base">{getFileIcon(node)}</span>
          <span className="truncate">{node.name}</span>
          {node.loading && <div className="animate-spin w-3 h-3 border border-github-green-400 border-t-transparent rounded-full"></div>}
        </div>
        {node.type === 'dir' && expandedPaths.has(node.path) && node.children && (
          <div>
            {renderFileTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-github-border/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-github-border bg-github-bg">
        <h4 className="text-sm font-medium text-github-text flex items-center gap-2">
          <span>📁</span>
          {repository.name}
        </h4>
      </div>
      <div className="p-1">
        {renderFileTree(fileTree)}
      </div>
    </div>
  );
};

// Enhanced Quick Commit Modal Component with File Explorer
const QuickCommitModal = ({ onClose, onCommitSuccess }: { onClose: () => void; onCommitSuccess: () => void }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('daily-update.md');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select-repo' | 'create-commit'>('select-repo');
  const [isNewFile, setIsNewFile] = useState(true);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const sessionToken = localStorage.getItem('github_session_token') || localStorage.getItem('github_access_token');
        if (!sessionToken) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/repositories`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRepositories(data.repositories);
          }
        }
      } catch (err) {
        console.error('Failed to fetch repositories:', err);
      }
    };

    fetchRepositories();
  }, []);

  const handleFileSelect = (path: string, content?: string) => {
    setSelectedFile(path);
    setFileName(path);
    if (content !== undefined) {
      setFileContent(content);
      setIsNewFile(false);
    }
  };

  const handleCommit = async () => {
    if (!selectedRepo || !commitMessage.trim() || !fileName.trim()) return;

    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('github_session_token') || localStorage.getItem('github_access_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const [owner, repo] = selectedRepo.full_name.split('/');
      
      const response = await fetch(`${backendUrl}/api/repositories/${owner}/${repo}/commit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: fileContent || `# Daily Update\n\n${commitMessage}\n\nCommitted via GreenSquare at ${new Date().toISOString()}`,
          path: fileName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          onCommitSuccess();
        } else {
          alert('Failed to create commit: ' + data.error);
        }
      } else {
        alert('Failed to create commit');
      }
    } catch (err) {
      console.error('Commit error:', err);
      alert('Failed to create commit');
    } finally {
      setLoading(false);
    }
  };

  const createNewFile = () => {
    setSelectedFile(null);
    setFileName('daily-update.md');
    setFileContent(`# Daily Update

Keep the streak alive! 🔥

- Worked on project improvements
- Fixed bugs and optimizations
- Added new features

Committed via GreenSquare at ${new Date().toLocaleString()}`);
    setIsNewFile(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-github-surface border border-github-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-github-surface border-b border-github-border p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Quick Commit 🚀</h2>
            <button 
              onClick={onClose}
              className="text-github-muted hover:text-github-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {step === 'select-repo' ? (
            <div className="flex-1 p-6">
              <h3 className="font-medium text-github-text mb-4">Select a Repository</h3>
              <div className="space-y-2 max-h-full overflow-y-auto">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      setSelectedRepo(repo);
                      setStep('create-commit');
                    }}
                    className="w-full text-left p-3 bg-github-bg border border-github-border rounded hover:border-github-green-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-github-green-400">{repo.name}</p>
                        {repo.description && (
                          <p className="text-sm text-github-muted">{repo.description}</p>
                        )}
                      </div>
                      {repo.private && (
                        <span className="text-xs bg-github-border/50 text-github-muted px-2 py-1 rounded">Private</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* File Explorer Sidebar */}
              <div className="w-80 border-r border-github-border bg-github-bg">
                <div className="p-3 bg-github-surface border-b border-github-border">
                  <div className="flex items-center justify-between mb-2">
                    <button 
                      onClick={() => setStep('select-repo')}
                      className="text-github-green-400 hover:underline text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={createNewFile}
                      className="btn-primary px-3 py-1 text-xs"
                    >
                      + New File
                    </button>
                  </div>
                  <p className="text-sm text-github-muted">Repository: <span className="text-github-green-400">{selectedRepo?.name}</span></p>
                </div>
                {selectedRepo && (
                  <FileExplorer
                    repository={selectedRepo}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                  />
                )}
              </div>

              {/* Editor Panel */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-github-border space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-github-text mb-2">
                      Commit Message *
                    </label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Update daily streak contribution"
                      className="w-full px-3 py-2 bg-github-bg border border-github-border rounded text-github-text focus:border-github-green-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-github-text mb-2">
                      File Path {isNewFile && <span className="text-github-green-400">(New File)</span>}
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-full px-3 py-2 bg-github-bg border border-github-border rounded text-github-text focus:border-github-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 border border-github-border">
                  <Editor
                    height="100%"
                    defaultLanguage={fileName.endsWith('.md') ? 'markdown' : fileName.endsWith('.js') ? 'javascript' : fileName.endsWith('.ts') ? 'typescript' : fileName.endsWith('.py') ? 'python' : fileName.endsWith('.json') ? 'json' : 'markdown'}
                    theme="vs-dark"
                    value={fileContent}
                    onChange={(value) => setFileContent(value || '')}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: 'on',
                      renderWhitespace: 'selection',
                      selectOnLineNumbers: true,
                      automaticLayout: true,
                      wordWrap: 'on',
                      contextmenu: true,
                      cursorBlinking: 'smooth',
                      cursorStyle: 'line',
                      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                      tabSize: 2,
                      insertSpaces: true,
                    }}
                  />
                </div>

                <div className="p-4 border-t border-github-border">
                  <div className="flex gap-3">
                    <button
                      onClick={handleCommit}
                      disabled={!commitMessage.trim() || !fileName.trim() || loading}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Committing...' : 'Create Commit 🚀'}
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-secondary px-6"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get session token from URL params (from OAuth callback)
        const tokenFromUrl = searchParams.get('token');
        
        // Check for existing token in localStorage or from URL
        const sessionToken = localStorage.getItem('github_session_token') || 
                            localStorage.getItem('github_access_token') || 
                            tokenFromUrl;
        
        if (!sessionToken) {
          navigate('/');
          return;
        }

        // Store token if it came from URL
        if (tokenFromUrl) {
          localStorage.setItem('github_session_token', tokenFromUrl);
          localStorage.setItem('github_access_token', tokenFromUrl);
          // Clean up URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('user');
          window.history.replaceState({}, '', newUrl.toString());
        }

        // Fetch user data from backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${backendUrl}/api/me`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Invalid token, redirect to login
            localStorage.removeItem('github_session_token');
            localStorage.removeItem('github_access_token');
            navigate('/');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData: UserData = await response.json();
        
        if (userData.success) {
          setUser(userData.user);
          setStats(userData.stats);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate, searchParams]);

  const handleSignOut = () => {
    localStorage.removeItem('github_session_token');
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-green-500 mx-auto mb-4"></div>
          <p className="text-github-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !stats) {
    return (
      <div className="min-h-screen bg-github-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-github-text mb-2">Error Loading Dashboard</h2>
          <p className="text-github-muted mb-6">{error || 'Failed to load user data'}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
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
              <span className="text-2xl animate-pulse">🟩</span>
              <span className="text-xl font-bold text-gradient">GreenSquare</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar_url} 
                  alt={user.name || user.login}
                  className="w-8 h-8 rounded-full border-2 border-github-green-500"
                />
                <span className="font-medium">{user.name || user.login}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="btn-secondary text-sm hover:bg-red-600 hover:border-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || user.login}! 👋</h1>
          <p className="text-github-muted">Here's your GitHub activity overview</p>
        </div>

        {/* User Profile Card */}
        <div className="bg-github-surface border border-github-border rounded-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            <img 
              src={user.avatar_url} 
              alt={user.name || user.login}
              className="w-24 h-24 rounded-full border-4 border-github-green-500"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.name || user.login}</h2>
              <p className="text-github-green-400 mb-2">@{user.login}</p>
              {user.bio && (
                <p className="text-github-muted mb-3">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-github-muted">
                {user.company && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    {user.company}
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Joined {formatDate(user.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-github-green-500/10 to-github-green-600/5 border border-github-green-500/30 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-github-green-500/5 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-github-green-400">Current Streak</p>
                <div className="text-github-green-400">🔥</div>
              </div>
              <p className="text-3xl font-bold text-github-green-400">{stats.currentStreak}</p>
              <p className="text-xs text-github-muted">days</p>
            </div>
          </div>

          <div className="bg-github-surface border border-github-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-github-muted">Longest Streak</p>
              <div className="text-github-green-400">🏆</div>
            </div>
            <p className="text-3xl font-bold text-github-text">{stats.longestStreak}</p>
            <p className="text-xs text-github-muted">days</p>
          </div>

          <div className="bg-github-surface border border-github-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-github-muted">Recent Contributions</p>
              <div className="text-github-green-400">📈</div>
            </div>
            <p className="text-3xl font-bold text-github-text">{stats.recentContributions}</p>
            <p className="text-xs text-github-muted">this week</p>
          </div>

          <div className="bg-github-surface border border-github-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-github-muted">Last Activity</p>
              <div className="text-github-green-400">⏰</div>
            </div>
            <p className="text-lg font-bold text-github-text">
              {stats.lastActivity ? formatTimeAgo(stats.lastActivity) : 'No recent activity'}
            </p>
          </div>
        </div>

        {/* Profile Stats */}
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

        {/* Quick Actions */}
        <div className="bg-github-surface border border-github-border rounded-lg p-8 mb-8">
          <h3 className="text-xl font-bold mb-6">Keep Your Streak Alive! 🔥</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="btn-primary flex items-center justify-center gap-2 p-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Set Up Reminders
            </button>
            
            <a 
              href={`https://github.com/${user.login}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2 p-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              View GitHub Profile
            </a>

            <button 
              onClick={() => setShowCommitModal(true)}
              className="btn-primary flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-github-green-600 to-github-green-500 hover:from-github-green-700 hover:to-github-green-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Commit Now
            </button>
          </div>
        </div>

        {/* Repositories Section */}
        <RepositoriesSection />

        {/* Quick Commit Modal */}
        {showCommitModal && (
          <QuickCommitModal
            onClose={() => setShowCommitModal(false)}
            onCommitSuccess={() => {
              setShowCommitModal(false);
              // Refresh user data to update streak
              window.location.reload();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
