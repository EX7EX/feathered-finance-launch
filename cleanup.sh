#!/bin/bash

# Step 1: Remove Vite/SPA files
echo "Removing Vite/SPA files..."
rm -f vite.config.ts
rm -f src/main.tsx
rm -f src/App.tsx
rm -f index.html

# Step 2: Clean up package.json (remove Vite and react-router-dom)
echo "Cleaning up package.json..."
npm uninstall react-router-dom vite @vitejs/plugin-react @vitejs/plugin-react-swc

# Step 3: Consolidate auth/context (use src/lib/auth.tsx as the single provider)
echo "Consolidating auth/context..."
rm -f src/contexts/AuthContext.tsx
rm -f src/contexts/AuthContext.test.tsx

# Step 4: Move/rename pages to src/pages/ (ensure Next.js conventions)
echo "Moving/renaming pages..."
mkdir -p src/pages
mv src/pages/Index.tsx src/pages/index.tsx
mv src/pages/Dashboard.tsx src/pages/dashboard.tsx
mv src/pages/Game.tsx src/pages/game.tsx
mv src/pages/Launchpad.tsx src/pages/launchpad.tsx
mv src/pages/SignIn.tsx src/pages/auth/signin.tsx
mv src/pages/SignUp.tsx src/pages/auth/signup.tsx
mv src/pages/NotFound.tsx src/pages/404.tsx
mv src/pages/Exchange/ExchangePage.tsx src/pages/exchange.tsx

# Step 5: Clean up tests (consolidate into src/tests/)
echo "Cleaning up tests..."
mkdir -p src/tests
mv src/test/setup.ts src/tests/setup.ts
rm -rf src/test

# Step 6: Update package.json scripts (remove Vite scripts)
echo "Updating package.json scripts..."
sed -i '' '/"preview": "vite preview"/d' package.json
sed -i '' '/"build:dev": "vite build --mode development"/d' package.json

echo "Cleanup and refactor complete!" 