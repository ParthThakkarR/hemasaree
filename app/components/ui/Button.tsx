'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'adopt' | 'primary' | 'ghost' | 'whisper' | 'neem';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?  : ButtonVariant;
  size?     : ButtonSize;
  isLoading?: boolean;
  leftIcon? : React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  haptic?   : boolean; // enable vibration haptic
  children  : React.ReactNode;
}

// Web Audio API — soft confirm chime (440Hz sine, 80ms, low gain)
function playAdoptChime() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.06); // E5
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch { /* audio blocked — silent fail */ }
}

const SPRING_BTN = { type: 'spring' as const, bounce: 0, duration: 0.3 };
const SPRING_ADOPT = { type: 'spring' as const, bounce: 0.2, duration: 0.35 };

const variantStyles: Record<ButtonVariant, string> = {
  adopt: [
    'bg-kumkum text-chandan border border-kumkum-deep/20',
    'hover:bg-kumkum-deep',
    'shadow-kumkum-sm hover:shadow-kumkum-md',
    'font-bold tracking-[0.04em]',
    // font-display is applied via className for adopt to use Noto Serif
  ].join(' '),

  primary: [
    'bg-kajal text-chandan',
    'hover:bg-kajal-soft',
    'shadow-paper',
  ].join(' '),

  ghost: [
    'bg-transparent text-kumkum border border-kumkum/30',
    'hover:bg-kumkum/5 hover:border-kumkum/50',
  ].join(' '),

  whisper: [
    'bg-transparent text-kajal-soft underline underline-offset-4',
    'hover:text-kajal decoration-kajal-faint hover:decoration-kajal',
  ].join(' '),

  neem: [
    'bg-neem text-chandan border border-neem-deep/20',
    'hover:bg-neem-deep',
    'shadow-paper',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  'px-4 py-2 text-xs rounded-lg gap-1.5',
  md:  'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg:  'px-7 py-3.5 text-base rounded-xl gap-2',
  xl:  'px-8 py-4 text-lg rounded-xl gap-2.5',
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  haptic    = true,
  disabled,
  onClick,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const confirmingRef = useRef(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      if (variant === 'adopt') {
        navigator.vibrate([10, 30, 10]); // double-tap: confirmation pattern
        if (!prefersReducedMotion) playAdoptChime();
      } else {
        navigator.vibrate(8);
      }
    }

    onClick?.(e);
  };

  const isAdopt  = variant === 'adopt';
  const tapScale = prefersReducedMotion ? 1 : isAdopt ? 0.95 : 0.96;
  const spring   = isAdopt ? SPRING_ADOPT : SPRING_BTN;

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: tapScale }}
      transition={spring}
      onClick={handleClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center',
        'transition-colors duration-150',
        'focus-visible:outline-none',
        'select-none cursor-pointer',
        '-webkit-tap-highlight-color: transparent',
        variantStyles[variant],
        sizeStyles[size],
        isAdopt ? 'font-noto-serif' : '',
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ].join(' ')}
      {...(props as any)}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </motion.button>
  );
}
