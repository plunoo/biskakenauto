# Environment Variables Setup for Dokploy

This document explains how to configure environment variables in Dokploy for the Biskaken Auto Services application.

## Required Environment Variables

### Admin Login Credentials
Set these in your Dokploy environment variables:

```
ADMIN_EMAIL=admin@biskaken.com
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_NAME=Admin User
```

### JWT Configuration
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### Database
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### Application Settings
```
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com
```

## Dokploy Setup Instructions

1. **Login to Dokploy**: Navigate to your Dokploy dashboard
2. **Select your application**: Find the Biskaken Auto Services deployment
3. **Environment Variables section**: Go to the Environment Variables tab
4. **Add the variables**: Add each environment variable listed above
5. **Set Admin Password**: Make sure to set `ADMIN_PASSWORD` to a secure password
6. **Deploy**: Redeploy your application for the changes to take effect

## Admin Login After Deployment

Once deployed, you can login with:
- **Email**: The value you set for `ADMIN_EMAIL`
- **Password**: The value you set for `ADMIN_PASSWORD`

Example:
- Email: `admin@biskaken.com`
- Password: `your_secure_admin_password`

## Security Notes

1. **Change Default Password**: Always change the default admin password in production
2. **Use Strong JWT Secret**: Generate a strong random string for JWT_SECRET
3. **Database Security**: Ensure your database credentials are secure
4. **HTTPS**: Use HTTPS in production (set APP_URL to https://)

## Testing

After deployment, test the login by visiting:
```
https://your-domain.com/login
```

Login with your configured admin credentials.