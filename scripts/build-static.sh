#!/bin/bash
# Exit on error
set -e

echo "🚀 Starting static export build..."

# Set environment variable for static export config
export STATIC_EXPORT=true

# Move API routes out of app directory so they aren't compiled during static export
if [ -d "src/app/api" ]; then
  echo "📦 Backing up API routes..."
  mv src/app/api src/api-backup
fi

# Run next build
echo "🏗️ Building Next.js application..."
npm run build

# Restore API routes
if [ -d "src/api-backup" ]; then
  echo "⏪ Restoring API routes..."
  mv src/api-backup src/app/api
fi

echo "✅ Static build completed. Exported files are in the 'out' directory."
