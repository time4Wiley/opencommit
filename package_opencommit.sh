#!/bin/bash

# Pin Node.js version
# volta pin node@18

# Install pkg globally
#npm install -g pkg

# Build the project
npm run build

# Package the application
npm run pkg

# Move the binary to Homebrew bin directory
mv opencommit /opt/homebrew/bin/opencommit

echo "🌕 OpenCommit has been packaged and installed successfully!"