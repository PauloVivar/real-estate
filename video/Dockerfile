FROM node:20-bookworm

# System dependencies for Chromium (used by Remotion for rendering)
# and FFmpeg for video encoding
RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcups2 \
    libdrm2 \
    libxshmfence1 \
    fonts-liberation \
    fonts-noto-color-emoji \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Download Chrome for Remotion
RUN npx remotion browser ensure

# Copy source
COPY . .

# Create output directory
RUN mkdir -p /app/output

EXPOSE 3001

CMD ["npx", "ts-node", "--transpile-only", "server.ts"]
