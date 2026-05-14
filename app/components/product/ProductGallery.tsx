import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
  name: string;
  getImageSrc: (img?: string) => string;
}

export default function ProductGallery({ images, name, getImageSrc }: ProductGalleryProps) {
  return (
    <div className="w-full lg:w-[60%] flex flex-col gap-4">
      {images.map((img: string, idx: number) => (
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: idx * 0.1 }}
           key={idx} 
           className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-brand-50"
         >
           <Image 
             src={getImageSrc(img)} 
             alt={`${name} - ${idx}`} 
             fill 
             priority={idx === 0} 
             className="object-cover object-top hover:scale-105 transition-transform duration-700" 
             sizes="(max-width: 1024px) 100vw, 60vw" 
           />
         </motion.div>
      ))}
    </div>
  );
}
