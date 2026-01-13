# Firebase Authentication Setup Guide

This application uses Firebase Authentication with Single Sign-On (SSO) support for Google, Facebook, and Twitter.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase Authentication enabled in your Firebase project

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Authentication Providers

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Enable this provider
   - **Google**: Enable and configure (you'll need to provide OAuth consent screen info)
   - **Facebook**: Enable and configure (you'll need Facebook App ID and App Secret)
   - **Twitter**: Enable and configure (you'll need Twitter API Key and Secret)

### 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Configure Environment Variables

Create or update your `.env.development` and `.env.production` files in the `blackjack-vue` directory:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Important**: Replace all placeholder values with your actual Firebase configuration values.

### 5. Configure OAuth Redirect URLs

For each SSO provider (Google, Facebook, Twitter), you need to configure authorized redirect URLs:

- **Authorized JavaScript origins**: 
  - `http://localhost:8080` (for development)
  - Your production domain (e.g., `https://yourdomain.com`)

- **Authorized redirect URIs**:
  - `http://localhost:8080` (for development)
  - Your production domain (e.g., `https://yourdomain.com`)

### 6. Facebook Setup (Optional)

If using Facebook login:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Get your App ID and App Secret
5. Add these to Firebase Console > Authentication > Sign-in method > Facebook
6. Add your site URL to Facebook App Settings > Basic

### 7. Twitter Setup (Optional)

If using Twitter login:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Get your API Key and API Secret
4. Add these to Firebase Console > Authentication > Sign-in method > Twitter
5. Configure callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`

## Testing

1. Start the development server: `npm run dev`
2. Navigate to the app (should redirect to `/auth` if not logged in)
3. Try signing up with email/password
4. Try signing in with Google, Facebook, or Twitter

## Security Notes

- Never commit your `.env` files with real credentials to version control
- The `.env.example` file shows the structure but doesn't contain real values
- Keep your Firebase API keys secure
- Configure Firebase Security Rules appropriately for your use case

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Check that your `.env` files are in the correct location (`blackjack-vue/` directory)
- Restart the development server after changing environment variables

### SSO providers not working
- Verify the provider is enabled in Firebase Console
- Check that redirect URLs are configured correctly
- Ensure OAuth credentials are properly set up in the provider's developer console

### Authentication state not persisting
- Check browser console for errors
- Verify Firebase initialization is working
- Check that the auth store is being initialized in App.vue
