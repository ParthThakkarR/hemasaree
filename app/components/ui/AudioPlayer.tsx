'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src?        : string;        // optional — graceful empty state when absent
  artisanName : string;
  artisanNameDevanagari?: string;
  transcript? : string;        // transliterated text to show while playing
  className?  : string;
}

const SPRING_BTN = { type: 'spring' as const, bounce: 0.3, duration: 0.3 };
const NUM_BARS   = 9;

/**
 * AudioPlayer — Artisan voice note player.
 * 
 * Waveform bars animate when playing (CSS animation via globals.css).
 * Graceful empty state when no src provided.
 * Screen-reader accessible with proper aria-live regions.
 */
export default function AudioPlayer({
  src,
  artisanName,
  artisanNameDevanagari,
  transcript,
  className = '',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying]     = useState(false);
  const [duration, setDuration]       = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [canPlay, setCanPlay]         = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isPlaying, src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded  = () => { setDuration(audio.duration); setCanPlay(true); };
    const onTime    = () => setCurrentTime(audio.currentTime);
    const onEnded   = () => { setIsPlaying(false); setCurrentTime(0); };
    const onError   = () => setCanPlay(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate',     onTime);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('error',          onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate',     onTime);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('error',          onError);
    };
  }, [src]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasSrc   = !!src;

  return (
    <div
      className={`paper-surface rounded-2xl p-5 ${className}`}
      role="region"
      aria-label={`Voice note from ${artisanName}`}
    >
      {/* Hidden audio element */}
      {hasSrc && (
        <audio ref={audioRef} src={src} preload="metadata" aria-hidden="true" />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-kumkum flex items-center justify-center text-chandan">
          <Volume2 size={16} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold text-kajal-soft uppercase tracking-widest mb-0.5">
            Her Voice
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-noto-serif text-base font-bold text-kajal">{artisanName}</span>
            {artisanNameDevanagari && (
              <span className="devanagari-headline text-sm" lang="hi">
                {artisanNameDevanagari}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Waveform + controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <motion.button
          whileTap={hasSrc ? { scale: 0.88 } : {}}
          transition={SPRING_BTN}
          onClick={togglePlay}
          disabled={!hasSrc || !canPlay}
          aria-label={isPlaying ? `Pause ${artisanName}'s voice note` : `Play ${artisanName}'s voice note`}
          aria-pressed={isPlaying}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            hasSrc && canPlay
              ? 'bg-kumkum text-chandan hover:bg-kumkum-deep cursor-pointer'
              : 'bg-chandan-warm text-kajal-faint cursor-not-allowed'
          }`}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </motion.button>

        {/* Waveform visualization */}
        <div
          className="flex-1 flex items-center gap-1 h-8"
          aria-hidden="true"
        >
          {Array.from({ length: NUM_BARS }).map((_, i) => (
            <div
              key={i}
              className={`waveform-bar ${!isPlaying || !hasSrc || prefersReducedMotion ? 'paused' : ''}`}
              style={{
                background: i / NUM_BARS < progress / 100
                  ? 'var(--color-kumkum)'
                  : 'var(--color-kajal-faint)',
                transition: 'background 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Time display */}
        {hasSrc && duration > 0 && (
          <span className="text-xs text-kajal-whisper tabular-nums flex-shrink-0">
            <span aria-live="polite" aria-atomic="true">
              {formatTime(currentTime)}
            </span>
            {' / '}
            {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Progress bar — clickable scrubber */}
      {hasSrc && duration > 0 && (
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            step={0.1}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = t;
              setCurrentTime(t);
            }}
            aria-label="Playback position"
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-kumkum) ${progress}%, var(--color-chandan-warm) ${progress}%)`,
            }}
          />
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <AnimatePresence>
          {isPlaying && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3 } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              className="mt-4 text-sm text-kajal-soft italic leading-relaxed border-t border-chandan-warm pt-3"
              lang="hi"
              aria-live="polite"
            >
              {transcript}
            </motion.p>
          )}
        </AnimatePresence>
      )}

      {/* Empty state */}
      {!hasSrc && (
        <p className="mt-3 text-xs text-kajal-faint italic">
          Audio note coming soon &mdash; we&apos;re recording with {artisanName} this season.
        </p>
      )}
    </div>
  );
}
