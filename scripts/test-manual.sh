#!/bin/bash

# Manual test script that simulates what Homebrew would do
set -e

echo "🧪 Manually testing the Homebrew-style installation..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Create temporary directory
TEMP_DIR="/tmp/opencommit-hb-test"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
mkdir -p "$TEMP_DIR/bin"

cleanup() {
    echo "🧹 Cleaning up..."
    rm -rf "$TEMP_DIR"
    # Remove from PATH if added
    export PATH=${PATH//:$TEMP_DIR\/bin/}
}

trap cleanup EXIT

print_status "Created temporary directory: $TEMP_DIR"

# Build the project
echo "🔨 Building project..."
npm run build-homebrew

print_status "Build completed"

# Copy files as Homebrew would
echo "📦 Installing files..."
cp out/cli.cjs "$TEMP_DIR/bin/opencommit-hb"
chmod +x "$TEMP_DIR/bin/opencommit-hb"

# Create symlinks
ln -s "$TEMP_DIR/bin/opencommit-hb" "$TEMP_DIR/bin/oc-hb"
ln -s "$TEMP_DIR/bin/opencommit-hb" "$TEMP_DIR/bin/oco-hb"

# Copy wasm file
mkdir -p "$TEMP_DIR/lib"
cp out/tiktoken_bg.wasm "$TEMP_DIR/lib/"

print_status "Files installed"

# Add to PATH temporarily
export PATH="$TEMP_DIR/bin:$PATH"

# Test the executables
echo "🔍 Testing executables..."

# Test main executable
if opencommit-hb --version &> /dev/null; then
    print_status "opencommit-hb executable works"
else
    print_error "opencommit-hb executable failed"
    exit 1
fi

# Test alias executables
if oc-hb --version &> /dev/null; then
    print_status "oc-hb alias works"
else
    print_error "oc-hb alias failed"
    exit 1
fi

if oco-hb --version &> /dev/null; then
    print_status "oco-hb alias works"
else
    print_error "oco-hb alias failed"
    exit 1
fi

# Test that original names are NOT available in our test path
if command -v opencommit &> /dev/null && [[ "$(which opencommit)" == "$TEMP_DIR"* ]]; then
    print_warning "Original 'opencommit' command found in test directory"
else
    print_status "Original 'opencommit' command not in test directory (good)"
fi

# Test configuration command
echo "⚙️  Testing configuration..."
if opencommit-hb config --help &> /dev/null; then
    print_status "Configuration command works"
else
    print_error "Configuration command failed"
    exit 1
fi

# Test help commands
echo "📖 Testing help commands..."
if oc-hb --help &> /dev/null; then
    print_status "oc-hb help works"
else
    print_error "oc-hb help failed"
    exit 1
fi

if oco-hb --help &> /dev/null; then
    print_status "oco-hb help works"
else
    print_error "oco-hb help failed"
    exit 1
fi

print_status "All tests passed! 🎉"
echo "The Homebrew-style installation works correctly."
echo "Files installed:"
echo "  - $TEMP_DIR/bin/opencommit-hb"
echo "  - $TEMP_DIR/bin/oc-hb -> opencommit-hb"
echo "  - $TEMP_DIR/bin/oco-hb -> opencommit-hb"
echo "  - $TEMP_DIR/lib/tiktoken_bg.wasm" 