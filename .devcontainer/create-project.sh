#!/bin/bash

# Exit on any error
set -e

# Function for error handling
handle_error() {
    local line_no=$1
    local error_code=$2
    echo "❌ Error occurred in script at line: ${line_no}"
    case $error_code in
        1) echo "Error: Invalid arguments or project name";;
        2) echo "Error: Project directory already exists";;
        3) echo "Error: Git clone failed";;
        4) echo "Error: NPM install failed";;
        *) echo "Unknown error occurred";;
    esac
    exit $error_code
}

# Set error trap
trap 'handle_error ${LINENO} $?' ERR

# Function to check disk space
check_disk_space() {
    local required_space=1000000  # 1GB in KB
    local available_space
    available_space=$(df -k /workspace | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt "$required_space" ]; then
        echo "❌ Error: Insufficient disk space. Required: 1GB, Available: $((available_space/1024))MB"
        exit 5
    fi
}

# Function to verify git configuration
verify_git_config() {
    if ! git config --get user.name > /dev/null; then
        git config --global user.name "Template User"
        echo "⚠️  Warning: Git user.name not set, using default"
    fi
    if ! git config --get user.email > /dev/null; then
        git config --global user.email "template@example.com"
        echo "⚠️  Warning: Git user.email not set, using default"
    fi
}

# Function to verify npm registry access
verify_npm_registry() {
    if ! npm ping > /dev/null 2>&1; then
        echo "⚠️  Warning: NPM registry not accessible, using cached packages if available"
    fi
}

# Check arguments
if [ -z "$1" ]; then
    echo "❌ Error: Please provide a project name"
    echo "Usage: create-project <project-name>"
    exit 1
fi

# Validate project name
if ! [[ $1 =~ ^[a-zA-Z][-a-zA-Z0-9]*$ ]]; then
    echo "❌ Error: Invalid project name. Use only letters, numbers, and hyphens, starting with a letter"
    exit 1
fi

PROJECT_NAME="$1"
TEMPLATE_REPO="${TEMPLATE_REPO:-https://github.com/Luxcium/cline-ai-template.git}"
TYPESCRIPT_VERSION="${TYPESCRIPT_VERSION:-~5.7.0}"
RETRY_COUNT=3

echo "🔍 Running pre-flight checks..."
check_disk_space
verify_git_config
verify_npm_registry

# Check if project directory already exists
if [ -d "$PROJECT_NAME" ]; then
    echo "❌ Error: Directory $PROJECT_NAME already exists"
    exit 2
fi

echo "🚀 Creating new project: $PROJECT_NAME"

# Clone with retry logic
for i in $(seq 1 $RETRY_COUNT); do
    if git clone "$TEMPLATE_REPO" "$PROJECT_NAME" 2>/dev/null; then
        break
    fi
    if [ $i -eq $RETRY_COUNT ]; then
        echo "❌ Error: Failed to clone template after $RETRY_COUNT attempts"
        exit 3
    fi
    echo "⚠️  Clone attempt $i failed, retrying..."
    sleep $((i * 2))
done

# Enter project directory
cd "$PROJECT_NAME" || exit 1

echo "🧹 Cleaning template history..."
# Remove existing git repository
rm -rf .git

echo "📝 Initializing new git repository..."
# Initialize new git repository
git init
git add .
git commit -m "Initial commit: Project created from template"

echo "📦 Installing dependencies..."
# Install dependencies with specific TypeScript version
if ! npm install; then
    echo "❌ Error: Failed to install dependencies"
    exit 4
fi

if ! npm install -D "typescript@$TYPESCRIPT_VERSION"; then
    echo "❌ Error: Failed to install TypeScript"
    exit 4
fi

# Verify TypeScript installation
if ! npx tsc --version > /dev/null 2>&1; then
    echo "❌ Error: TypeScript installation verification failed"
    exit 4
fi

echo "
✅ Project $PROJECT_NAME created successfully!

Next steps:
  cd $PROJECT_NAME
  code .

Available commands:
  npm test        - Run tests
  npm run build   - Build the project
  npm run lint    - Check code style
  npm run docs    - Generate documentation
"
