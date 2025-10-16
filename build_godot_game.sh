#!/bin/bash
# Helper script to build and integrate Godot game with React app

echo "=========================================="
echo "  Godot Fighter - Build & Integration"
echo "=========================================="
echo ""

# Change to godot_fighter directory
cd "$(dirname "$0")/godot_fighter"

# Run the export script
./export_web.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✓ Build Complete!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm start"
    echo "  2. Navigate to http://localhost:3000"
    echo "  3. Click 'Start Game' to play the fighter!"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ✗ Build Failed"
    echo "=========================================="
    echo ""
    echo "Please check the errors above and ensure:"
    echo "  - Godot 4.2+ is installed"
    echo "  - Godot project has no errors"
    echo "  - export_presets.cfg is configured"
    echo ""
    exit 1
fi
