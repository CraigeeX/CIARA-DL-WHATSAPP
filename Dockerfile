# CIARA-IV MINI WhatsApp Bot Docker Configuration
FROM node:18-alpine

# Install ffmpeg for media processing
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create sessions directory
RUN mkdir -p sessions

# Set permissions
RUN chmod +x index.js

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the bot
CMD ["npm", "start"]
