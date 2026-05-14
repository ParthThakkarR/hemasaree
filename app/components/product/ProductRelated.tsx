import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProductRelatedProps {
  related: any[];
  getImageSrc: (img?: string) => string;
}

export default function ProductRelated({ related, getImageSrc }: ProductRelatedProps) {
  if (!related || related.length === 0) return null;

  return (
    <div className="mt-24 pt-12 border-t border-brand-100">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-8 text-center">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {related.map((item: any, i: number) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            key={item.id}
          >
            <Link href={`/product/${item.id}`} className="group relative flex flex-col bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden border border-brand-50 h-full">
              <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
                <Image src={getImageSrc(item.images?.[0])} alt={item.name} fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-sm font-medium text-ink line-clamp-2 mb-2 group-hover:text-brand-800 transition-colors">{item.name}</h3>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="font-semibold text-base text-ink">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
