# 🚀 Deployment Setup Guide

This guide will help you set up automated deployment for GreenSquares using GitHub Actions and Vercel.

## 📋 Prerequisites

- GitHub repository with GreenSquares code
- Vercel account
- Two separate Vercel projects (one for frontend, one for backend)

## 🔧 Step 1: Create Vercel Projects

### Frontend Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `ui`
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. Deploy the project

### Backend Project
1. Create another new project
2. Import the same GitHub repository
3. Set **Root Directory** to `backend`
4. **Framework Preset**: Other
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Deploy the project

## 🔑 Step 2: Get Vercel Configuration Values

### Vercel Token
1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token value

### Organization ID
1. In your terminal, run: `npx vercel`
2. Link to your Vercel projects
3. Check `.vercel/project.json` file
4. Copy the `orgId` value

### Project IDs
1. **Frontend Project ID**: Go to your frontend project settings → General → Project ID
2. **Backend Project ID**: Go to your backend project settings → General → Project ID

## 🔐 Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following **Repository secrets**:

### Vercel Configuration
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_frontend_project_id_here
VERCEL_BACKEND_PROJECT_ID=your_backend_project_id_here
```

### GitHub OAuth Configuration
```
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

## 🌐 Step 4: Configure Production Environment Variables

### Frontend Project (Vercel Dashboard)
Go to your frontend project → Settings → Environment Variables:

```
VITE_BACKEND_URL=https://your-backend-project.vercel.app
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_REDIRECT_URI=https://your-backend-project.vercel.app/auth/github/callback
```

### Backend Project (Vercel Dashboard)
Go to your backend project → Settings → Environment Variables:

```
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=https://your-backend-project.vercel.app/auth/github/callback
FRONTEND_URL=https://your-frontend-project.vercel.app
```

## 🔄 Step 5: Update GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Edit your OAuth application
3. Update the **Authorization callback URL** to:
   ```
   https://your-backend-project.vercel.app/auth/github/callback
   ```
4. Update the **Homepage URL** to:
   ```
   https://your-frontend-project.vercel.app
   ```

## ✅ Step 6: Test the Deployment

1. Make a change to either `ui/` or `backend/` directory
2. Commit and push to the `main` branch
3. Check the **Actions** tab in your GitHub repository
4. Watch the deployment workflows run automatically
5. Verify the deployed applications work correctly

## 🛠️ Workflow Triggers

The GitHub Actions workflows are configured to trigger on:

### Frontend Deployment
- Changes to `ui/` directory
- Changes to `.github/workflows/deploy-frontend.yml`

### Backend Deployment
- Changes to `backend/` directory
- Changes to `.github/workflows/deploy-backend.yml`

## 🐛 Troubleshooting

### Common Issues

**1. "Vercel project not found"**
- Double-check your `VERCEL_PROJECT_ID` and `VERCEL_BACKEND_PROJECT_ID` in GitHub secrets
- Ensure the project IDs match the actual Vercel project IDs

**2. "Build failed"**
- Check if all environment variables are correctly set in Vercel
- Verify the build commands and output directories

**3. "OAuth authentication fails in production"**
- Ensure GitHub OAuth app callback URL matches your backend URL
- Verify all environment variables are correctly set

**4. "CORS errors in production"**
- The backend CORS configuration should already include your frontend URL
- Verify the `FRONTEND_URL` environment variable in backend

### Getting Help

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Check Vercel deployment logs
3. Verify all environment variables are correctly set
4. Ensure your OAuth app settings match your production URLs

## 🎉 Success!

Once everything is set up correctly:
- Your application will automatically deploy on every push to `main`
- Frontend changes trigger frontend deployment
- Backend changes trigger backend deployment
- Pull requests will get deployment status comments
- Your app will be live at your Vercel URLs

---

**Deployment URLs:**
- Frontend: `https://your-frontend-project.vercel.app`
- Backend API: `https://your-backend-project.vercel.app`
