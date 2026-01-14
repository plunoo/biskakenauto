#!/bin/bash

echo "🔍 VERIFYING V4 AI FEATURES"
echo "=========================="
echo

echo "📋 Current Branch:"
git branch | grep "*"
echo

echo "🔍 Checking JobsPage for AI buttons:"
if grep -q "🤖 AI Diagnose" pages/JobsPage.tsx; then
    echo "✅ Found: 🤖 AI Diagnose button"
else
    echo "❌ Missing: 🤖 AI Diagnose button"
fi

if grep -q "📸 Photo" pages/JobsPage.tsx; then
    echo "✅ Found: 📸 Photo button"
else
    echo "❌ Missing: 📸 Photo button"
fi

if grep -q "AI Car Problem Solver" pages/JobsPage.tsx; then
    echo "✅ Found: AI Car Problem Solver section"
else
    echo "❌ Missing: AI Car Problem Solver section"
fi

echo

echo "🔍 Checking BlogManagementPage for AI buttons:"
if grep -q "AI Blog Writer" pages/BlogManagementPage.tsx; then
    echo "✅ Found: AI Blog Writer section"
else
    echo "❌ Missing: AI Blog Writer section"
fi

echo

echo "📂 Recent commits in v4:"
git log --oneline -3

echo
echo "🌐 Dev server should be running at: http://localhost:3000"
echo "📝 If features don't show, try:"
echo "   1. Hard refresh (Ctrl+F5)"
echo "   2. Clear browser cache"
echo "   3. Check browser console for errors"
echo
echo "✅ V4 Features verification complete!"