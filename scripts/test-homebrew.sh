#!/bin/bash

# Test script for Homebrew installation of opencommit
set -e

echo "🧪 Testing Homebrew installation of opencommit..."

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

# Check if brew is installed
if ! command -v brew &> /dev/null; then
    print_error "Homebrew is not installed. Please install it first."
    exit 1
fi

print_status "Homebrew is installed"

# Test local formula installation

cleanup() {
    echo "🧹 Cleaning up..."
    brew uninstall opencommit-local 2>/dev/null || true
}

trap cleanup EXIT

# Test the formula directly instead of creating a tap
echo "📦 Installing opencommit via Homebrew (local formula)..."
brew install --build-from-source ./Formula/opencommit-local.rb

print_status "Installation completed"

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

# Test that original names are NOT installed
if command -v opencommit &> /dev/null; then
    print_warning "Original 'opencommit' command is available (might conflict)"
else
    print_status "Original 'opencommit' command is not available (good)"
fi

# Test configuration command
echo "⚙️  Testing configuration..."
if opencommit-hb config --help &> /dev/null; then
    print_status "Configuration command works"
else
    print_error "Configuration command failed"
    exit 1
fi

# Uninstall
echo "🗑️  Uninstalling..."
brew uninstall opencommit-local

print_status "All tests passed! 🎉"
echo "The Homebrew formula is ready for distribution."
echo ""
echo "To publish:"
echo "1. Create a GitHub release with tag v2.0.0"
echo "2. Update the sha256 in Formula/opencommit.rb"
echo "3. Submit to homebrew-core or create your own tap" 