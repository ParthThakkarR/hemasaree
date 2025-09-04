
'use client';

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "./page.css"; // custom CSS

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Error fetching categories:", err));

    // Fetch products
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // ✅ Do NOT touch image logic
  const getImageUrl = (path?: string | null) => {
    if (!path) return `/uploads/placeholder.png`;

    let cleanPath = path.toString().trim();
    if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
      cleanPath = cleanPath.slice(1, -1);
    }

    if (cleanPath.startsWith("data:image/")) {
      if (
        cleanPath.includes("base64,") &&
        cleanPath.split("base64,")[1]?.length > 10
      ) {
        return cleanPath;
      } else {
        return `/uploads/placeholder.png`;
      }
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

  // category → product matching (unchanged)
  const getProductsByCategory = (categoryId: string) => {
    return products.filter((p) => p.category?.id?.toString() === categoryId);
  };

  return (
    <div className="container py-4">
      {/* Categories */}
      <section className="mb-5">
        <h2 className="mb-4 fw-bold text-center">Shop by Category</h2>
        <div className="d-flex overflow-auto gap-4 pb-3 category-scroll justify-content-center">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`category-card shadow-sm ${
                selectedCategory === c.id.toString() ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(c.id.toString())}
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
                <h5>{c.name || c.categoryName}</h5>
                <button className="btn btn-light btn-sm fw-semibold">
                  Shop Now <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      {selectedCategory && (
        <section>
          <h2 className="mb-4 fw-bold text-center">
            Products in{" "}
            {categories.find((c) => c.id.toString() === selectedCategory)?.name ||
              categories.find((c) => c.id.toString() === selectedCategory)
                ?.categoryName ||
              "Selected Category"}
          </h2>
          <div className="row g-4">
            {getProductsByCategory(selectedCategory).length ? (
              getProductsByCategory(selectedCategory).map((p) => {
                let imgSrc: string | undefined;

                if (Array.isArray(p.images) && p.images.length > 0) {
                  if (
                    p.images.length >= 2 &&
                    p.images[0].startsWith("data:image/") &&
                    !p.images[0].includes(",")
                  ) {
                    imgSrc = p.images[0] + "," + p.images[1];
                  } else {
                    imgSrc = p.images[0];
                  }
                } else if (typeof p.images === "string") {
                  imgSrc = p.images;
                }

                return (
                  <div
                    key={p.id}
                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                  >
                    <Link
                      href={`/product/${p.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="card product-card h-100 border-0 shadow-sm">
                        <div className="image-container">
                          <img
                            src={getImageUrl(imgSrc)}
                            alt={p.name}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.src = "/uploads/placeholder.png";
                            }}
                          />
                        </div>
                        <div className="card-body text-center">
                          <h6 className="fw-bold">{p.name}</h6>
                          <p className="text-muted small">{p.description}</p>
                          {p.price && (
                            <p className="fw-bold text-danger">₹{p.price}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="col-12">
                <p className="text-center text-muted">
                  No products found for this category.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
