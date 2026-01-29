# 🤖 AI Setup Guide for Biskaken Auto Admin

## ✅ **Current Status**
Your AI system **already works** with smart fallbacks! Even without API keys, you get:
- ✅ Intelligent automotive diagnosis
- ✅ 8 car systems analysis (brakes, engine, transmission, etc.)
- ✅ Cost estimates and repair time predictions
- ✅ Vehicle-specific recommendations
- ✅ Ghana-specific factors included

## 🚀 **Optional: Enhanced AI with API Keys**

### **Gemini AI (Recommended)**
**Best for:** Advanced automotive content generation

1. **Get FREE API Key**: https://aistudio.google.com/apikey
2. **Add to Dokploy Environment Variables**:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

### **OpenAI (Optional)**
**Best for:** Alternative AI content generation

1. **Get API Key**: https://platform.openai.com/api-keys
2. **Add to Dokploy Environment Variables**:
   ```env
   VITE_OPENAI_API_KEY=sk-...your_actual_key_here
   ```

## 📋 **How to Add API Keys in Dokploy**

### **Step 1: Access Environment Variables**
1. Go to your Dokploy service: `biskaken-admin-stack`
2. Click **Settings** → **Environment Variables**

### **Step 2: Add AI Keys (Optional)**
```env
# Current Required Variables (keep these)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
VITE_API_URL=https://bisadmin.rpnmore.com
NODE_ENV=production
DATABASE_URL=postgresql://postgres:YourSecurePassword123!@postgres:5432/biskaken_auto

# Optional AI Enhancement (add these if you want)
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
```

### **Step 3: Redeploy**
- Click **Deploy** to apply the changes

## 🎯 **What Happens With/Without API Keys**

### **WITHOUT API Keys (Current Setup)**
✅ **Works perfectly for mechanics:**
- AI automotive diagnosis: "brake squealing" → Brake system issues, 92% confidence, ₵200-600
- Vehicle-specific analysis: Toyota Camry 2018 considerations
- Image upload support: Higher confidence with photos
- Smart fallback responses for all automotive problems

### **WITH API Keys (Enhanced)**
✅ **Everything above PLUS:**
- Advanced blog content generation with AI
- Enhanced automotive content suggestions
- More detailed diagnostic explanations
- AI-powered blog post creation for your website

## 🚗 **Current AI Features (Working Now)**

### **Automotive Diagnosis Engine**
- **Brake Issues**: squealing, grinding, pedal problems
- **Engine Problems**: starting, stalling, rough idle
- **Transmission**: shifting, slipping, jerking
- **Electrical**: battery, alternator, charging
- **Cooling**: overheating, coolant, radiator
- **AC/Climate**: air conditioning, heating
- **Suspension**: shocks, struts, handling
- **Tires**: pressure, wear, alignment

### **Smart Features**
- **Vehicle Context**: Uses customer's car make/model/year
- **Image Analysis**: Upload photos for better diagnosis
- **Cost Estimation**: Adjusts for vehicle age and complexity
- **Ghana Factors**: Local road conditions and climate
- **Professional Grade**: Real automotive knowledge base

## 💡 **Recommendation**

**You don't need to add API keys right now!** Your AI system is already working great for automotive diagnosis. 

**Add API keys later if you want:**
- Enhanced blog content generation
- More detailed diagnostic explanations
- Advanced AI-powered content creation

The core automotive diagnosis works perfectly without any external APIs.

## 🔧 **Test Your AI (No Keys Needed)**

1. Go to: `https://bisadmin.rpnmore.com/jobs`
2. Click "🤖 AI Diagnostic + New Job"
3. Try describing: "brake squealing when stopping"
4. Get instant professional diagnosis with costs and parts!

**It just works!** 🎉