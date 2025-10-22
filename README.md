# GreenSquares 🟩

Keep your GitHub contribution streak alive with smart reminders, streak tracking, and gamified coding habits.

## 🚀 Live Demo

- **Frontend**: [https://green-squares.vercel.app](https://green-squares.vercel.app)
- **Backend API**: [https://green-squares-backend.vercel.app](https://green-squares-backend.vercel.app)

## 📖 Features

- **Smart Reminders**: Get intelligent notifications when your streak is at risk
- **Advanced Analytics**: Beautiful insights into your coding patterns and productivity trends
- **Gamification**: Earn badges, climb leaderboards, and unlock achievements
- **Quick Actions**: One-click commit suggestions and repository shortcuts
- **File Explorer**: VS Code-like interface for browsing and editing repository files
- **Quick Commits**: Create commits directly from the dashboard with Monaco Editor

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for client-side routing
- **Monaco Editor** for code editing
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **GitHub OAuth** for authentication
- **GitHub API** for repository operations
- **CORS** configured for production

## 🏗️ Project Structure

```
GreenSquares/
├── ui/                     # Frontend React application
│   ├── src/
│   │   ├── pages/         # React pages/components
│   │   ├── assets/        # Static assets
│   │   └── main.tsx       # Application entry point
│   ├── public/            # Public assets
│   ├── package.json       # Frontend dependencies
│   └── vercel.json        # Frontend Vercel configuration
├── backend/               # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── package.json      # Backend dependencies
│   └── vercel.json       # Backend Vercel configuration
└── .github/
    └── workflows/         # GitHub Actions CI/CD
        ├── deploy-frontend.yml
        └── deploy-backend.yml
```

## 🔧 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- GitHub OAuth App created
- Git installed

### 1. Clone the Repository
```bash
git clone https://github.com/Sajithrajan03/GreenSquares.git
cd GreenSquares
```

### 2. Setup GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App with:
   - **Application name**: GreenSquares (or your preferred name)
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
3. Note down the `Client ID` and `Client Secret`

### 3. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Start the backend:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ui
npm install
```

Create `.env` file in ui directory:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_REDIRECT_URI=http://localhost:3000/auth/github/callback
```

Start the frontend:
```bash
npm run dev
```

### 5. Access the Application
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

## 🚀 Production Deployment with GitHub Actions

This project uses GitHub Actions for automated deployment to Vercel.

### Required GitHub Secrets

Set up the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

#### Vercel Configuration
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_frontend_vercel_project_id
VERCEL_BACKEND_PROJECT_ID=your_backend_vercel_project_id
```

#### Application Configuration
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Getting Vercel Configuration Values

1. **Vercel Token**: 
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token

2. **Vercel Org ID**: 
   - Run `vercel` in your project directory
   - Check `.vercel/project.json` for `orgId`

3. **Project IDs**: 
   - Frontend: Deploy ui/ directory to Vercel, get project ID from settings
   - Backend: Deploy backend/ directory to Vercel, get project ID from settings

### Deployment Workflow

The GitHub Actions workflows will automatically:

1. **Frontend Deployment** (`deploy-frontend.yml`):
   - Triggers on changes to `ui/` directory
   - Builds the React application
   - Deploys to Vercel
   - Comments on PRs with preview links

2. **Backend Deployment** (`deploy-backend.yml`):
   - Triggers on changes to `backend/` directory
   - Builds the Express application
   - Deploys to Vercel
   - Comments on PRs with API links

### Manual Deployment

If you prefer manual deployment:

#### Frontend
```bash
cd ui
npm run build
vercel --prod
```

#### Backend
```bash
cd backend
npm run build
vercel --prod
```

## 🔐 Environment Variables

### Production Frontend Environment Variables (Vercel)
```
VITE_BACKEND_URL=https://green-squares-backend.vercel.app
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_REDIRECT_URI=https://green-squares-backend.vercel.app/auth/github/callback
```

### Production Backend Environment Variables (Vercel)
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://green-squares-backend.vercel.app/auth/github/callback
FRONTEND_URL=https://green-squares.vercel.app
```

## 🔄 OAuth Flow

1. User clicks "Sign in with GitHub" on landing page
2. Redirected to GitHub OAuth authorization
3. GitHub redirects to backend with authorization code
4. Backend exchanges code for access token
5. Backend creates session and redirects to frontend dashboard
6. Frontend uses session token to make authenticated API calls
7. User can browse repositories, edit files, and create commits

## 🎯 API Endpoints

### Authentication
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - Handle OAuth callback
- `GET /api/me` - Get authenticated user data
- `POST /api/auth/clear` - Clear user session

### User & Repository Management
- `GET /api/user/:username` - Get public user data
- `GET /api/repositories` - Get user's repositories
- `GET /api/repositories/:owner/:repo/contents` - Get repository contents
- `POST /api/repositories/:owner/:repo/commit` - Create commit

### Utilities
- `GET /api/test` - Health check
- `GET /api/config` - Get configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Express.js, and TypeScript
- Deployed on Vercel
- GitHub API for repository operations
- Monaco Editor for code editing experience
- Tailwind CSS for beautiful UI design

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Sajithrajan03/GreenSquares/issues) page
2. Create a new issue with detailed information
3. Include browser console logs and network requests if applicable

---

Made with ❤️ for the developer community. Keep your GitHub squares green! 🟩
