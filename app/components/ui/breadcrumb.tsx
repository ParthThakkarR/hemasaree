'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Accessible breadcrumb navigation with schema.org structured data.
 * Compact on mobile (shows only parent + current), full on desktop.
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  // On mobile, show: Home > ... > Parent > Current
  // On desktop, show all
  const allItems: BreadcrumbItem[] = [{ label: 'Home', href: '/' }, ...items];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${typeof window !== 'undefined' ? window.location.origin : ''}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-xs text-kajal-whisper overflow-x-auto [&::-webkit-scrollbar]:hidden ${className}`}
      >
        <ol className="flex items-center gap-1 whitespace-nowrap">
          {allItems.map((item, i) => {
            const isLast = i === allItems.length - 1;
            const isFirst = i === 0;
            // On mobile, hide middle items (show only first, second-to-last, last)
            const isMobileHidden =
              allItems.length > 3 && i > 0 && i < allItems.length - 2;

            return (
              <li
                key={`${item.label}-${i}`}
                className={`flex items-center gap-1 ${isMobileHidden ? 'hidden sm:flex' : 'flex'}`}
              >
                {i > 0 && (
                  <ChevronRight
                    size={12}
                    className="text-kajal-faint flex-shrink-0"
                    aria-hidden="true"
                  />
                )}

                {/* Ellipsis on mobile for hidden middle items */}
                {isMobileHidden && i === 1 && (
                  <span className="sm:hidden text-kajal-faint px-1">…</span>
                )}

                {isLast ? (
                  <span
                    className="font-medium text-kajal truncate max-w-[200px] sm:max-w-none"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || '/'}
                    className="hover:text-kumkum transition-colors flex items-center gap-1"
                  >
                    {isFirst && (
                      <Home size={13} className="flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className={isFirst ? 'hidden sm:inline' : ''}>
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
