import re

with open('src/components/ComponentViewer/ComponentViewer.vanilla.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove backslashes before dollar signs in template literals
content = content.replace('\\${', '${')
# Also replace escaped backticks
content = content.replace('\\`', '`')

with open('src/components/ComponentViewer/ComponentViewer.vanilla.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed template literals')
