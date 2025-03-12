FROM node:22-bullseye

# Set shell options for better error handling
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Create non-root user with explicit UID/GID for better security
RUN groupadd --gid 1000 devgroup && \
    useradd --uid 1000 --gid devgroup --shell /bin/bash --create-home node && \
    mkdir -p /workspace && \
    chown -R node:devgroup /workspace

# Install essential tools with version pinning and verification
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    git=1:2.30.2-1+deb11u2 \
    curl=7.74.0-1.3+deb11u10 \
    wget=1.21-1+deb11u1 \
    ca-certificates=20210119 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    # Verify installations
    git --version && \
    curl --version && \
    wget --version

# Create workspace directory with proper permissions
WORKDIR /workspace

# Create and configure project initialization script
COPY .devcontainer/create-project.sh /usr/local/bin/create-project
RUN chmod +x /usr/local/bin/create-project && \
    # Verify script permissions and existence
    test -x /usr/local/bin/create-project

# Set environment variables
ENV TYPESCRIPT_VERSION=~5.7.0
ENV TEMPLATE_REPO=https://github.com/Luxcium/cline-ai-template.git
ENV NODE_ENV=development
ENV NPM_CONFIG_LOGLEVEL=warn

# Configure npm for non-root user
RUN mkdir -p /home/node/.npm-global && \
    chown -R node:devgroup /home/node && \
    npm config set prefix '/home/node/.npm-global' && \
    # Verify npm configuration
    npm config list

# Switch to non-root user
USER node

# Add npm global bin to PATH
ENV PATH=/home/node/.npm-global/bin:$PATH

# Verify environment setup
RUN echo "Node $(node --version)" && \
    echo "NPM $(npm --version)" && \
    echo "Git $(git --version)" && \
    # Test npm global installation
    npm install -g npm@latest && \
    npm --version

# Create workspace structure
RUN mkdir -p /workspace/projects && \
    # Verify directory permissions
    test -w /workspace/projects

# Add container startup verification script
COPY --chown=node:devgroup .devcontainer/startup-check.sh /usr/local/bin/startup-check
RUN chmod +x /usr/local/bin/startup-check

# Add startup command to verify environment
CMD ["/usr/local/bin/startup-check"]
