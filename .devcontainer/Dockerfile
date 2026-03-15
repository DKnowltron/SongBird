FROM mcr.microsoft.com/devcontainers/base:debian

# Install Node.js (required for Claude Code)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Claude Code globally
RUN npm install -g @anthropic-ai/claude-code
