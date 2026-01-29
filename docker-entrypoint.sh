#!/bin/sh
set -e

# Replace environment variables in JavaScript files
if [ -d "/usr/share/nginx/html/assets" ]; then
    find /usr/share/nginx/html/assets -name "*.js" -exec sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL:-https://bisadmin.rpnmore.com}|g" {} \;
fi

# Execute the main command
exec "$@"