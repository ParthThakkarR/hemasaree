import os
import re

replacements = {
    r"@/app/contexts/AuthContext": "@/app/contexts/auth-context",
    r"@/app/contexts/CartContext": "@/app/contexts/cart-context",
    r"@/app/contexts/WishlistContext": "@/app/contexts/wishlist-context",
    r"@/app/components/ui/ProductCard": "@/app/components/ui/product-card",
    r"@/app/components/ui/FilterSidebar": "@/app/components/ui/filter-sidebar",
    r"@/app/components/ui/ProductSkeleton": "@/app/components/ui/product-skeleton",
    r"@/app/components/Navbar": "@/app/components/navbar",
    r"@/app/components/Footer": "@/app/components/footer",
    r"@/app/components/MobileNav": "@/app/components/mobile-nav",
    r"@/app/components/GlobalErrorBoundary": "@/app/components/global-error-boundary",
    r"@/app/components/CookieConsent": "@/app/components/cookie-consent",
    # Handle relative imports just in case
    r"\./AuthContext": "./auth-context",
    r"\.\./contexts/AuthContext": "../contexts/auth-context",
    r"\.\./\.\./contexts/AuthContext": "../../contexts/auth-context",
    r"\./CartContext": "./cart-context",
    r"\.\./contexts/CartContext": "../contexts/cart-context",
    r"\.\./\.\./contexts/CartContext": "../../contexts/cart-context",
    r"\./WishlistContext": "./wishlist-context",
    r"\.\./contexts/WishlistContext": "../contexts/wishlist-context",
    r"\.\./\.\./contexts/WishlistContext": "../../contexts/wishlist-context",
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
                    # Match imports specifically to avoid accidental replacements
                    content = re.sub(f"from ['\"]{old}['\"]", f"from '{new}'", content)
                    content = re.sub(f"import ['\"]{old}['\"]", f"import '{new}'", content)
                
                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed imports in: {path}")

if __name__ == "__main__":
    fix_imports('app')
    print("Standardization complete.")
