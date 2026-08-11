'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import type { ArtisanStory } from '@/lib/content/stories';

interface StoryCardProps {
  story     : ArtisanStory;
  index?    : number;
  className?: string;
}

const SPRING_CARD = { type: 'spring' as const, bounce: 0, duration: 0.5 };

export default function StoryCard({ story, index = 0, className = '' }: StoryCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const entranceVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden : { opacity: 0, y: 24 },
        visible: {
          opacity: 1, y: 0,
          transition: { ...SPRING_CARD, delay: index * 0.08 },
        },
      };

  return (
    <motion.article
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`group relative flex-shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden story-card paper-surface ${className}`}
      aria-labelledby={`story-${story.id}-name`}
    >
      {/* Artisan portrait — top 55% */}
      <div className="relative h-64 overflow-hidden bg-chandan-warm">
        <Image
          src={story.portrait}
          alt={`${story.name}, ${story.craft} artisan from ${story.village}`}
          fill
          sizes="(max-width: 640px) 288px, 320px"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        {/* Vignette bottom */}
        <div className="absolute inset-x-0 bottom-0 h-28 vignette-bottom" aria-hidden="true" />

        {/* Region badge — over portrait, bottom-left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 region-badge">
          <MapPin size={10} aria-hidden="true" />
          <span>{story.region}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Craft label */}
        <p className="chapter-eyebrow mb-1" lang="hi" aria-label={`Craft: ${story.craft}`}>
          {story.craftDevanagari}
          <span className="ml-2 text-kajal-whisper font-normal normal-case tracking-normal" lang="en">
            · {story.craft}
          </span>
        </p>

        {/* Name — Devanagari + English */}
        <div className="mb-3">
          <h3
            id={`story-${story.id}-name`}
            className="font-noto-serif text-xl font-bold text-kajal leading-snug"
          >
            {story.name}
          </h3>
          <p
            className="devanagari-headline text-base text-kajal-soft mt-0.5"
            lang="hi"
            aria-label={`${story.name} in Devanagari script`}
          >
            {story.nameDevanagari}
          </p>
        </div>

        {/* Voice line — her words, not ours */}
        <blockquote className="artisan-voice text-sm mb-4">
          {story.voiceLine}
        </blockquote>

        {/* Days woven */}
        <p className="text-xs text-kajal-whisper mb-4 font-medium">
          This saree took{' '}
          <span className="text-kumkum font-bold">{story.daysWoven} days</span>{' '}
          to weave
        </p>

        {/* CTA */}
        <Link
          href={`/products?category=${encodeURIComponent(story.categoryFilter)}`}
          className="group/link inline-flex items-center gap-2 text-sm font-semibold text-kumkum hover:text-kumkum-deep transition-colors"
          aria-label={`Explore ${story.craft} sarees by ${story.name}`}
        >
          Enter her story
          <ArrowRight
            size={15}
            className="group-hover/link:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </Link>
      </div>
    </motion.article>
  );
}
