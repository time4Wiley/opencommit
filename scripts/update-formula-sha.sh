#!/bin/bash

# Script to update the SHA256 hash in the Homebrew formula
set -e

VERSION="2.0.0"
GITHUB_USER="di-sukharev"
REPO_NAME="opencommit"

echo "📥 Downloading release archive to calculate SHA256..."

# Download the archive
ARCHIVE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}/archive/refs/tags/v${VERSION}.tar.gz"
curl -L -o "/tmp/opencommit-${VERSION}.tar.gz" "$ARCHIVE_URL"

# Calculate SHA256
SHA256=$(shasum -a 256 "/tmp/opencommit-${VERSION}.tar.gz" | cut -d' ' -f1)

echo "✅ SHA256: $SHA256"

# Update the formula
sed -i.bak "s/sha256 \".*\"/sha256 \"$SHA256\"/" Formula/opencommit.rb

echo "📝 Updated Formula/opencommit.rb with new SHA256"
echo "🗑️  Cleaning up..."
rm "/tmp/opencommit-${VERSION}.tar.gz"
rm Formula/opencommit.rb.bak

echo "✨ Done! Formula is ready for distribution." 