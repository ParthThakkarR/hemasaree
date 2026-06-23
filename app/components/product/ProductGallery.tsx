'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="w-full lg:w-[58%] flex flex-col gap-4">
      {/* Main Image */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-surface-muted cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image 
          src={getImageSrc(images[selectedIndex])} 
          alt={descriptiveAlt} 
          fill 
          priority 
          className={`object-cover object-top transition-transform duration-300 ${isZoomed ? 'scale-[2.2]' : 'scale-100'}`}
          style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
          sizes="(max-width: 1024px) 100vw, 58vw" 
        />
        
        {/* Zoom hint */}
        <div className={`absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 text-ink-muted transition-opacity ${isZoomed ? 'opacity-0' : 'opacity-100'}`}>
          <ZoomIn size={18} />
        </div>
      </motion.div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
          {images.map((img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
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
                sizes="80px" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
