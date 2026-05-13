import os
import re

replacements = {
    r"@/app/contexts/": "@contexts/",
    r"@/app/components/": "@components/",
    r"@/app/lib/": "@lib/",
    r"@/app/api/": "@api/",
    # Fix lingering PascalCase just in case
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

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        if '.next' in dirs:
            dirs.remove('.next')
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for old, new in replacements.items():
                    # Handle both single and double quotes
                    content = content.replace(f"'{old}", f"'{new}")
                    content = content.replace(f'"{old}', f'"{new}')
                
                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated: {path}")

if __name__ == "__main__":
    fix_imports('app')
    fix_imports('lib')
    fix_imports('sanity')
    print("Structural refactoring complete.")
