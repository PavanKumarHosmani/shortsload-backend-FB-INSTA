# ✅ Lightweight and fully working Node.js + yt-dlp + ffmpeg setup
FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Python (full), ffmpeg, and yt-dlp (static binary)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        ffmpeg \
        ca-certificates \
        curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy app source
COPY . .

# Expose your API port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
