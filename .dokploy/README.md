# Dokploy Configuration

This directory contains Dokploy-specific configuration files for the Biskaken Auto backend application.

## Structure

- `dokploy.json` - Main configuration for Dokploy deployment
- `README.md` - This documentation

## Deployment

The application is configured to:
- Build from `./server` directory
- Use `Dockerfile.dokploy` for containerization
- Expose port 5000
- Run in production mode with CORS configured for the frontend domain