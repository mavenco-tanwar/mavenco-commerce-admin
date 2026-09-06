/**
 * Module 38: TopToolbar Component
 * Elementor-style persistent header with device selector, undo/redo, save, and publish.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Rocket,
  Layers,
  Settings,
  ArrowLeft,
  Loader2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useBuilder } from './builder-context';

interface TopToolbarProps {
  onBackUrl?: string;
  onOpenSettings?: () => void;
  onOpenVersions?: () => void;
}

export function TopToolbar({
  onBackUrl = '/superadmin/tenants',
  onOpenSettings,
  onOpenVersions,
}: TopToolbarProps) {
  const {
    page,
    activeDevice,
    setActiveDevice,
    activeLeftTab,
    setActiveLeftTab,
    previewMode,
    setPreviewMode,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    undo,
    redo,
    isDirty,
    isSaving,
    isPublishing,
    saveDraft,
    publishLive,
  } = useBuilder();

  return (
    <header className="h-14 bg-[#0B0D14] border-b border-slate-800/80 px-4 flex items-center justify-between select-none z-40 shrink-0 text-white">
      {/* Left: Back + Page Meta */}
      <div className="flex items-center gap-3">
        {onBackUrl && (
          <Link
            href={onBackUrl}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to Pages List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white tracking-wide truncate max-w-[200px]">
            {page.name || 'Untitled Page'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-400">
            v{page.version || 1}
          </span>
          <span
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
              page.status === 'published'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {page.status}
          </span>
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Unsaved changes" />
          )}
        </div>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 ml-2 pl-2 border-l border-slate-800">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              !canUndo ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title="Undo (Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              !canRedo ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Device Viewport Selector */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveDevice('desktop')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeDevice === 'desktop' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Desktop (100% Canvas)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDevice('tablet')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeDevice === 'tablet' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Tablet (768px Canvas)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDevice('mobile')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeDevice === 'mobile' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
          title="Mobile (390px Canvas)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Mobile</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Navigator Toggle */}
        <button
          type="button"
          onClick={() => setActiveLeftTab(activeLeftTab === 'navigator' ? 'elements' : 'navigator')}
          className={`p-2 rounded-xl border transition-colors ${
            activeLeftTab === 'navigator'
              ? 'bg-rose-600 text-white border-rose-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Navigator Tree View"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Page Settings */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Page & SEO Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* Preview Mode Toggle */}
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className={`p-2 rounded-xl border transition-colors ${
            previewMode
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title={previewMode ? 'Exit Preview' : 'Interactive Preview Mode'}
        >
          {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Save Draft */}
        <button
          type="button"
          onClick={saveDraft}
          disabled={isSaving}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Save Draft</span>
        </button>

        {/* Publish Live */}
        <button
          type="button"
          onClick={publishLive}
          disabled={isPublishing}
          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Rocket className="w-3.5 h-3.5" />
          )}
          <span>Publish</span>
        </button>
      </div>
    </header>
  );
}
