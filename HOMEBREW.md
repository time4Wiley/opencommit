# Homebrew Distribution Setup

This document explains how to distribute `opencommit` via Homebrew with `-hb` suffixed executables.

## Overview

The Homebrew formula installs the following executables:
- `opencommit-hb` (main executable)
- `oc-hb` (alias)
- `oco-hb` (alias)

All executables are suffixed with `-hb` to distinguish them from other installation methods.

## Files Created

### Formula/opencommit.rb
The Homebrew formula that defines how to install opencommit. Key features:
- Installs Node.js 18 as a dependency
- Builds the project using `npm run build-homebrew`
- Creates executables with `-hb` suffix
- Includes test suite to verify installation

### scripts/test-homebrew.sh
Test script that:
- Creates a temporary Homebrew tap
- Installs the formula locally
- Tests all executables work correctly
- Verifies original names are not installed
- Cleans up after testing

### scripts/update-formula-sha.sh
Utility script to:
- Download the release archive
- Calculate SHA256 hash
- Update the formula with correct hash

## Setup Instructions

### 1. Prepare for Release

First, ensure your code is ready and create a GitHub release:

```bash
# Build and test locally
npm run build-homebrew
npm run test-homebrew

# Create a git tag and push
git tag v2.0.0
git push origin v2.0.0
```

### 2. Create GitHub Release

Create a release on GitHub with tag `v2.0.0`. This will generate the source archive that Homebrew will download.

### 3. Update Formula SHA

Run the update script to calculate and set the correct SHA256:

```bash
./scripts/update-formula-sha.sh
```

### 4. Test the Formula

Test the complete installation process:

```bash
npm run test-homebrew
```

### 5. Distribute

You have several options for distribution:

#### Option A: Submit to homebrew-core (Recommended)
```bash
# Fork homebrew-core
# Add Formula/opencommit.rb to homebrew-core/Formula/
# Submit a pull request
```

#### Option B: Create Your Own Tap
```bash
# Create a new repository called homebrew-opencommit
# Add the formula to the repository
# Users can install with: brew install di-sukharev/opencommit/opencommit
```

#### Option C: Local Development/Testing
```bash
# Users can install directly from this repository
brew install --build-from-source ./Formula/opencommit.rb
```

## Usage After Installation

After Homebrew installation, users will have these commands available:

```bash
opencommit-hb config set OCO_OPENAI_API_KEY=sk-...
opencommit-hb --version
oc-hb --help
oco-hb config
```

## Verification

To verify the installation works correctly:

```bash
# Check executables exist
which opencommit-hb
which oc-hb  
which oco-hb

# Check they work
opencommit-hb --version
oc-hb config --help
oco-hb --help

# Verify original names are NOT installed
which opencommit  # Should return nothing
which oc          # Should return nothing
which oco         # Should return nothing
```

## Troubleshooting

### Build Fails
- Ensure Node.js 18+ is available
- Check all dependencies are in package.json
- Verify `npm run build-homebrew` works locally

### Tests Fail
- Run `npm run test-homebrew` to see detailed error messages
- Check that all executables are correctly built
- Verify the wasm file is copied correctly

### SHA256 Mismatch
- Run `./scripts/update-formula-sha.sh` to recalculate
- Ensure the GitHub release exists and is accessible
- Check the download URL is correct

## Notes

- The `-hb` suffix ensures no conflicts with other installation methods
- The formula builds from source to avoid binary distribution complexities
- All Node.js dependencies are bundled in the final executable
- The tiktoken WASM file is properly included for AI functionality 