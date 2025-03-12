#!/bin/bash

# Exit on any error
set -e

# Function for error handling
handle_error() {
    local line_no=$1
    echo "❌ Environment check failed at line: ${line_no}"
    exit 1
}

# Set error trap
trap 'handle_error ${LINENO}' ERR

echo "🔍 Performing environment health check..."

# Check Node.js installation
echo "Checking Node.js..."
if ! node --version; then
    echo "❌ Node.js not found"
    exit 1
fi

# Check npm installation and configuration
echo "Checking npm..."
if ! npm --version; then
    echo "❌ npm not found"
    exit 1
fi

# Verify npm global directory permissions
echo "Checking npm global directory..."
if [ ! -w "$(npm config get prefix)" ]; then
    echo "❌ npm global directory not writable"
    exit 1
fi

# Check Git installation and configuration
echo "Checking Git..."
if ! git --version; then
    echo "❌ Git not found"
    exit 1
fi

# Verify workspace directory permissions
echo "Checking workspace permissions..."
if [ ! -w "/workspace" ]; then
    echo "❌ Workspace directory not writable"
    exit 1
fi

if [ ! -w "/workspace/projects" ]; then
    echo "❌ Projects directory not writable"
    exit 1
fi

# Check template script installation
echo "Checking create-project script..."
if [ ! -x "/usr/local/bin/create-project" ]; then
    echo "❌ create-project script not found or not executable"
    exit 1
fi

# Check network connectivity
echo "Checking network connectivity..."
if ! curl -s --head https://github.com > /dev/null; then
    echo "⚠️  Warning: Unable to reach GitHub"
fi
if ! npm ping > /dev/null 2>&1; then
    echo "⚠️  Warning: Unable to reach npm registry"
fi

# Check disk space
echo "Checking disk space..."
AVAILABLE_SPACE=$(df -k /workspace | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -lt 1000000 ]; then  # Less than 1GB
    echo "⚠️  Warning: Low disk space. Available: $((AVAILABLE_SPACE/1024))MB"
fi

echo "✅ Environment health check completed successfully"

# Keep container running
exec "$@"
