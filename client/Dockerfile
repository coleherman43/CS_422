# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - serve static files
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Create startup script that generates nginx config and injects API URL
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'PORT=${PORT:-80}' >> /start.sh && \
    echo 'API_URL=${REACT_APP_API_URL:-http://localhost:5000/api}' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Inject API URL into index.html' >> /start.sh && \
    echo 'sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$API_URL|g" /usr/share/nginx/html/index.html' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Generate nginx config' >> /start.sh && \
    echo 'echo "server {" > /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "    listen $PORT;" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "    server_name _;" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "    root /usr/share/nginx/html;" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "    index index.html;" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "    location / {" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "        try_files \$uri \$uri/ /index.html;" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "    }" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'echo "}" >> /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo '' >> /start.sh && \
    echo 'echo "Starting nginx on port $PORT with API URL: $API_URL"' >> /start.sh && \
    echo 'exec nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port (Railway will set PORT env var)
EXPOSE 80

# Use startup script
CMD ["/start.sh"]

