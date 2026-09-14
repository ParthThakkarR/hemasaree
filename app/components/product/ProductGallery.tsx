'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
  getImageSrc: (img?: string) => string;
  fabric?: string;
  color?: string;
  category?: string;
}

export default function ProductGallery({ images, name, getImageSrc, fabric, color, category }: ProductGalleryProps) {
  const descriptiveAlt = `${name}${fabric ? ` — ${fabric}` : ''}${color ? ` in ${color}` : ''}${category ? ` | ${category} Saree` : ''} from Hema Sarees`;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed]           = useState(false);
  const [zoomPosition, setZoomPosition]   = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const prefersReducedMotion              = useReducedMotion();

  const goTo = useCallback((idx: number) => {
    setSelectedIndex(((idx % images.length) + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation — gallery focus
  const handleGalleryKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  { goTo(selectedIndex - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { goTo(selectedIndex + 1); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === ' ') { setLightboxOpen(true); e.preventDefault(); }
  }, [selectedIndex, goTo]);

  // Keyboard navigation — lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      setLightboxOpen(false);
      if (e.key === 'ArrowLeft')   goTo(selectedIndex - 1);
      if (e.key === 'ArrowRight')  goTo(selectedIndex + 1);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, selectedIndex, goTo]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width) * 100;
    const y    = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      {/* ── Fullscreen Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} — full size view`}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            aria-label="Close fullscreen view"
          >
            <X size={20} />
          </button>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(selectedIndex - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(selectedIndex + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Image — larger max-w for desktop */}
          <div
            className="relative max-w-4xl w-full h-[85vh] mx-8 sm:mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageSrc(images[selectedIndex])}
              alt={`${descriptiveAlt} — image ${selectedIndex + 1} of ${images.length}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>

          {/* Thumbnail strip in lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); goTo(idx); }}
                  className={`relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    idx === selectedIndex
                      ? 'ring-2 ring-white opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                  aria-pressed={idx === selectedIndex}
                >
                  <Image src={getImageSrc(img)} alt="" fill className="object-cover object-top" sizes="48px" />
                </button>
              ))}
            </div>
          )}

          {/* Image counter */}
          <p className="absolute top-4 left-4 text-white/50 text-sm tabular-nums">
            {selectedIndex + 1} / {images.length}
          </p>
        </div>
      )}

      {/* ── Gallery Wrapper ── */}
      <div className="w-full lg:w-[58%]">
        
        {/* =========================================
            MOBILE LAYOUT (Interactive Main + Thumbs)
            ========================================= */}
        <div
          className="flex lg:hidden flex-col gap-3 sm:gap-4"
          onKeyDown={handleGalleryKey}
          tabIndex={0}
          role="group"
          aria-label={`${name} product images — use arrow keys to navigate`}
        >
          {/* Main Image */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-surface-muted cursor-zoom-in group"
            onMouseEnter={() => !prefersReducedMotion && setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
            aria-label="Click to enlarge"
          >
            <Image
              src={getImageSrc(images[selectedIndex])}
              alt={descriptiveAlt}
              fill
              priority
              className={`object-cover object-top transition-transform duration-300 ${
                isZoomed && !prefersReducedMotion ? 'scale-[2.2]' : 'scale-100'
              }`}
              style={isZoomed && !prefersReducedMotion ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 58vw"
            />

            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 text-ink-muted">
                <Maximize2 size={16} aria-hidden="true" />
              </div>
            </div>

            {selectedIndex > 0 && images.length > 2 && (
              <div className="absolute top-3 left-3">
                <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Lifestyle
                </span>
              </div>
            )}
          </motion.div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div
              className="flex gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar pb-1"
              role="tablist"
              aria-label="Product image thumbnails"
            >
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={idx === selectedIndex}
                  aria-label={`${idx === 0 ? 'Main photo' : `Lifestyle photo ${idx}`} — view ${idx + 1}`}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-14 h-[72px] sm:w-[72px] sm:h-[92px] rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                    idx === selectedIndex
                      ? 'ring-2 ring-brand-800 ring-offset-2 ring-offset-surface opacity-100'
                      : 'opacity-50 hover:opacity-80 border border-surface-subtle'
                  }`}
                >
                  <Image
                    src={getImageSrc(img)}
                    alt={`${name} — view ${idx + 1}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 56px, 72px"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* =========================================
            DESKTOP LAYOUT (Editorial Stack)
            ========================================= */}
        <div className="hidden lg:flex flex-col gap-8">
          {images.map((img: string, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-surface-muted cursor-zoom-in group"
              onClick={() => { setSelectedIndex(idx); setLightboxOpen(true); }}
              aria-label="Click to enlarge"
            >
              <Image
                src={getImageSrc(img)}
                alt={`${descriptiveAlt} - View ${idx + 1}`}
                fill
                priority={idx === 0}
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="58vw"
              />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-2.5 text-ink-muted">
                  <Maximize2 size={18} aria-hidden="true" />
                </div>
              </div>

              {idx > 0 && images.length > 2 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                    Lifestyle
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

      </div>
    </>
  );
}
