'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import PageHeader from '@/components/layout/PageHeader';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { BRAND_DEFAULTS } from '@/constants';

export default function BrandingSettings() {
  const { branding, setBranding, hydrated } = useCatalog();
  const { showToast } = useToast();
  const [form, setForm] = useState(BRAND_DEFAULTS);

  useEffect(() => {
    if (hydrated) setForm(branding);
  }, [branding, hydrated]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', form.primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', form.secondaryColor);
  }, [form.primaryColor, form.secondaryColor]);

  const handleSave = () => {
    setBranding(form);
    showToast('Branding settings saved');
  };

  const handleReset = () => {
    setForm(BRAND_DEFAULTS);
    setBranding(BRAND_DEFAULTS);
    showToast('Branding reset to defaults');
  };

  if (!hydrated) return null;

  return (
    <div>
      <PageHeader title="Branding Settings" subtitle="Customize your white-label LMS appearance" />
      <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
        <Breadcrumb items={[{ label: 'Branding' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
              <Palette className="h-5 w-5 text-brand-primary dark:text-brand-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-text-primary dark:text-slate-100">White-Label Branding</h2>
              <p className="text-sm text-brand-text-secondary dark:text-slate-400">Changes apply across the entire admin console.</p>
            </div>
          </div>

          <Input label="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-brand-text-primary dark:text-slate-200">Primary Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-10 w-14 rounded-lg border border-brand-border dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-900" />
                <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-brand-text-primary dark:text-slate-200">Secondary Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="h-10 w-14 rounded-lg border border-brand-border dark:border-slate-800 cursor-pointer bg-white dark:bg-slate-900" />
                <Input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="border-t border-brand-border dark:border-slate-800 pt-4">
            <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-200 mb-3">Logo & Asset Management</h3>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <ImageUploader label="Light Mode Logo" value={form.lightModeLogo} onChange={(val) => setForm({ ...form, lightModeLogo: val })} aspectRatio="square" />
              <ImageUploader label="Dark Mode Logo" value={form.darkModeLogo} onChange={(val) => setForm({ ...form, darkModeLogo: val })} aspectRatio="square" />
              <ImageUploader label="Favicon" value={form.favicon} onChange={(val) => setForm({ ...form, favicon: val })} aspectRatio="square" />
              <ImageUploader label="Website Logo" value={form.websiteLogo} onChange={(val) => setForm({ ...form, websiteLogo: val })} aspectRatio="square" />
              <ImageUploader label="Sidebar Logo" value={form.sidebarLogo} onChange={(val) => setForm({ ...form, sidebarLogo: val })} aspectRatio="square" />
              <ImageUploader label="Login Logo" value={form.loginLogo} onChange={(val) => setForm({ ...form, loginLogo: val })} aspectRatio="square" />
              <ImageUploader label="Mobile Logo" value={form.mobileLogo} onChange={(val) => setForm({ ...form, mobileLogo: val })} aspectRatio="square" />
              <ImageUploader label="Footer Logo" value={form.footerLogo} onChange={(val) => setForm({ ...form, footerLogo: val })} aspectRatio="square" />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-brand-border dark:border-slate-850 p-4 bg-brand-surface dark:bg-slate-950" style={{ borderColor: form.primaryColor + '40' }}>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400 mb-2">Live Theme Preview</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: form.primaryColor }}>X</div>
              <span className="font-semibold text-brand-text-primary dark:text-slate-250">{form.companyName}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded-lg px-4 py-2 text-sm text-white font-semibold" style={{ backgroundColor: form.primaryColor }}>Primary Button</button>
              <button type="button" className="rounded-lg px-4 py-2 text-sm text-white font-semibold" style={{ backgroundColor: form.secondaryColor }}>Secondary</button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave}><Save className="h-4 w-4" /> Save Branding</Button>
            <Button variant="outline" onClick={handleReset}>Reset Defaults</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
