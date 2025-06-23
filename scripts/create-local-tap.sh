#!/bin/bash

# Script to create and test a local Homebrew tap
set -e

echo "🍺 Setting up local Homebrew tap for opencommit fork testing..."

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

# Create tap structure for local testing
TAP_NAME="time4wiley/opencommit"
TAP_DIR="$(brew --repository)/Library/Taps/time4wiley/homebrew-opencommit"

cleanup() {
    echo "🧹 Cleaning up..."
    brew untap "$TAP_NAME" 2>/dev/null || true
    brew uninstall opencommit 2>/dev/null || true
    rm -rf "$TAP_DIR" 2>/dev/null || true
}

trap cleanup EXIT

# Create the tap directory
mkdir -p "$TAP_DIR"

# Create a working formula for local testing
cat > "$TAP_DIR/opencommit.rb" << 'EOF'
class Opencommit < Formula
  desc "GPT CLI to auto-generate impressive commits in 1 second (fork with -hb suffix)"
  homepage "https://github.com/time4Wiley/opencommit"
  version "2.0.0-hb.1"
  license "MIT"

  depends_on "node@18"

  def install
    # For local testing, copy from the development directory
    source_dir = ENV['OPENCOMMIT_SOURCE_DIR'] || File.expand_path('../../../../../opencommit', __FILE__)
    
    if Dir.exist?(source_dir)
      puts "Using source directory: #{source_dir}"
      system "cp", "-r", "#{source_dir}/.", "."
    else
      odie "Source directory not found: #{source_dir}"
    end
    
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

print_status "Created tap directory and formula"

# Add the tap (create git repo first)
echo "📦 Adding local tap..."
cd "$TAP_DIR"
git init
git add .
git commit -m "Initial tap"
cd - > /dev/null

brew tap "$TAP_NAME" "$TAP_DIR"

print_status "Added tap: $TAP_NAME"

# Set environment variable for source directory
export OPENCOMMIT_SOURCE_DIR="$(cd ../opencommit && pwd)"

echo "🔨 Installing opencommit from local tap..."
brew install --build-from-source "$TAP_NAME/opencommit"

print_status "Installation completed"

# Test the executables
echo "🔍 Testing executables..."

if opencommit-hb --version &> /dev/null; then
    print_status "opencommit-hb executable works"
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

# Verify original names are NOT installed
if command -v opencommit &> /dev/null && [[ "$(which opencommit)" == *"/opt/homebrew/"* ]]; then
    print_warning "Original 'opencommit' command found in Homebrew (might conflict)"
else
    print_status "Original 'opencommit' command not found in Homebrew (good)"
fi

# Test configuration command
echo "⚙️  Testing configuration..."
if opencommit-hb config --help &> /dev/null; then
    print_status "Configuration command works"
else
    print_error "Configuration command failed"
    exit 1
fi

print_status "All tests passed! 🎉"
echo "The Homebrew tap installation is working correctly."
echo ""
echo "Installed commands:"
echo "  - $(which opencommit-hb)"
echo "  - $(which oc-hb)"
echo "  - $(which oco-hb)"
echo ""
echo "To use:"
echo "  opencommit-hb config set OCO_OPENAI_API_KEY=your-key"
echo "  oc-hb --help"
echo "  oco-hb" 