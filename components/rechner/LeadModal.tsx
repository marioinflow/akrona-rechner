'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LeadFormData } from '@/types';
import { useT, useLanguage } from '@/lib/language-context';
import ButtonLoader from '@/components/ui/loader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payload: Omit<LeadFormData, 'vorname' | 'nachname' | 'email' | 'telefon' | 'consents'> | null;
}

export default function LeadModal({ isOpen, onClose, payload }: Props) {
  const [form, setForm] = useState({ vorname: '', nachname: '', email: '', telefon: '' });
  const [consents, setConsents] = useState({ datenschutz: false, kontakt: false, newsletter: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const t = useT();
  const { lang } = useLanguage();

  if (!isOpen || !payload) return null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const canSubmit =
    form.vorname.trim() &&
    form.nachname.trim() &&
    emailValid &&
    consents.datenschutz &&
    consents.kontakt &&
    !loading;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          telefon: form.telefon.trim() || undefined,
          ...payload,
          lang,
          consents,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error ?? t('errorOccurred'));
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && !success && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#fff' }}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: '#0A3D2C' }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: '#D4AF37' }}>
              {t('completeEvaluationTitle')}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('freeAndNonBindingViaEmail')}
            </p>
          </div>
          {!success && (
            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.6)' }} className="hover:text-white transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#f0fdf4' }}
              >
                <svg width="32" height="32" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#0A3D2C' }}>
                {t('evaluationSent')}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6b6b6b' }}>
                {t('evaluationSentDesc', { email: form.email })}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#0A3D2C', color: '#fff' }}
              >
                {t('close')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>{t('firstName')} *</label>
                  <input
                    type="text"
                    value={form.vorname}
                    onChange={(e) => setForm({ ...form, vorname: e.target.value })}
                    placeholder="Max"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E8E2D9' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>{t('lastName')} *</label>
                  <input
                    type="text"
                    value={form.nachname}
                    onChange={(e) => setForm({ ...form, nachname: e.target.value })}
                    placeholder="Mustermann"
                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: '#E8E2D9' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>{t('emailAddress')} *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="max@example.de"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E8E2D9' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6b6b6b' }}>
                  {t('phoneNumber')} <span style={{ color: '#9ca3af', fontWeight: 400 }}>{t('optional')}</span>
                </label>
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                  placeholder="+49 123 456789"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E8E2D9' }}
                />
              </div>

              {/* DSGVO */}
              <div className="space-y-3 pt-1">
                <label className="flex gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.datenschutz}
                    onChange={(e) => setConsents({ ...consents, datenschutz: e.target.checked })}
                    className="mt-0.5 flex-shrink-0 w-4 h-4 rounded"
                    style={{ accentColor: '#0A3D2C' }}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: '#444' }}>
                    {t('privacyConsent').split(t('privacyPolicyLinkText')).map((part, i, arr) =>
                      i < arr.length - 1 ? (
                        <span key={i}>
                          {part}
                          <Link href="/datenschutz" target="_blank" style={{ color: '#0A3D2C' }}>
                            {t('privacyPolicyLinkText')}
                          </Link>
                        </span>
                      ) : part
                    )}
                  </span>
                </label>

                <label className="flex gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.kontakt}
                    onChange={(e) => setConsents({ ...consents, kontakt: e.target.checked })}
                    className="mt-0.5 flex-shrink-0 w-4 h-4 rounded"
                    style={{ accentColor: '#0A3D2C' }}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: '#444' }}>
                    {t('contactConsent')}
                  </span>
                </label>

                <label className="flex gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.newsletter}
                    onChange={(e) => setConsents({ ...consents, newsletter: e.target.checked })}
                    className="mt-0.5 flex-shrink-0 w-4 h-4 rounded"
                    style={{ accentColor: '#0A3D2C' }}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: '#6b6b6b' }}>
                    {t('newsletterConsent')}
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}

              <button
                onClick={submit}
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2.5"
                style={{
                  backgroundColor: canSubmit ? '#D4AF37' : '#E8E2D9',
                  color: canSubmit ? '#0A3D2C' : '#6b6b6b',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                {loading && <ButtonLoader />}
                {loading ? t('processing') : t('receiveEvaluationByEmail')}
              </button>

              <p className="text-xs text-center" style={{ color: '#6b6b6b' }}>
                {t('dataProtectionInfo')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
