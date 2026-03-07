
'use client';

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import "./page.css";

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Error fetching categories:", err));

    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const items = Array.isArray(d) ? d : d.products || [];
        setProducts(items);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const getImageUrl = (path?: string | null) => {
    if (!path) return `/uploads/placeholder.png`;
    let cleanPath = path.toString().trim();
    if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
      cleanPath = cleanPath.slice(1, -1);
    }
    if (cleanPath.startsWith("data:image/")) {
      if (cleanPath.includes("base64,") && cleanPath.split("base64,")[1]?.length > 10) {
        return cleanPath;
      }
      return `/uploads/placeholder.png`;
    }
    if (cleanPath.startsWith("http")) return cleanPath;
    if (cleanPath.includes("\\") || cleanPath.includes("/")) {
      const parts = cleanPath.split(/[\\\/]/);
      const filename = parts[parts.length - 1];
      return `/uploads/${filename}`;
    }
    if (cleanPath.startsWith("/")) return cleanPath;
    return `/uploads/${cleanPath}`;
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((p) => p.category?.id?.toString() === categoryId);
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-7">
              <div className="hero-badge mb-3">
                <Sparkles size={14} />
                <span>Handcrafted with Love</span>
              </div>
              <h1 className="hero-title">
                Discover Timeless<br />
                <span className="text-gradient">Elegance</span>
              </h1>
              <p className="hero-description">
                Explore our exquisite collection of handwoven sarees, crafted for every occasion.
                From silk to cotton, find the perfect drape that tells your story.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link href="/products" className="btn btn-brand btn-lg px-4">
                  Shop Collection <ArrowRight size={18} className="ms-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find the perfect saree for every occasion</p>
          </div>
          <div className="row g-4 justify-content-center">
            {categories.map((c) => (
              <div key={c.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className={`category-card card-hover ${
                    selectedCategory === c.id.toString() ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(
                    selectedCategory === c.id.toString() ? null : c.id.toString()
                  )}
                  role="button"
                >
                  <img
                    src={getImageUrl(c.image || c.categoryImage)}
                    alt={c.name || c.categoryName}
                    className="category-img"
                    onError={(e) => {
                      e.currentTarget.src = "/uploads/placeholder.png";
                    }}
                  />
                  <div className="category-overlay">
                    <h5 className="mb-1">{c.name || c.categoryName}</h5>
                    <span className="category-cta">
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtered Products by Category */}
      {selectedCategory && (
        <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title">
                {categories.find((c) => c.id.toString() === selectedCategory)?.name ||
                  categories.find((c) => c.id.toString() === selectedCategory)?.categoryName ||
                  "Selected Category"}
              </h2>
            </div>
            <div className="row g-4">
              {getProductsByCategory(selectedCategory).length ? (
                getProductsByCategory(selectedCategory).map((p) => {
                  let imgSrc: string | undefined;
                  if (Array.isArray(p.images) && p.images.length > 0) {
                    if (p.images.length >= 2 && p.images[0].startsWith("data:image/") && !p.images[0].includes(",")) {
                      imgSrc = p.images[0] + "," + p.images[1];
                    } else {
                      imgSrc = p.images[0];
                    }
                  } else if (typeof p.images === "string") {
                    imgSrc = p.images;
                  }

                  return (
                    <div key={p.id} className="col-6 col-md-4 col-lg-3">
                      <Link href={`/product/${p.id}`} className="text-decoration-none">
                        <div className="product-card card-hover">
                          <div className="product-img-wrap">
                            <img
                              src={getImageUrl(imgSrc)}
                              alt={p.name}
                              className="product-image"
                              onError={(e) => {
                                e.currentTarget.src = "/uploads/placeholder.png";
                              }}
                            />
                          </div>
                          <div className="product-info">
                            <h6 className="product-name">{p.name}</h6>
                            {p.price && (
                              <p className="product-price">₹{Number(p.price).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="col-12">
                  <p className="text-center text-muted py-4">
                    No products found for this category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!selectedCategory && featuredProducts.length > 0 && (
        <section className="py-5" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="section-title">Our Collection</h2>
              <p className="section-subtitle">Handpicked sarees you&apos;ll love</p>
            </div>
            <div className="row g-4">
              {featuredProducts.map((p) => {
                let imgSrc: string | undefined;
                if (Array.isArray(p.images) && p.images.length > 0) {
                  if (p.images.length >= 2 && p.images[0].startsWith("data:image/") && !p.images[0].includes(",")) {
                    imgSrc = p.images[0] + "," + p.images[1];
                  } else {
                    imgSrc = p.images[0];
                  }
                } else if (typeof p.images === "string") {
                  imgSrc = p.images;
                }

                return (
                  <div key={p.id} className="col-6 col-md-4 col-lg-3">
                    <Link href={`/product/${p.id}`} className="text-decoration-none">
                      <div className="product-card card-hover">
                        <div className="product-img-wrap">
                          <img
                            src={getImageUrl(imgSrc)}
                            alt={p.name}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.src = "/uploads/placeholder.png";
                            }}
                          />
                        </div>
                        <div className="product-info">
                          <h6 className="product-name">{p.name}</h6>
                          {p.price && (
                            <p className="product-price">₹{Number(p.price).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-5">
              <Link href="/products" className="btn btn-brand-outline px-4 py-2">
                View All Products <ArrowRight size={16} className="ms-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-4 border-top text-center">
        <div className="container">
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Hema Sarees. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

