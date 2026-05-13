import os
import re

# Comprehensive mapping for all internal modules
replacements = {
    # Absolute paths with @/app/
    r"@/app/contexts/": "@contexts/",
    r"@/app/components/": "@components/",
    r"@/app/lib/": "@lib/",
    r"@/app/api/": "@api/",
    r"@/app/utils/": "@utils/",
    
    # Absolute paths with @app/ (legacy)
    r"@app/contexts/": "@contexts/",
    r"@app/components/": "@components/",
    r"@app/lib/": "@lib/",
    r"@app/api/": "@api/",
    r"@app/utils/": "@utils/",

    # Ensure kebab-case for all core modules (matching the physical files)
    "AuthContext": "auth-context",
    "CartContext": "cart-context",
    "WishlistContext": "wishlist-context",
    "ProductCard": "product-card",
    "FilterSidebar": "filter-sidebar",
    "ProductSkeleton": "product-skeleton",
    "AdminSidebar": "admin-sidebar",
    "CookieConsent": "cookie-consent",
    "Navbar": "navbar",
    "Footer": "footer",
    "MobileNav": "mobile-nav",
    "GlobalErrorBoundary": "global-error-boundary",
    "AnalyticsProvider": "analytics-provider",
    "AuthProvider": "auth-provider",
}

def fix_imports(base_dir):
    print(f"Scanning directory: {base_dir}")
    for root, dirs, files in os.walk(base_dir):
        # Skip build and dependency artifacts
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
                except Exception as e:
                    print(f"Error reading {path}: {e}")
                    continue
                
                original_content = content
                
                # First pass: Handle alias replacements within quotes
                for old, new in replacements.items():
                    # Standard imports
                    content = content.replace(f"'{old}", f"'{new}")
                    content = content.replace(f'"{old}', f'"{new}')
                    # Just the module name if it's used elsewhere (be careful)
                    # We only do this for the core modules that we RENAMED physically
                
                if content != original_content:
                    try:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Fixed: {path}")
                    except Exception as e:
                        print(f"Error writing {path}: {e}")

if __name__ == "__main__":
    # Scan everything
    fix_imports('.')
    print("Final standardization complete.")
