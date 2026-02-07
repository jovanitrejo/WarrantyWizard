#!/bin/bash

# Script to convert Markdown to PDF
# Requires: pandoc or markdown-pdf

INPUT="WarrantyWizard_Test_Guide.md"
OUTPUT="WarrantyWizard_Test_Guide.pdf"

echo "📄 Creating PDF from Markdown..."

# Try pandoc first (most common)
if command -v pandoc &> /dev/null; then
    echo "Using pandoc..."
    pandoc "$INPUT" -o "$OUTPUT" \
        --pdf-engine=wkhtmltopdf \
        -V geometry:margin=1in \
        --toc \
        --toc-depth=2
    echo "✅ PDF created: $OUTPUT"
    exit 0
fi

# Try markdown-pdf
if command -v markdown-pdf &> /dev/null; then
    echo "Using markdown-pdf..."
    markdown-pdf "$INPUT" -o "$OUTPUT"
    echo "✅ PDF created: $OUTPUT"
    exit 0
fi

# Fallback: Create HTML that can be printed to PDF
echo "⚠️  PDF tools not found. Creating HTML version instead..."
cat > "${INPUT%.md}.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WarrantyWizard Test Guide</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #007bff; color: white; }
        @media print { body { max-width: 100%; } }
    </style>
</head>
<body>
EOF

# Convert markdown to HTML (basic conversion)
python3 << 'PYTHON_SCRIPT' >> "${INPUT%.md}.html"
import re
import sys

with open('WarrantyWizard_Test_Guide.md', 'r') as f:
    content = f.read()

# Basic markdown to HTML conversion
content = re.sub(r'^# (.+)$', r'<h1>\1</h1>', content, flags=re.MULTILINE)
content = re.sub(r'^## (.+)$', r'<h2>\1</h2>', content, flags=re.MULTILINE)
content = re.sub(r'^### (.+)$', r'<h3>\1</h3>', content, flags=re.MULTILINE)
content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', content)
content = re.sub(r'`(.+?)`', r'<code>\1</code>', content)
content = re.sub(r'```([^`]+)```', r'<pre><code>\1</code></pre>', content, flags=re.DOTALL)
content = re.sub(r'\n\n', r'</p><p>', content)
content = '<p>' + content + '</p>'

print(content)
PYTHON_SCRIPT

echo "</body></html>" >> "${INPUT%.md}.html"
echo "✅ HTML created: ${INPUT%.md}.html"
echo "💡 Open in browser and use Print → Save as PDF"

