#!/bin/bash

# Script to test direct Homebrew formula installation
set -e

echo "🍺 Testing direct Homebrew formula installation..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

cleanup() {
    echo "🧹 Cleaning up..."
    rm -f /tmp/opencommit-test.rb
    brew uninstall opencommit-test 2>/dev/null || true
}

trap cleanup EXIT

# Create a test formula that works with the current directory
cat > /tmp/opencommit-test.rb << EOF
class OpencommitTest < Formula
  desc "GPT CLI to auto-generate impressive commits in 1 second (fork with -hb suffix)"
  homepage "https://github.com/time4Wiley/opencommit"
  url "file://$(pwd)"
  version "2.0.0-hb.1"
  license "MIT"

  depends_on "node@18"

  def install
    system "npm", "install", "--production"
    system "npm", "run", "build-homebrew"
    
    # Install the main executable with -hb suffix
    bin.install "out/cli.cjs" => "opencommit-hb"
    
    # Create symlinks for the aliases with -hb suffix
    bin.install_symlink "opencommit-hb" => "oc-hb"
    bin.install_symlink "opencommit-hb" => "oco-hb"
    
    # Install the wasm file where the executable can find it
    bin.install "out/tiktoken_bg.wasm"
    # Also install in lib for completeness
    lib.install "out/tiktoken_bg.wasm"
  end

  test do
    # Test basic functionality
    system "#{bin}/opencommit-hb", "--version"
    system "#{bin}/oc-hb", "--version"
    system "#{bin}/oco-hb", "--version"
  end
end
EOF

print_status "Created test formula"

# First, make sure we have the build ready
echo "🔨 Building project..."
npm run build-homebrew

print_status "Build completed"

# Install using the formula directly
echo "📦 Installing opencommit-test formula..."
brew install --build-from-source /tmp/opencommit-test.rb

print_status "Installation completed"

# Test the executables
echo "🔍 Testing executables..."

if opencommit-hb --version &> /dev/null; then
    print_status "opencommit-hb executable works"
    opencommit-hb --version
else
    print_error "opencommit-hb executable failed"
    exit 1
fi

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

# Test configuration command
echo "⚙️  Testing configuration..."
if opencommit-hb config --help &> /dev/null; then
    print_status "Configuration command works"
else
    print_error "Configuration command failed"
    exit 1
fi

# Run the Homebrew test suite
echo "🧪 Running Homebrew test suite..."
if brew test opencommit-test; then
    print_status "Homebrew test suite passed"
else
    print_error "Homebrew test suite failed"
    exit 1
fi

print_status "All tests passed! 🎉"
echo "The Homebrew formula installation is working correctly."
echo ""
echo "Installed commands:"
echo "  - $(which opencommit-hb)"
echo "  - $(which oc-hb)"  
echo "  - $(which oco-hb)"
echo ""
echo "Example usage:"
echo "  opencommit-hb config set OCO_OPENAI_API_KEY=your-key"
echo "  oc-hb --help"
echo "  oco-hb" 