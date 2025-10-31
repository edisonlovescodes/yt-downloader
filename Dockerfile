# Use Node.js as base image
FROM node:18-alpine

# Install Python, pip, ffmpeg, and other dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    curl

# Create virtual environment and install yt-dlp
RUN python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir yt-dlp

# Add yt-dlp to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build Next.js app
RUN npm run build

# Create downloads directory
RUN mkdir -p /tmp/downloads && chmod 777 /tmp/downloads

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
