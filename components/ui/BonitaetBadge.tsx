import type { BonitaetLabel } from '@/types';

interface Props {
  label: BonitaetLabel;
  score: number;
  zinssatz: number;
  size?: 'sm' | 'lg';
}

const CONFIG = {
  'Sehr gut': { dot: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  'Mittel': { dot: '#eab308', bg: '#fefce8', border: '#fef08a', text: '#854d0e' },
  'Basis': { dot: '#ef4444', bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
};

export default function BonitaetBadge({ label, score, zinssatz, size = 'lg' }: Props) {
  const c = CONFIG[label];
  const isLg = size === 'lg';

  return (
    <div
      className="flex items-center gap-3 rounded-xl border"
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
        padding: isLg ? '16px 20px' : '10px 14px',
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{
          backgroundColor: c.dot,
          width: isLg ? 14 : 10,
          height: isLg ? 14 : 10,
        }}
      />
      <div>
        <p className={`font-semibold ${isLg ? 'text-base' : 'text-sm'}`} style={{ color: c.text, margin: 0 }}>
          Bonität: {label}
        </p>
        {isLg && (
          <p className="text-xs mt-0.5" style={{ color: '#6b6b6b' }}>
            Score: {score}/9 · Zinssatz-Basis: {(zinssatz * 100).toFixed(1)} %
          </p>
        )}
      </div>
    </div>
  );
}
