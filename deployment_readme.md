# Deployment Guide - Blackjack Web App

This guide covers deploying your blackjack game with the Play server on Heroku and the Vue/Quasar client on GitHub Pages.

## Architecture Overview

- **Backend (Play Server)**: Deployed on Heroku at `https://playserver-eu.herokuapp.com`
- **Frontend (Vue/Quasar PWA)**: Deployed on GitHub Pages at `https://globuli94.github.io/blackjack-wa/`
- **Repository**: Multi-project repository containing both `play-server` and `blackjack-vue` folders

## Prerequisites

- Git installed
- Heroku CLI installed and logged in (`heroku login`)
- Node.js and npm installed
- Repository: `blackjack-wa`

## Initial Setup

### 1. Configure Environment Variables

Create environment files in the `blackjack-vue` folder:

**`.env.production`** (for production builds):
```bash
VITE_API_BASE_URL=https://playserver-eu.herokuapp.com
```

**`.env.development`** (for local development):
```bash
VITE_API_BASE_URL=http://localhost:9000
```

### 2. Update Quasar Configuration

In `blackjack-vue/quasar.config.js`, ensure the `publicPath` is set:

```javascript
build: {
  publicPath: process.env.NODE_ENV === 'production' ? '/blackjack-wa/' : '/',
  vueRouterMode: 'hash',
  // ... rest of config
}
```

### 3. Install gh-pages Package

```bash
cd blackjack-vue
npm install --save-dev gh-pages
```

### 4. Add Deploy Script

Add to `blackjack-vue/package.json`:

```json
{
  "scripts": {
    "deploy": "quasar build && gh-pages -d dist/spa"
  }
}
```

## Deploying the Frontend (Vue Client)

### Deploy to GitHub Pages

From the `blackjack-vue` folder:

```bash
npm run deploy
```

This will:
1. Build the production version of your Vue app
2. Deploy it to the `gh-pages` branch
3. Make it available at `https://globuli94.github.io/blackjack-wa/`

### Enable GitHub Pages (First Time Only)

1. Go to your repository: `https://github.com/globuli94/blackjack-wa`
2. Navigate to **Settings → Pages**
3. Under **Source**, select `gh-pages` branch
4. Click **Save**

Your site will be live at: `https://globuli94.github.io/blackjack-wa/`

## Deploying the Backend (Play Server)

### Set Heroku Remote

From your repository root (where both folders are):

```bash
heroku git:remote -a playserver-eu
```

Verify the remote is set:

```bash
git remote -v
```

You should see:
```
heroku  https://git.heroku.com/playserver-eu.git (fetch)
heroku  https://git.heroku.com/playserver-eu.git (push)
```

### Deploy to Heroku

Since this is a multi-project repository, use `git subtree` to push only the `play-server` folder:

```bash
git subtree push --prefix play-server heroku main
```

If you need to force push (when branches have diverged):

```bash
git subtree split --prefix=play-server -b temp-heroku-branch
git push -f heroku temp-heroku-branch:main
git branch -D temp-heroku-branch
```

### Check Deployment Status

View live logs:
```bash
heroku logs --tail -a playserver-eu
```

Check dyno status:
```bash
heroku ps -a playserver-eu
```

Open your app:
```bash
heroku open -a playserver-eu
```

Or visit: `https://playserver-eu.herokuapp.com`

## Configuring CORS

Your Play server needs to allow requests from GitHub Pages.

### Add CORS Configuration

In your `play-server/conf/application.conf`:

```scala
play.filters.cors {
  allowedOrigins = ["https://globuli94.github.io"]
  allowedHttpMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allowedHttpHeaders = ["Accept", "Content-Type", "Origin"]
}
```

### Deploy the CORS Changes

```bash
# Commit the changes
git add play-server/conf/application.conf
git commit -m "Add CORS configuration for GitHub Pages"

# Push to Heroku
git subtree push --prefix play-server heroku main
```

## Local Development

### Running the Play Server Locally

```bash
cd play-server
sbt run
```

Server runs at: `http://localhost:9000`

### Running the Vue Client Locally

```bash
cd blackjack-vue
quasar dev
```

Client runs at: `http://localhost:8080`

The local client will automatically use `http://localhost:9000` for API calls (configured in `.env.development`).

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows CORS policy errors

**Solution**: Ensure CORS is configured in your Play server's `application.conf` and redeploy to Heroku

### Client Not Loading on GitHub Pages

**Symptom**: 404 errors or blank page

**Solution**: 
- Check that `publicPath` in `quasar.config.js` is set to `/blackjack-wa/`
- Ensure you're using hash mode: `vueRouterMode: 'hash'`
- Verify GitHub Pages is enabled and pointing to `gh-pages` branch

### API Calls Failing

**Symptom**: Network errors when trying to connect to API

**Solution**:
- Check `.env.production` has correct Heroku URL
- Verify Heroku app is running: `heroku ps -a playserver-eu`
- Check Heroku logs: `heroku logs --tail -a playserver-eu`

### Heroku Build Failures

**Symptom**: Push succeeds but app doesn't start

**Solution**:
- Check you have a `Procfile` in `play-server` folder
- Verify logs for build errors: `heroku logs -a playserver-eu`
- Ensure all dependencies are properly configured in `build.sbt`

## Quick Reference Commands

### Frontend Deployment
```bash
cd blackjack-vue
npm run deploy
```

### Backend Deployment
```bash
# From repository root
heroku git:remote -a playserver-eu
git subtree push --prefix play-server heroku main
```

### View Logs
```bash
heroku logs --tail -a playserver-eu
```

### Check Heroku Apps
```bash
heroku apps
```

### Open Deployed Apps
- Frontend: `https://globuli94.github.io/blackjack-wa/`
- Backend: `https://playserver-eu.herokuapp.com`

## Making Updates

### Updating the Frontend

1. Make changes to your Vue code
2. Test locally: `quasar dev`
3. Deploy: `npm run deploy`

### Updating the Backend

1. Make changes to your Play server code
2. Test locally: `sbt run`
3. Commit changes: `git add . && git commit -m "your message"`
4. Deploy: `git subtree push --prefix play-server heroku main`

## Notes

- The frontend and backend are deployed separately but work together
- The Vue app makes API calls to the Heroku server
- GitHub Pages hosting is free
- Heroku free tier may have limitations (check Heroku pricing)
- Always test locally before deploying to production