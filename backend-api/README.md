# Biskaken Auto Backend API

## Deployment Instructions for Dokploy

### Environment Variables Required:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_here
```

### Test Endpoints After Deployment:
- `GET /health` - Health check
- `POST /api/auth/login` - Authentication
- `GET /api/status` - API status

### Test Credentials:
- Email: `admin@biskaken.com`
- Password: `admin123`

### Deployment:
1. Create new Dokploy application
2. Point to this `backend-api` folder
3. Set domain to `bisadmin.rpnmore.com`
4. Add environment variables above
5. Deploy