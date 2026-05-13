import os
import re

replacements = {
    r"@app/contexts/": "@contexts/",
    r"@app/components/": "@components/",
    r"@app/lib/": "@lib/",
    r"@app/api/": "@api/",
    r"@/app/contexts/": "@contexts/",
    r"@/app/components/": "@components/",
    r"@/app/lib/": "@lib/",
    r"@/app/api/": "@api/",
}

def fix_imports(base_dir):
    for root, dirs, files in os.walk(base_dir):
        if '.next' in dirs:
            dirs.remove('.next')
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    continue
                
                original_content = content
                for old, new in replacements.items():
                    content = content.replace(f"'{old}", f"'{new}")
                    content = content.replace(f'"{old}', f'"{new}')
                
                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed: {path}")

if __name__ == "__main__":
    fix_imports('.')
    print("Final standardization complete.")
