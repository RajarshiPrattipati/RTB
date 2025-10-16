#!/bin/bash
# Script to export Godot game to Web (HTML5)
# Requires Godot 4.2+ to be installed

# Check if Godot is available
if ! command -v godot &> /dev/null && ! command -v godot4 &> /dev/null; then
    echo "Error: Godot Engine not found in PATH"
    echo "Please install Godot 4.2+ from https://godotengine.org/"
    echo "Or add Godot to your PATH"
    exit 1
fi

# Use godot4 if available, otherwise use godot
GODOT_CMD="godot"
if command -v godot4 &> /dev/null; then
    GODOT_CMD="godot4"
fi

echo "Using Godot command: $GODOT_CMD"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
OUTPUT_DIR="$SCRIPT_DIR/../public/godot"

echo "Project directory: $PROJECT_DIR"
echo "Output directory: $OUTPUT_DIR"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Export the project
echo "Exporting Godot project to HTML5..."
cd "$PROJECT_DIR"

$GODOT_CMD --headless --export-release "Web" "$OUTPUT_DIR/index.html"

if [ $? -eq 0 ]; then
    echo "✓ Export successful!"
    echo "Game files exported to: $OUTPUT_DIR"
    echo ""
    echo "The following files should be available:"
    echo "  - index.html"
    echo "  - index.js"
    echo "  - index.wasm"
    echo "  - index.pck"
    echo ""
    echo "You can now run the React app and the game will be available."
else
    echo "✗ Export failed!"
    echo "Please check the Godot project for errors."
    exit 1
fi
