# Lightweight Node.js image
FROM node:20-slim

# Avoid prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install yt-dlp + ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3-minimal \
        ffmpeg \
        ca-certificates \
        curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    rm -rf /var/lib/apt/lists/*

# App directory
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy app files
COPY . .

# Expose backend port
EXPOSE 8080

# Start app
CMD ["npm", "start"]
