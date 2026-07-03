'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, ChevronDown, ChevronUp, GripVertical, Pencil, Trash2, Save, X,
  Cloud, Lock, ArrowLeft, Link as LinkIcon, CheckCircle, FileText, UploadCloud, AlertCircle,
  Eye, Copy, Layers, PlayCircle, Video, Image as ImageIcon, FileCode, HelpCircle,
  FileSpreadsheet, FileArchive, Globe, Code, Quote, List, ListOrdered, CheckSquare,
  Minus, Table, Download, Monitor, Tablet, Smartphone, Sparkles, Check, RefreshCw,
  Search, ExternalLink, MessageSquare, AlertTriangle, File, FolderPlus, Compass, Loader2,
  Film, Play, Pause, Volume2, Maximize, RotateCcw, Award, Clock
} from 'lucide-react';
import { cn, slugify } from '@/utils';
import Button from '@/components/ui/Button';
import { ConfirmationDialog } from '@/components/ui/Modal';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { QuizBuilderModal, AssignmentBuilderModal } from './components/QuizAssignmentModals';

/* ─── 11 Supported LMS Block Types ─── */
const BLOCK_TYPES = [
  { type: 'text', label: 'Text / Paragraph', icon: FileText, category: 'Content', color: '#7C3AED', description: 'Body text and lesson summary' },
  { type: 'image', label: 'Image', icon: ImageIcon, category: 'Media', color: '#EC4899', description: 'Upload or link images (PNG, JPG, WEBP)' },
  { type: 'video', label: 'Video', icon: Video, category: 'Media', color: '#F59E0B', description: 'Upload MP4, MOV, AVI, MKV, WMV, WebM' },
  { type: 'pdf', label: 'PDF Document', icon: FileText, category: 'Files', color: '#EF4444', description: 'PDF course guides and handouts' },
  { type: 'ppt', label: 'PowerPoint (PPT)', icon: Layers, category: 'Files', color: '#F97316', description: 'Slide deck presentation files' },
  { type: 'word', label: 'Word Document', icon: FileText, category: 'Files', color: '#3B82F6', description: 'DOCX / DOC file attachments' },
  { type: 'excel', label: 'Excel File', icon: FileSpreadsheet, category: 'Files', color: '#10B5A5', description: 'XLSX / CSV data spreadsheets' },
  { type: 'zip', label: 'ZIP Archive', icon: FileArchive, category: 'Files', color: '#6366F1', description: 'Downloadable zip resource package' },
  { type: 'link', label: 'External Link', icon: LinkIcon, category: 'Embeds', color: '#0284C7', description: 'External website link or bookmark' },
  { type: 'quiz', label: 'Quiz / Test', icon: HelpCircle, category: 'Interactive', color: '#8B5CF6', description: 'Knowledge check assessment' },
  { type: 'assignment', label: 'Assignment', icon: CheckCircle, category: 'Interactive', color: '#059669', description: 'Practical student submission task' },
];

const SUPPORTED_VIDEO_EXTENSIONS = [
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'm4v',
  'mpeg', 'mpg', '3gp', 'ogv', 'ts', 'mts', 'm2ts', 'asf', 'vob', 'f4v', 'rmvb'
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function isYouTubeUrl(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const params = new URLSearchParams(url.split('?')[1]);
    videoId = params.get('v');
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function isVimeoUrl(url) {
  return url && url.includes('vimeo.com');
}

function getVimeoEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : url;
}

function LessonVideoPlayer({ url, title, thumbnail }) {
  const videoRef = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const cleanUrl = url || '';

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handlePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch {
        // PiP not supported or failed
      }
    }
  };

  if (isYouTubeUrl(cleanUrl)) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-800">
        <iframe src={getYouTubeEmbedUrl(cleanUrl)} className="w-full h-full" allowFullScreen title={title} />
      </div>
    );
  }

  if (isVimeoUrl(cleanUrl)) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-800">
        <iframe src={getVimeoEmbedUrl(cleanUrl)} className="w-full h-full" allowFullScreen title={title} />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-lg border border-slate-800 group/player">
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-center space-y-3">
          <RefreshCw className="h-9 w-9 text-purple-400 animate-spin mb-1" />
          <h4 className="text-xs font-bold text-white max-w-md">
            This video format is being processed and converted automatically into high-definition web format.
          </h4>
          <p className="text-[11px] text-slate-400 max-w-sm">
            Please wait until processing is complete, or download the original video file below.
          </p>
          {cleanUrl && (
            <a
              href={cleanUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="mt-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> Download Original Video File
            </a>
          )}
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            key={cleanUrl}
            controls
            preload="metadata"
            crossOrigin="anonymous"
            poster={thumbnail || undefined}
            onWaiting={() => setIsBuffering(true)}
            onStalled={() => setIsBuffering(true)}
            onCanPlay={() => setIsBuffering(false)}
            onPlaying={() => setIsBuffering(false)}
            onError={() => setHasError(true)}
            className="w-full h-full object-contain"
          >
            <source src={cleanUrl} type="video/mp4" />
            <source src={cleanUrl} type="video/webm" />
            <source src={cleanUrl} type="video/quicktime" />
            <source src={cleanUrl} type="video/x-matroska" />
            <source src={cleanUrl} type="video/x-msvideo" />
            <source src={cleanUrl} type="video/ogg" />
            Your browser does not support HTML5 video playback.
          </video>

          {/* Buffering Indicator Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 text-white text-xs font-bold shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                <span>Buffering video...</span>
              </div>
            </div>
          )}

          {/* Speed & PiP Control Bar */}
          <div className="absolute top-3 right-3 opacity-0 group-hover/player:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl text-white text-[11px] font-bold z-10">
            <span className="px-2 text-slate-400">Speed:</span>
            {[0.5, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] transition-colors ${playbackSpeed === s ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                {s}x
              </button>
            ))}
            {document.pictureInPictureEnabled && (
              <button
                type="button"
                onClick={handlePiP}
                title="Picture in Picture"
                className="px-2 py-0.5 rounded-lg text-[10px] hover:bg-slate-700 text-slate-300"
              >
                PiP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CourseBuilderWorkspace({ course, catalog, showToast }) {
  // View mode & selection state
  const [activeView, setActiveView] = useState('modules_submodules'); // 'modules_submodules' | 'submodule_content'
  const [activeModuleId, setActiveModuleId] = useState(course.modules?.[0]?.id || null);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState(null);

  // Forms Visibility
  const [moduleFormOpen, setModuleFormOpen] = useState(null); // 'add' | 'edit' | null
  const [submoduleFormOpen, setSubmoduleFormOpen] = useState(null); // 'add' | 'edit' | null

  // Quiz & Assignment Dedicated Modals
  const [quizModalOpen, setQuizModalOpen] = useState(null); // object | null
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(null); // object | null

  // Loading States
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [isSavingSubmodule, setIsSavingSubmodule] = useState(false);

  // Floating Slash/Block Menu
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Content Block Editor State
  const [contentFormOpen, setContentFormOpen] = useState(null); // 'add' | 'edit' | null
  const [uploadTab, setUploadTab] = useState('computer'); // 'computer' | 'library' | 'url'

  const [contentForm, setContentForm] = useState({
    id: null,
    title: '',
    description: '',
    type: 'video',
    status: 'published',
    visibility: 'public',
    thumbnail: '',
    fileUrl: '',
    fileSize: 0,
    markdown: '',
    contentOrder: 1,
    duration: '10 mins',
    completionRule: 'must_view',
  });

  // Module & Submodule Forms
  const [moduleForm, setModuleForm] = useState({
    id: null,
    title: '',
    description: '',
    duration: '2 hours',
    moduleOrder: 1,
    status: 'active'
  });

  const [submoduleForm, setSubmoduleForm] = useState({
    id: null,
    title: '',
    slug: '',
    description: '',
    duration: '30 mins',
    submoduleOrder: 1,
    status: 'active'
  });

  // File Upload progress & status
  const [contentUploading, setContentUploading] = useState(false);
  const [contentUploadProgress, setContentUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('Uploading...');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Current active records
  const activeModule = course.modules?.find(m => m.id === activeModuleId) || course.modules?.[0];
  const activeSubmodule = activeModule?.submodules?.find(s => s.id === activeSubmoduleId) || activeModule?.submodules?.[0];

  useEffect(() => {
    if (activeModule) {
      if (!activeModuleId) setActiveModuleId(activeModule.id);
      if (!activeSubmoduleId && activeModule.submodules?.length > 0) {
        setActiveSubmoduleId(activeModule.submodules[0].id);
      }
    }
  }, [activeModule, activeModuleId, activeSubmoduleId]);

  // ── Module Handlers ──
  const handleOpenAddModuleForm = () => {
    setModuleForm({
      id: null,
      title: '',
      description: '',
      duration: '2 hours',
      moduleOrder: (course.modules?.length || 0) + 1,
      status: 'active'
    });
    setSubmoduleFormOpen(null);
    setModuleFormOpen('add');
  };

  const handleOpenEditModuleForm = (mod) => {
    setModuleForm({
      id: mod.id,
      title: mod.title || '',
      description: mod.description || '',
      duration: mod.duration || '2 hours',
      moduleOrder: mod.moduleOrder || 1,
      status: mod.status || 'active'
    });
    setSubmoduleFormOpen(null);
    setModuleFormOpen('edit');
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) {
      showToast('Module title is required', 'error');
      return;
    }
    setIsSavingModule(true);
    try {
      const payload = {
        title: moduleForm.title,
        description: moduleForm.description,
        duration: moduleForm.duration,
        moduleOrder: moduleForm.moduleOrder,
        status: moduleForm.status
      };
      if (moduleFormOpen === 'add') {
        const newMod = await catalog.addModule(course.id, payload);
        if (newMod && newMod.id) {
          setActiveModuleId(newMod.id);
          // Auto-create initial default submodule to guarantee valid submoduleId
          const newSub = await catalog.addSubmodule(course.id, newMod.id, {
            title: 'Lesson 1: Introduction',
            slug: `lesson-1-${Date.now()}`,
            description: 'Main lesson content section',
            submoduleOrder: 1,
            status: 'active'
          });
          if (newSub && newSub.id) setActiveSubmoduleId(newSub.id);
        }
        showToast('Module created successfully');
      } else {
        await catalog.updateModule(course.id, moduleForm.id, payload);
        showToast('Module updated successfully');
      }
      setModuleFormOpen(null);
    } catch {
      showToast('Failed to save module', 'error');
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleDuplicateModule = async (mod) => {
    try {
      await catalog.duplicateModule(course.id, mod.id);
      showToast('Module duplicated successfully');
    } catch {
      showToast('Failed to duplicate module', 'error');
    }
  };

  // ── Submodule Handlers ──
  const handleOpenAddSubmoduleForm = () => {
    if (!activeModule) {
      showToast('Select or create a module first', 'error');
      return;
    }
    setSubmoduleForm({
      id: null,
      title: '',
      slug: '',
      description: '',
      duration: '30 mins',
      submoduleOrder: (activeModule.submodules?.length || 0) + 1,
      status: 'active'
    });
    setModuleFormOpen(null);
    setSubmoduleFormOpen('add');
  };

  const handleOpenEditSubmoduleForm = (sub) => {
    setSubmoduleForm({
      id: sub.id,
      title: sub.title || '',
      slug: sub.slug || '',
      description: sub.description || '',
      duration: sub.duration || '30 mins',
      submoduleOrder: sub.submoduleOrder || 1,
      status: sub.status || 'active'
    });
    setModuleFormOpen(null);
    setSubmoduleFormOpen('edit');
  };

  const handleSaveSubmodule = async () => {
    if (!submoduleForm.title.trim()) {
      showToast('Submodule title is required', 'error');
      return;
    }
    setIsSavingSubmodule(true);
    try {
      const payload = {
        title: submoduleForm.title,
        slug: submoduleForm.slug || slugify(submoduleForm.title),
        description: submoduleForm.description,
        duration: submoduleForm.duration,
        submoduleOrder: submoduleForm.submoduleOrder,
        status: submoduleForm.status
      };
      if (submoduleFormOpen === 'add') {
        const newSub = await catalog.addSubmodule(course.id, activeModuleId || activeModule.id, payload);
        if (newSub && newSub.id) setActiveSubmoduleId(newSub.id);
        showToast('Submodule created successfully');
      } else {
        await catalog.updateSubmodule(course.id, activeModuleId || activeModule.id, submoduleForm.id, payload);
        showToast('Submodule updated successfully');
      }
      setSubmoduleFormOpen(null);
    } catch {
      showToast('Failed to save submodule', 'error');
    } finally {
      setIsSavingSubmodule(false);
    }
  };

  const handleDuplicateSubmodule = async (sub) => {
    try {
      await catalog.addSubmodule(course.id, activeModuleId || activeModule.id, {
        title: `${sub.title} (Copy)`,
        slug: `${sub.slug}-copy`,
        description: sub.description,
        duration: sub.duration,
        submoduleOrder: (activeModule.submodules?.length || 0) + 1,
        status: sub.status || 'active'
      });
      showToast('Submodule duplicated successfully');
    } catch {
      showToast('Failed to duplicate submodule', 'error');
    }
  };

  // ── Content Block Handlers ──
  const handleOpenAddContent = async (type) => {
    if (!activeModule || !activeModule.id || Number(activeModule.id) <= 0) {
      showToast('Please create or select a module first.', 'error');
      return;
    }

    let targetSubId = activeSubmodule?.id;
    if (!targetSubId || Number(targetSubId) <= 0) {
      if (activeModule.submodules?.length > 0) {
        targetSubId = activeModule.submodules[0].id;
        setActiveSubmoduleId(targetSubId);
      } else {
        // Auto-create a default submodule to guarantee a valid DB ID
        try {
          const autoSub = await catalog.addSubmodule(course.id, activeModule.id, {
            title: 'Lesson 1: Main Content',
            slug: `lesson-1-${Date.now()}`,
            description: 'Default lesson section',
            submoduleOrder: 1,
            status: 'active'
          });
          if (autoSub && autoSub.id) {
            targetSubId = autoSub.id;
            setActiveSubmoduleId(autoSub.id);
          } else {
            showToast('Please create or select a submodule first.', 'error');
            return;
          }
        } catch {
          showToast('Please create a submodule first.', 'error');
          return;
        }
      }
    }

    if (type === 'quiz') {
      setQuizModalOpen({ isNew: true });
      return;
    }

    if (type === 'assignment') {
      setAssignmentModalOpen({ isNew: true });
      return;
    }

    setContentUploading(false);
    setContentUploadProgress(0);
    setUploadStatusText('Uploading...');
    setContentForm({
      id: null,
      title: type === 'video' ? 'Lesson Video' : '',
      description: '',
      type: type || 'video',
      status: 'published',
      visibility: 'public',
      thumbnail: '',
      fileUrl: '',
      fileSize: 0,
      markdown: '',
      contentOrder: (activeSubmodule?.contents?.length || 0) + 1,
      duration: '10 mins',
      completionRule: 'must_view',
    });
    setContentFormOpen('add');
    setBlockMenuOpen(false);
  };

  const handleOpenEditContent = (item) => {
    if (item.type === 'quiz') {
      setQuizModalOpen(item);
      return;
    }

    if (item.type === 'assignment') {
      setAssignmentModalOpen(item);
      return;
    }

    setContentUploading(false);
    setContentUploadProgress(0);
    setUploadStatusText('Uploading...');
    setContentForm({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'video',
      status: item.status || 'published',
      visibility: item.visibility || 'public',
      thumbnail: item.thumbnail || '',
      fileUrl: item.fileUrl || '',
      fileSize: item.fileSize || 0,
      markdown: item.markdown || '',
      contentOrder: item.contentOrder || 1,
      duration: item.duration || '10 mins',
      completionRule: item.completionRule || 'must_view',
    });
    setContentFormOpen('edit');
  };

  const handleSaveQuizBlock = async (payload) => {
    const targetSubId = activeSubmodule?.id || activeSubmoduleId;
    try {
      if (quizModalOpen?.id) {
        await catalog.updateContent(course.id, activeModuleId || activeModule.id, targetSubId, quizModalOpen.id, payload);
        showToast('Quiz updated successfully.');
      } else {
        await catalog.addContent(course.id, activeModuleId || activeModule.id, targetSubId, payload);
        showToast('Quiz created successfully.');
      }
      setQuizModalOpen(null);
    } catch {
      showToast('Failed to save quiz', 'error');
    }
  };

  const handleSaveAssignmentBlock = async (payload) => {
    const targetSubId = activeSubmodule?.id || activeSubmoduleId;
    try {
      if (assignmentModalOpen?.id) {
        await catalog.updateContent(course.id, activeModuleId || activeModule.id, targetSubId, assignmentModalOpen.id, payload);
        showToast('Assignment updated successfully.');
      } else {
        await catalog.addContent(course.id, activeModuleId || activeModule.id, targetSubId, payload);
        showToast('Assignment created successfully.');
      }
      setAssignmentModalOpen(null);
    } catch {
      showToast('Failed to save assignment', 'error');
    }
  };

  const handleSaveContent = async () => {
    const targetSubId = activeSubmodule?.id || activeSubmoduleId;
    if (!targetSubId || Number(targetSubId) <= 0) {
      showToast('Please create or select a valid submodule/lesson first.', 'error');
      return;
    }

    if (contentForm.type === 'text' && !contentForm.markdown.trim() && !contentForm.title.trim()) {
      showToast('Please enter text content or title', 'error');
      return;
    }

    const payload = {
      ...contentForm,
      title: contentForm.title || `${contentForm.type.toUpperCase()} Block`
    };

    try {
      if (contentForm.id) {
        await catalog.updateContent(course.id, activeModuleId || activeModule.id, targetSubId, contentForm.id, payload);
        showToast(contentForm.type === 'video' ? 'Video updated successfully.' : 'Block updated successfully.');
      } else {
        await catalog.addContent(course.id, activeModuleId || activeModule.id, targetSubId, payload);
        showToast(contentForm.type === 'video' ? 'Video uploaded successfully.' : 'Block added to lesson.');
      }
      setContentFormOpen(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save block', 'error');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (contentForm.type === 'video') {
      const fileName = file.name.toLowerCase();
      const ext = fileName.split('.').pop();
      const isVideo = file.type.startsWith('video/') || SUPPORTED_VIDEO_EXTENSIONS.includes(ext);
      if (!isVideo) {
        showToast('File format not recognized as video. Please select a valid video file.', 'error');
        return;
      }
    }

    setContentUploading(true);
    setContentUploadProgress(10);
    setUploadStatusText('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 75) / e.total);
          setContentUploadProgress(percent);
          if (percent > 70) {
            setUploadStatusText('Processing video & generating preview...');
          } else {
            setUploadStatusText('Uploading...');
          }
        }
      });

      setContentUploadProgress(95);
      setUploadStatusText('Processing video...');

      const { url, size } = response.data.data;

      setTimeout(() => {
        setContentForm(prev => ({
          ...prev,
          fileUrl: url,
          fileSize: size,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "")
        }));
        setContentUploadProgress(100);
        setUploadStatusText('Video ready to play.');
        setContentUploading(false);
        showToast('Video uploaded & ready to play.');
      }, 500);

    } catch {
      setUploadStatusText('Upload failed');
      showToast('Upload failed. Please try again.', 'error');
      setContentUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id, moduleId } = deleteConfirm;
    try {
      if (type === 'module') {
        await catalog.deleteModule(course.id, id);
        showToast('Module deleted successfully');
      } else if (type === 'submodule') {
        await catalog.deleteSubmodule(course.id, moduleId || activeModuleId, id);
        showToast('Submodule deleted successfully');
      } else if (type === 'content') {
        await catalog.deleteContent(course.id, activeModuleId, activeSubmoduleId, id);
        showToast('Block deleted successfully');
      }
      setDeleteConfirm(null);
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  const filteredBlocks = BLOCK_TYPES.filter(b => 
    !blockSearch || b.label.toLowerCase().includes(blockSearch.toLowerCase()) || b.description.toLowerCase().includes(blockSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-800 dark:text-[#F8FAFC]">

      {/* Top Navigation & Action Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-3.5 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-[#334155] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-400 dark:text-[#CBD5E1]">{course.title}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-purple-600 dark:text-purple-400 font-extrabold">{activeModule?.title || 'Modules'}</span>
            {activeSubmodule && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-800 dark:text-[#F8FAFC] font-extrabold">{activeSubmodule.title}</span>
              </>
            )}
          </div>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#1E293B] p-1 select-none">
            <button
              type="button"
              onClick={() => setActiveView('modules_submodules')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeView === 'modules_submodules' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <Layers className="h-3.5 w-3.5" />
              Structure Builder
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeSubmodule) setActiveView('submodule_content');
                else showToast('Select a lesson submodule first', 'error');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeView === 'submodule_content' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <FileText className="h-3.5 w-3.5" />
              Content Editor
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowLivePreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer shadow-sm"
          >
            <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Live Preview
          </button>
        </div>
      </div>

      {/* View 1: Structure Builder (Modules & Submodules) */}
      {activeView === 'modules_submodules' ? (
        <div className="flex-1 flex overflow-hidden p-8 gap-8 max-w-7xl w-full mx-auto">
          {/* Modules List Panel */}
          <div className="w-1/2 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">Course Modules</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">Organize top-level learning chapters and sections</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModuleForm}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#10B5A5' }}
              >
                <Plus className="h-4 w-4" /> Add Module
              </button>
            </div>

            {/* Modules List Cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {course.modules?.map((mod, idx) => {
                const isSelected = activeModuleId === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setActiveModuleId(mod.id)}
                    className={`p-5 rounded-[20px] border transition-all cursor-pointer ${isSelected ? 'bg-white dark:bg-[#1E293B] border-[#7C3AED] shadow-md ring-1 ring-[#7C3AED]' : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] hover:border-purple-300'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600 cursor-grab" />
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC]">{mod.title}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${mod.status === 'active' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/50' : 'bg-slate-100 text-slate-500'}`}>
                        {mod.status || 'Active'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-[#CBD5E1] line-clamp-2 pl-14 mb-4">
                      {mod.description || 'No description added yet.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#334155] pt-3 pl-14 text-xs font-medium text-slate-400">
                      <span>{(mod.submodules || []).length} Lessons / Submodules</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenEditModuleForm(mod); }} className="p-1 hover:text-purple-600">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDuplicateModule(mod); }} className="p-1 hover:text-purple-600">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'module', id: mod.id }); }} className="p-1 hover:text-rose-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submodules / Lessons Panel */}
          <div className="w-1/2 flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">Lessons &amp; Submodules</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
                  Inside: <strong className="text-purple-600 dark:text-purple-400">{activeModule?.title || 'Module'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSubmoduleForm}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#7C3AED' }}
              >
                <Plus className="h-4 w-4" /> Add Submodule
              </button>
            </div>

            {/* Submodules List Cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {activeModule?.submodules?.map((sub, sIdx) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] shadow-sm hover:border-purple-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600 cursor-grab" />
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 text-xs font-bold">
                        {sIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">{sub.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubmoduleId(sub.id);
                        setActiveView('submodule_content');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" /> Open Editor
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1] pl-14 mb-3">
                    {sub.description || 'No summary text.'}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#334155] pt-3 pl-14 text-xs font-medium text-slate-400">
                    <span>{(sub.contents || []).length} Content Blocks</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleOpenEditSubmoduleForm(sub)} className="p-1 hover:text-purple-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDuplicateSubmodule(sub)} className="p-1 hover:text-purple-600">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setDeleteConfirm({ type: 'submodule', id: sub.id })} className="p-1 hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Three-Panel Block Editor Canvas */
        <div className="flex-1 flex overflow-hidden">
          {/* Panel 1: Left Course Structure Tree (280px) */}
          <div className="w-72 shrink-0 border-r border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] flex flex-col p-4 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Course Structure</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {course.modules?.map((m, mIdx) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1E293B] text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
                    <span className="truncate">{mIdx + 1}. {m.title}</span>
                  </div>
                  <div className="pl-3 space-y-1 border-l-2 border-slate-100 dark:border-[#334155]">
                    {m.submodules?.map((s) => {
                      const isSubActive = s.id === activeSubmodule?.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveSubmoduleId(s.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${isSubActive ? 'bg-[#7C3AED]/15 text-[#7C3AED] font-bold' : 'text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                          <span className="truncate">{s.title}</span>
                          <span className="text-[10px] opacity-70">{(s.contents || []).length}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Center Content Canvas & 11 Grid Menu */}
          <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] overflow-y-auto p-8 relative">
            <div className="max-w-3xl w-full mx-auto space-y-6">

              {/* Lesson Header */}
              <div className="border-b border-slate-200 dark:border-[#334155] pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Lesson Canvas</span>
                <h1 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">{activeSubmodule?.title || 'Lesson Title'}</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1] mt-1">{activeSubmodule?.description || 'Build lesson content using the supported LMS block types below.'}</p>
              </div>

              {/* Block Cards List */}
              <div className="space-y-6">
                {activeSubmodule?.contents?.map((blk, bIdx) => (
                  <div
                    key={blk.id}
                    className="p-6 rounded-[20px] border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] shadow-sm relative group transition-all"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-[#334155] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
                          {blk.type}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">{blk.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleOpenEditContent(blk)} className="p-1.5 text-slate-400 hover:text-purple-600 cursor-pointer">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeleteConfirm({ type: 'content', id: blk.id })} className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* QUIZ BLOCK DISPLAY */}
                    {blk.type === 'quiz' && (
                      <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-purple-600" />
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white">Enterprise Quiz Assessment</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditContent(blk)}
                            className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
                          >
                            Edit Quiz Studio
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
                          <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Passing Score</span>
                            <span className="font-extrabold text-purple-600">70%</span>
                          </div>
                          <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Time Limit</span>
                            <span className="font-extrabold text-purple-600">{blk.duration || '20 mins'}</span>
                          </div>
                          <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Attempts</span>
                            <span className="font-extrabold text-purple-600">3 Allowed</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ASSIGNMENT BLOCK DISPLAY */}
                    {blk.type === 'assignment' && (
                      <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-teal-600" />
                            <span className="text-xs font-extrabold text-slate-800 dark:text-white">Practical Project Assignment</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditContent(blk)}
                            className="px-3 py-1 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 cursor-pointer"
                          >
                            Edit Assignment Studio
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
                          <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Points</span>
                            <span className="font-extrabold text-teal-600">100 pts</span>
                          </div>
                          <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Allowed Formats</span>
                            <span className="font-extrabold text-teal-600">PDF, ZIP, DOCX</span>
                          </div>
                          <div className="bg-white dark:bg-[#1E293B] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Grading</span>
                            <span className="font-extrabold text-teal-600">Rubric Based</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIDEO BLOCK PLAYER DISPLAY */}
                    {blk.type === 'video' && (
                      <div>
                        {blk.fileUrl ? (
                          <div className="space-y-3">
                            <LessonVideoPlayer
                              url={blk.fileUrl}
                              title={blk.title}
                              thumbnail={blk.thumbnail}
                            />

                            {/* Video Metadata & Actions Toolbar */}
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-[#CBD5E1] pt-1">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Film className="h-3.5 w-3.5 text-purple-500" /> {blk.duration || '10 mins'}
                                </span>
                                {blk.fileSize > 0 && (
                                  <span>Size: {formatBytes(blk.fileSize)}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditContent(blk)}
                                  className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" /> Replace Video
                                </button>
                                {blk.fileUrl && !isYouTubeUrl(blk.fileUrl) && !isVimeoUrl(blk.fileUrl) && (
                                  <a
                                    href={blk.fileUrl}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold hover:underline"
                                  >
                                    <Download className="h-3.5 w-3.5" /> Download Original File
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Video Empty Placeholder */
                          <div
                            onClick={() => handleOpenEditContent(blk)}
                            className="p-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-amber-100/50 transition-colors"
                          >
                            <Video className="h-8 w-8 text-amber-500 mb-2" />
                            <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">No video uploaded yet.</span>
                            <span className="text-[11px] text-slate-400 dark:text-[#CBD5E1] mt-0.5">
                              Supports MP4, MOV, AVI, MKV, WebM, WMV, FLV, M4V, 3GP, TS up to 2GB.
                            </span>
                            <button
                              type="button"
                              className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow hover:bg-amber-600 transition-colors"
                            >
                              + Upload Video File
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* IMAGE BLOCK PREVIEW */}
                    {blk.type === 'image' && (
                      <div>
                        {blk.fileUrl ? (
                          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80">
                            <img src={blk.fileUrl} alt={blk.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-400">
                            No image selected yet. Click edit to upload.
                          </div>
                        )}
                      </div>
                    )}

                    {/* TEXT BLOCK PREVIEW */}
                    {blk.type === 'text' && (
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-[#CBD5E1]">
                        {blk.markdown || blk.title || 'Text block body content.'}
                      </p>
                    )}

                    {/* FILE DOCUMENT PREVIEWS (PDF, PPT, Word, Excel, ZIP) */}
                    {['pdf', 'ppt', 'word', 'excel', 'zip', 'link'].includes(blk.type) && (
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#0B1120]/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50">
                            <File className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">{blk.title || 'Attached File'}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-sm">{blk.fileUrl || 'No file link attached'}</div>
                          </div>
                        </div>
                        {blk.fileUrl && (
                          <a
                            href={blk.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-300 text-xs font-bold hover:bg-purple-100"
                          >
                            Open File
                          </a>
                        )}
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Add Block Section - Symmetrical Grid */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Add Content Block (11 Supported Options)
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {BLOCK_TYPES.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => handleOpenAddContent(b.type)}
                      className="p-4 rounded-[20px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] hover:border-[#7C3AED] hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
                    >
                      <div
                        className="h-10 w-10 rounded-2xl flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: b.color }}
                      >
                        <b.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-[#F8FAFC]">{b.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1] mt-1 line-clamp-1">{b.description}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Panel 3: Right Properties Panel (320px) */}
          <div className="w-80 shrink-0 border-l border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] flex flex-col p-5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Lesson Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Visibility Access</label>
                <select className="h-10 w-full appearance-none rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none">
                  <option value="public">Public to Enrolled</option>
                  <option value="preview">Free Sample Preview</option>
                  <option value="locked">Prerequisite Locked</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Completion Rule</label>
                <select className="h-10 w-full appearance-none rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none">
                  <option value="must_view">Must View All Content</option>
                  <option value="pass_quiz">Must Pass Assessment</option>
                  <option value="complete_all">Complete All Activities</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  defaultValue="15 mins"
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Builder Studio Modal */}
      {quizModalOpen && (
        <QuizBuilderModal
          initialData={quizModalOpen}
          onClose={() => setQuizModalOpen(null)}
          onSave={handleSaveQuizBlock}
          showToast={showToast}
        />
      )}

      {/* Assignment Builder Studio Modal */}
      {assignmentModalOpen && (
        <AssignmentBuilderModal
          initialData={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(null)}
          onSave={handleSaveAssignmentBlock}
          showToast={showToast}
        />
      )}

      {/* Module Add / Edit Modal */}
      {moduleFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                {moduleFormOpen === 'add' ? 'Add New Module' : 'Edit Module'}
              </h3>
              <button type="button" onClick={() => setModuleFormOpen(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">
                  Module Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Module 1: Core Architecture & Setup"
                  value={moduleForm.title}
                  onChange={e => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Module summary and learning objectives..."
                  value={moduleForm.description}
                  onChange={e => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none resize-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hours"
                    value={moduleForm.duration}
                    onChange={e => setModuleForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Display Order</label>
                  <input
                    type="number"
                    value={moduleForm.moduleOrder}
                    onChange={e => setModuleForm(prev => ({ ...prev, moduleOrder: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
              <button type="button" onClick={() => setModuleFormOpen(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                type="button"
                disabled={!moduleForm.title.trim() || isSavingModule}
                onClick={handleSaveModule}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#10B5A5' }}
              >
                {isSavingModule ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{moduleFormOpen === 'add' ? 'Create Module' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submodule Add / Edit Modal */}
      {submoduleFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                {submoduleFormOpen === 'add' ? 'Add New Submodule / Lesson' : 'Edit Submodule'}
              </h3>
              <button type="button" onClick={() => setSubmoduleFormOpen(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">
                  Submodule / Lesson Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lesson 1.1: Environment Setup"
                  value={submoduleForm.title}
                  onChange={e => setSubmoduleForm(prev => ({ ...prev, title: e.target.value, slug: slugify(e.target.value) }))}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="lesson-slug"
                  value={submoduleForm.slug}
                  onChange={e => setSubmoduleForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-mono text-slate-700 dark:text-[#CBD5E1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of this submodule lesson..."
                  value={submoduleForm.description}
                  onChange={e => setSubmoduleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none resize-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 30 mins"
                  value={submoduleForm.duration}
                  onChange={e => setSubmoduleForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
              <button type="button" onClick={() => setSubmoduleFormOpen(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                type="button"
                disabled={!submoduleForm.title.trim() || isSavingSubmodule}
                onClick={handleSaveSubmodule}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#7C3AED' }}
              >
                {isSavingSubmodule ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{submoduleFormOpen === 'add' ? 'Create Submodule' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Upload Modal for Content Blocks */}
      {contentFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                {contentFormOpen === 'add' ? 'Add Content Block' : 'Edit Content Block'} ({contentForm.type.toUpperCase()})
              </h3>
              <button type="button" onClick={() => setContentFormOpen(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 3 Upload Method Tabs for Files & Videos */}
            {['video', 'image', 'pdf', 'ppt', 'word', 'excel', 'zip'].includes(contentForm.type) && (
              <div className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0B1120] p-1">
                <button
                  type="button"
                  onClick={() => setUploadTab('computer')}
                  className={`flex-1 text-xs font-bold rounded-lg py-1.5 cursor-pointer ${uploadTab === 'computer' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Upload from Computer
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('library')}
                  className={`flex-1 text-xs font-bold rounded-lg py-1.5 cursor-pointer ${uploadTab === 'library' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Media Library
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('url')}
                  className={`flex-1 text-xs font-bold rounded-lg py-1.5 cursor-pointer ${uploadTab === 'url' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Paste URL
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Block Title</label>
                <input
                  type="text"
                  placeholder="Block title / heading..."
                  value={contentForm.title}
                  onChange={e => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                />
              </div>

              {contentForm.type === 'text' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Body Text</label>
                  <textarea
                    rows={4}
                    placeholder="Enter lesson text content..."
                    value={contentForm.markdown}
                    onChange={e => setContentForm(prev => ({ ...prev, markdown: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none resize-none"
                  />
                </div>
              )}

              {['video', 'image', 'pdf', 'ppt', 'word', 'excel', 'zip', 'link'].includes(contentForm.type) && (
                <div>
                  {uploadTab === 'computer' && (
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-[#334155] rounded-2xl flex flex-col items-center justify-center text-center">
                      {contentUploading ? (
                        <div className="space-y-3 w-full max-w-xs text-center">
                          <Loader2 className="h-7 w-7 text-purple-600 animate-spin mx-auto" />
                          <div className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">{uploadStatusText} ({contentUploadProgress}%)</div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${contentUploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="h-8 w-8 text-purple-500 mb-2" />
                          <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">Click or drag video file to upload</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Supports MP4, MOV, AVI, MKV, WebM, WMV, FLV, M4V, 3GP, TS, VOB up to 2GB
                          </span>
                          <input
                            type="file"
                            accept="video/*,.mp4,.mov,.avi,.mkv,.webm,.wmv,.flv,.m4v,.mpeg,.mpg,.3gp,.ogv,.ts,.mts,.m2ts,.asf,.vob,.f4v,.rmvb,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip"
                            onChange={e => handleFileUpload(e.target.files[0])}
                            className="hidden"
                            id="modal-file-upload"
                          />
                          <label htmlFor="modal-file-upload" className="mt-3 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-100">
                            Browse Computer Files
                          </label>
                        </>
                      )}
                    </div>
                  )}
                  {uploadTab === 'url' && (
                    <input
                      type="url"
                      placeholder="Paste MP4, YouTube, Vimeo, S3, or Cloudinary URL..."
                      value={contentForm.fileUrl}
                      onChange={e => setContentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3.5 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] outline-none"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#334155]">
              <button type="button" onClick={() => setContentFormOpen(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContent}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                style={{ backgroundColor: '#7C3AED' }}
              >
                Save Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Live Preview Modal (Desktop, Tablet, Mobile) */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-10 items-center gap-1 rounded-xl border border-white/20 bg-white/10 p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white ${previewDevice === 'desktop' ? 'bg-purple-600' : ''}`}
              >
                <Monitor className="h-4 w-4" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white ${previewDevice === 'tablet' ? 'bg-purple-600' : ''}`}
              >
                <Tablet className="h-4 w-4" /> Tablet
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white ${previewDevice === 'mobile' ? 'bg-purple-600' : ''}`}
              >
                <Smartphone className="h-4 w-4" /> Mobile
              </button>
            </div>
            <button type="button" onClick={() => setShowLivePreviewModal(false)} className="text-white hover:text-rose-400 p-2 cursor-pointer">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="bg-white dark:bg-[#0B1120] rounded-[24px] border border-slate-700 shadow-2xl overflow-y-auto p-8 transition-all duration-300 h-[80vh]"
            style={{ width: previewDevice === 'desktop' ? '1000px' : previewDevice === 'tablet' ? '768px' : '375px' }}
          >
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">{course.title}</h2>
            <div className="space-y-4">
              {activeModule?.submodules?.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-purple-600 mb-2">{s.title}</h3>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {s.contents?.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        {c.title || c.type}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? Action cannot be undone."
      />
    </div>
  );
}
