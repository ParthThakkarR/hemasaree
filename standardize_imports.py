import os
import re

root = r'D:\hemasaree'
app_dir = os.path.join(root, 'app')

def resolve_import(current_file, import_path):
    if not import_path.startswith(('.', '..')):
        return import_path
    
    # Absolute path of the target
    current_dir = os.path.dirname(current_file)
    target_abs = os.path.normpath(os.path.join(current_dir, import_path))
    
    # Relativize from root
    try:
        rel_from_root = os.path.relpath(target_abs, root).replace('\\', '/')
    except ValueError:
        return import_path # Should not happen if everything is under root
    
    # If it's inside app/, it should be @/app/...
    # If it's outside app/, it should be @/...
    if rel_from_root.startswith('app/'):
        return '@/' + rel_from_root
    else:
        # Check if it's pointing to something like node_modules or outside
        if rel_from_root.startswith('..'):
             return import_path
        return '@/' + rel_from_root

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content

    # 1. Replace @app/ with @/app/
    # We do this globally first as it's safe
    new_content = new_content.replace("'@app/", "'@/app/")
    new_content = new_content.replace('"@app/', '"@/app/')

    # 2. & 3. Handle imports/exports specifically to be safe
    def transform_path(path, is_relative):
        if is_relative:
            return resolve_import(file_path, path)
        
        # Check @/ imports
        if path.startswith('@/') and not path.startswith('@/app/'):
            target_rel = path[2:]
            app_target = os.path.join(app_dir, target_rel.replace('/', os.sep))
            
            # Check for extensions
            found_in_app = False
            # Common extensions and index files
            checks = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']
            for ext in checks:
                test_path = app_target + ext
                if os.path.exists(test_path) and os.path.isfile(test_path):
                    found_in_app = True
                    break
                # Also check if it's a directory and has an index file
                if os.path.isdir(test_path):
                    for idx_ext in ['.ts', '.tsx', '.js', '.jsx']:
                        if os.path.exists(os.path.join(test_path, 'index' + idx_ext)):
                            found_in_app = True
                            break
                    if found_in_app: break

            if found_in_app:
                return '@/app/' + target_rel
        
        return path

    # Regex for from '...'
    def sub_from(match):
        prefix = match.group(1)
        quote = match.group(2)
        path = match.group(3)
        suffix = match.group(4)
        is_rel = path.startswith(('.', '..'))
        new_path = transform_path(path, is_rel)
        return f'{prefix}{quote}{new_path}{quote}'

    new_content = re.sub(r'(from\s+)([\'"])(.*?)([\'"])', sub_from, new_content)
    
    # Regex for side-effect imports: import '...'
    def sub_import(match):
        prefix = match.group(1)
        quote = match.group(2)
        path = match.group(3)
        suffix = match.group(4)
        is_rel = path.startswith(('.', '..'))
        new_path = transform_path(path, is_rel)
        return f'{prefix}{quote}{new_path}{quote}'

    new_content = re.sub(r'(import\s+)([\'"])(.*?)([\'"])', sub_import, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

updated_files = []
for dirpath, _, filenames in os.walk(app_dir):
    for f in filenames:
        if f.endswith(('.ts', '.tsx')):
            full_path = os.path.join(dirpath, f)
            if process_file(full_path):
                updated_files.append(full_path)

print(f"Total updated files: {len(updated_files)}")
for f in updated_files:
    print(f"Updated: {f}")
