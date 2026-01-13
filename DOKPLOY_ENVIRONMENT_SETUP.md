# 🔧 Complete Dokploy Environment Setup Guide

## 📋 Environment Variables for Full AI-Powered Blog Features

### 🎯 Required Environment Variables

Set these in your Dokploy application environment settings:

#### **Frontend Configuration (Required)**
```env
NODE_ENV=production
VITE_API_URL=https://bisadmin.rpnmore.com
VITE_APP_URL=https://biskakenauto.rpnmore.com
```

#### **AI Services (Optional - Enables AI Features)**
```env
# Gemini AI for content generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Alternative AI services (fallbacks)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

#### **Database Connection (Backend - If Deploying Backend)**
```env
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
DB_HOST=postgres
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

#### **Authentication & Security (Backend)**
```env
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d
```

#### **File Upload & Storage**
```env
# For image uploads
VITE_UPLOAD_MAX_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif

# Cloud storage (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### **CORS Configuration (Backend)**
```env
CORS_ORIGINS=https://biskakenauto.rpnmore.com,http://localhost:3000
```

## 🔑 How to Get API Keys

### 🧠 Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Copy the key and add to `VITE_GEMINI_API_KEY`

**Features Enabled:**
- ✨ AI title generation
- 📝 AI excerpt generation  
- 📄 AI full content generation
- 🎨 AI image generation (via prompts)

### 🔄 OpenAI API Key (Alternative)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create account and add payment method
3. Generate API key
4. Copy and add to `VITE_OPENAI_API_KEY`

### ☁️ Cloudinary (For Image Storage)
1. Go to [Cloudinary](https://cloudinary.com)
2. Create free account
3. Get Cloud Name, API Key, and API Secret from dashboard
4. Add to environment variables

## 🛡️ Security Best Practices

### ✅ DO:
- Use strong, unique JWT secrets (32+ characters)
- Use environment-specific database passwords
- Rotate API keys regularly
- Enable CORS only for your domains

### ❌ DON'T:
- Use default passwords in production
- Share API keys in code or public repositories
- Use weak JWT secrets
- Allow CORS from all origins (`*`)

## 📊 Feature Matrix by Environment Variables

| Feature | Required Env Vars | Status |
|---------|-------------------|---------|
| **Basic Admin Dashboard** | `NODE_ENV`, `VITE_API_URL` | ✅ Core |
| **Database Connectivity** | `DATABASE_URL`, `DB_*` | ✅ Backend |
| **AI Content Generation** | `VITE_GEMINI_API_KEY` | 🚀 Enhanced |
| **AI Image Generation** | `VITE_GEMINI_API_KEY` | 🚀 Enhanced |
| **Image Uploads** | `CLOUDINARY_*` or local storage | 📸 Media |
| **Authentication** | `JWT_SECRET` | 🔐 Security |

## 🎮 Dokploy Setup Steps

### 1. In Dokploy Dashboard:
1. Go to your application
2. Click "Environment Variables"
3. Add the variables above (start with required ones)
4. Click "Save"
5. Redeploy application

### 2. Testing Features:
```bash
# Test basic functionality
curl https://biskakenauto.rpnmore.com/health

# Test admin dashboard
# Access admin login at landing page and use proper credentials
```

### 3. Verify AI Features:
1. Login to admin dashboard
2. Go to Blog management
3. Create new post
4. Try "AI Generate" buttons for title, excerpt, content
5. Try "AI Generate" for images

## 🔄 Fallback Behavior

**Without API Keys:**
- ✅ Basic blog management works
- ✅ Manual content creation works  
- ✅ Image upload works (local files)
- ❌ AI content generation disabled
- ❌ AI image generation disabled

**With API Keys:**
- ✅ All basic features work
- ✅ AI content generation enabled
- ✅ AI image generation enabled
- ✅ Enhanced productivity features

## 🎯 Recommended Minimum Setup

For basic functionality:
```env
NODE_ENV=production
VITE_API_URL=https://bisadmin.rpnmore.com
```

For AI-powered features:
```env
NODE_ENV=production
VITE_API_URL=https://bisadmin.rpnmore.com
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## 🔧 Troubleshooting

### AI Features Not Working?
1. Check `VITE_GEMINI_API_KEY` is set correctly
2. Verify API key has permissions
3. Check browser console for errors

### Images Not Uploading?
1. Check file size limits
2. Verify allowed file types
3. Check Cloudinary configuration (if using)

### Authentication Issues?
1. Verify `JWT_SECRET` is set
2. Check CORS configuration
3. Ensure database is accessible

Your Biskaken Auto admin dashboard will have full AI capabilities once these environment variables are configured! 🚀