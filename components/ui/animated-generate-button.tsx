'use client';

import * as React from 'react';
import clsx from 'clsx';

export type AkronaAnimatedButtonProps = {
  /** Text shown in idle state */
  label?: string;
  /** Text shown when active=true (e.g. "Neu berechnen") */
  labelActive?: string;
  /** Switch to labelActive text when true */
  active?: boolean;
  /** Show sparkle icon on the left */
  showIcon?: boolean;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Override background color (default: #0A3D2C) */
  bg?: string;
  /** Extra wrapper className */
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  id?: string;
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'h-[38px] px-[18px] text-[13px] font-bold rounded-[10px]',
  md: 'h-[52px] px-8 text-[15px] font-bold rounded-[12px] tracking-[0.02em]',
  lg: 'h-[56px] px-8 text-[16px] font-extrabold rounded-[14px] tracking-[0.03em]',
};

const SparkleIcon = ({ size }: { size: string }) => (
  <svg
    className="akrona-anim-btn-svg fill-[rgba(255,255,255,0.6)]"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ width: size === 'sm' ? 14 : 16, height: size === 'sm' ? 14 : 16, flexShrink: 0, marginRight: 8 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
    />
  </svg>
);

export default function AkronaAnimatedButton({
  label = 'Jetzt berechnen',
  labelActive,
  active = false,
  showIcon = true,
  size = 'md',
  bg = '#0A3D2C',
  className,
  onClick,
  type = 'button',
  disabled = false,
  id,
}: AkronaAnimatedButtonProps) {
  const displayLabel = active && labelActive ? labelActive : label;

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx('akrona-anim-btn', SIZE_CLASSES[size], className)}
      style={{ backgroundColor: bg }}
    >
      {showIcon && <SparkleIcon size={size} />}
      <span className="whitespace-nowrap">
        {Array.from(displayLabel).map((ch, i) => (
          <span key={i} className="akrona-anim-letter inline-block">
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </span>
    </button>
  );
}
