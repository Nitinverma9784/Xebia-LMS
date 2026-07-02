import { motion } from 'framer-motion';
import { Camera, Mail, Phone, MapPin, Briefcase, IdCard, Edit3, Lock, Sparkles } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { studentProfile } from '@/services/studentMockData';

export default function StudentProfilePage() {
  return (
    <div className="min-h-screen bg-brand-surface/60 p-6 lg:p-8">
      <PageHeader title="Profile" subtitle="Keep your student profile up to date for a better learning experience." />
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center text-center">
            <img src={studentProfile.avatar} alt={studentProfile.fullName} className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-surface" />
            <h3 className="mt-4 text-xl font-bold text-brand-text-primary dark:text-slate-100">{studentProfile.fullName}</h3>
            <p className="mt-1 text-sm text-brand-text-secondary">{studentProfile.designation} · {studentProfile.department}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm"><Edit3 className="mr-2 h-4 w-4" />Edit Profile</Button>
              <Button size="sm" variant="outline"><Camera className="mr-2 h-4 w-4" />Upload Photo</Button>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><Mail className="h-4 w-4" /> Email</div><p className="mt-2 text-sm text-brand-text-secondary">{studentProfile.email}</p></div>
            <div className="rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><Phone className="h-4 w-4" /> Phone</div><p className="mt-2 text-sm text-brand-text-secondary">{studentProfile.phone}</p></div>
            <div className="rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><MapPin className="h-4 w-4" /> Location</div><p className="mt-2 text-sm text-brand-text-secondary">{studentProfile.location}</p></div>
            <div className="rounded-2xl bg-brand-surface/80 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><IdCard className="h-4 w-4" /> Student ID</div><p className="mt-2 text-sm text-brand-text-secondary">{studentProfile.id}</p></div>
          </div>
          <div className="mt-6 rounded-2xl bg-brand-surface/80 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-text-primary"><Briefcase className="h-4 w-4" /> Bio</div>
            <p className="mt-2 text-sm text-brand-text-secondary">{studentProfile.bio}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {studentProfile.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-semibold text-brand-primary">{skill}</span>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button size="sm" variant="outline"><Lock className="mr-2 h-4 w-4" />Change Password</Button>
            <Button size="sm"><Sparkles className="mr-2 h-4 w-4" />Preferences</Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
