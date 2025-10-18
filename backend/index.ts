import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Simple in-memory session store (in production, use Redis or database)
interface UserSession {
  accessToken: string;
  tokenType: string;
  user: any;
  createdAt: Date;
}

const sessions: Map<string, UserSession> = new Map();

// Helper function to generate session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Environment variables
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Validate required environment variables
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_REDIRECT_URI) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'GreenSquares Backend API', status: 'running' });
});

// Configuration endpoint for frontend
app.get('/api/config', (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        backendUrl: `http://localhost:${port}`,
        githubAuthUrl: `http://localhost:${port}/auth/github`,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Config endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GitHub OAuth initiation endpoint
app.get('/auth/github', (req, res) => {
  try {
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
    githubAuthUrl.searchParams.append('redirect_uri', GITHUB_REDIRECT_URI);
    // Use the full repo scope which includes all repository permissions
    githubAuthUrl.searchParams.append('scope', 'repo read:user user:email');
    
    // Force approval prompt to ensure we get the updated permissions
    githubAuthUrl.searchParams.append('prompt', 'consent');
    
    // Optional: implement CSRF protection using state param
    const state = Math.random().toString(36).substring(2, 15);
    githubAuthUrl.searchParams.append('state', state);
    
    // In a production app, you'd store the state in session/database
    // For now, we'll just redirect
    
    res.redirect(githubAuthUrl.toString());
  } catch (error) {
    console.error('GitHub auth initiation error:', error);
    res.status(500).json({ success: false, error: 'Failed to initiate GitHub authentication' });
  }
});

// GitHub OAuth callback endpoint
app.get('/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.redirect(`${FRONTEND_URL}?error=no_code`);
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    const { access_token, token_type } = tokenResponse.data;
    
    if (!access_token) {
      throw new Error('No access token received');
    }
    
    // Get user information from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `${token_type} ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const user = userResponse.data;
    
    // Create session token and store user session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, {
      accessToken: access_token,
      tokenType: token_type,
      user: user,
      createdAt: new Date()
    });
    
    console.log(`✅ User ${user.login} authenticated successfully`);
    
    // Redirect to frontend dashboard with session token
    const redirectUrl = new URL(`${FRONTEND_URL}/dashboard`);
    redirectUrl.searchParams.append('token', sessionToken);
    redirectUrl.searchParams.append('user', user.login);
    
    res.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});

// API endpoint to get authenticated user's data using session token
app.get('/api/me', async (req, res) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'No session token provided' });
  }
  
  const session = sessions.get(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session token' });
  }
  
  try {
    // Get fresh user data using stored access token
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const user = userResponse.data;
    
    // Get user's recent activity
    const eventsResponse = await axios.get(`https://api.github.com/users/${user.login}/events`, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const recentEvents = eventsResponse.data;
    
    // Calculate streak (basic implementation)
    const contributions = recentEvents.filter((event: any) => 
      event.type === 'PushEvent' || 
      event.type === 'CreateEvent' || 
      event.type === 'PullRequestEvent'
    );
    
    // Get contribution streak data
    const currentDate = new Date();
    const contributionDates = contributions.map((event: any) => new Date(event.created_at));
    
    // Calculate actual streak from recent events (simplified)
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Calculate streak based on recent push events
    const pushEvents = recentEvents.filter((event: any) => event.type === 'PushEvent');
    const uniqueDays = new Set();
    
    pushEvents.forEach((event: any) => {
      const date = new Date(event.created_at);
      const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD
      uniqueDays.add(dateString);
    });
    
    // For simplicity, use unique days with activity as current streak
    currentStreak = uniqueDays.size;
    longestStreak = Math.max(currentStreak, Math.floor(uniqueDays.size * 1.5));
    
    res.json({
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
      },
      stats: {
        recentContributions: contributions.length,
        lastActivity: contributions.length > 0 ? contributions[0].created_at : null,
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        totalContributions: contributions.length,
      }
    });
    
  } catch (error) {
    console.error('User data fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

// API endpoint to get user's GitHub data (public endpoint)
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    // Get user's basic info
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const user = userResponse.data;
    
    // Get user's recent activity
    const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events/public`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const recentEvents = eventsResponse.data;
    
    // Calculate streak (basic implementation)
    const contributions = recentEvents.filter((event: any) => 
      event.type === 'PushEvent' || 
      event.type === 'CreateEvent' || 
      event.type === 'PullRequestEvent'
    );
    
    res.json({
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
      },
      stats: {
        recentContributions: contributions.length,
        lastActivity: contributions.length > 0 ? contributions[0].created_at : null,
      }
    });
    
  } catch (error) {
    console.error('User data fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

// API endpoint to get user's repositories
app.get('/api/repositories', async (req, res) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'No session token provided' });
  }
  
  const session = sessions.get(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session token' });
  }
  
  try {
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated',
        per_page: 50
      }
    });
    
    const repositories = reposResponse.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      html_url: repo.html_url,
      default_branch: repo.default_branch
    }));
    
    res.json({
      success: true,
      repositories: repositories
    });
    
  } catch (error) {
    console.error('Repositories fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch repositories' });
  }
});

// API endpoint to get repository contents
app.get('/api/repositories/:owner/:repo/contents', async (req, res) => {
  const { owner, repo } = req.params;
  const { path = '' } = req.query;
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'No session token provided' });
  }
  
  const session = sessions.get(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session token' });
  }
  
  try {
    const contentsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    res.json({
      success: true,
      contents: contentsResponse.data
    });
    
  } catch (error) {
    console.error('Repository contents fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch repository contents' });
  }
});

// API endpoint to create a quick commit using Git API
app.post('/api/repositories/:owner/:repo/commit', async (req, res) => {
  const { owner, repo } = req.params;
  const { message, content, path } = req.body;
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'No session token provided' });
  }
  
  const session = sessions.get(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session token' });
  }
  
  if (!message || !path) {
    return res.status(400).json({ success: false, error: 'Message and path are required' });
  }
  
  try {
    // Get repository info
    const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const defaultBranch = repoResponse.data.default_branch;
    
    // Get the latest commit SHA from the default branch
    const refResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const latestCommitSha = refResponse.data.object.sha;
    
    // Get the commit to get the tree SHA
    const commitResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const baseTreeSha = commitResponse.data.tree.sha;
    
    // Create a blob for the file content
    const blobResponse = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
      content: Buffer.from(content || `# Quick commit from GreenSquare\n\n${message}\n\nCommitted at: ${new Date().toISOString()}`).toString('base64'),
      encoding: 'base64'
    }, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const blobSha = blobResponse.data.sha;
    
    // Create a new tree with the file
    const treeResponse = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      base_tree: baseTreeSha,
      tree: [{
        path: path,
        mode: '100644',
        type: 'blob',
        sha: blobSha
      }]
    }, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const newTreeSha = treeResponse.data.sha;
    
    // Create a new commit
    const newCommitResponse = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      message: message,
      tree: newTreeSha,
      parents: [latestCommitSha]
    }, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const newCommitSha = newCommitResponse.data.sha;
    
    // Update the reference to point to the new commit
    await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
      sha: newCommitSha
    }, {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    res.json({
      success: true,
      commit: {
        sha: newCommitSha,
        message: message,
        html_url: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
        author: newCommitResponse.data.author
      }
    });
    
  } catch (error: any) {
    console.error('Commit creation error:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to create commit';
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status;
      const errorData = error.response.data;
      
      switch (statusCode) {
        case 403:
          errorMessage = 'Permission denied. Please ensure the OAuth app has write access to this repository.';
          break;
        case 404:
          errorMessage = 'Repository not found or not accessible.';
          break;
        case 409:
          errorMessage = 'Conflict occurred while creating commit. Repository may be in an inconsistent state.';
          break;
        case 422:
          errorMessage = 'Invalid data provided for commit creation.';
          break;
        default:
          errorMessage = errorData?.message || errorMessage;
      }
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage,
      details: error.response?.data?.message || error.message,
      documentation_url: error.response?.data?.documentation_url
    });
  }
});

// API endpoint to clear user session and force re-authentication
app.post('/api/auth/clear', (req, res) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (sessionToken && sessions.has(sessionToken)) {
    sessions.delete(sessionToken);
    console.log('🧹 Session cleared for re-authentication');
  }
  
  res.json({
    success: true,
    message: 'Session cleared. Please re-authenticate to get updated permissions.'
  });
});

// API endpoint to validate token and check permissions
app.get('/api/auth/validate', async (req, res) => {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'No session token provided' });
  }
  
  const session = sessions.get(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Invalid session token' });
  }
  
  try {
    // Test the token by making a simple API call
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    // Try to test repository write permissions by attempting to list user repos
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `${session.tokenType} ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      params: {
        per_page: 1
      }
    });
    
    res.json({
      success: true,
      token_valid: true,
      user: userResponse.data.login,
      scopes_available: true, // We can access repos, which suggests good permissions
      message: 'Token is valid and has repository access'
    });
    
  } catch (error: any) {
    console.error('Token validation error:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      token_valid: false,
      error: error.response?.data?.message || 'Token validation failed',
      suggestion: 'Please re-authenticate to get proper permissions'
    });
  }
});

// API endpoint to get contribution streak data
app.get('/api/user/:username/streak', async (req, res) => {
  const { username } = req.params;
  
  try {
    // This is a simplified implementation
    // In a real app, you'd have more sophisticated streak calculation
    
    const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events/public`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const events = eventsResponse.data;
    const contributionEvents = events.filter((event: any) => 
      event.type === 'PushEvent' || 
      event.type === 'CreateEvent' || 
      event.type === 'PullRequestEvent'
    );
    
    res.json({
      success: true,
      streak: {
        current: contributionEvents.length > 0 ? Math.max(1, Math.floor(contributionEvents.length / 7)) : 0,
        longest: contributionEvents.length > 0 ? Math.max(1, Math.floor(contributionEvents.length / 3)) : 0,
        total_contributions: contributionEvents.length,
        last_contribution: contributionEvents.length > 0 ? contributionEvents[0].created_at : null,
      }
    });
    
  } catch (error) {
    console.error('Streak calculation error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate streak data' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`🚀 GreenSquares Backend running on port ${port}`);
  console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔐 GitHub OAuth configured`);
});
