/**
 * Module 38: VisualPageBuilder Master Component
 * Assembles TopToolbar, Left Panel, Canvas, Right Inspector, and Settings Modals.
 */

'use client';

import React, { useState } from 'react';
import { PageDocument } from '@/lib/page-builder/types';
import { BuilderProvider, useBuilder } from './builder-context';
import { TopToolbar } from './TopToolbar';
import { ElementsPanel } from './ElementsPanel';
import { NavigatorPanel } from './NavigatorPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderInspector } from './BuilderInspector';
import { X, Save, Layers, Clock, RotateCcw } from 'lucide-react';

interface VisualPageBuilderProps {
  initialPage?: PageDocument;
  initialDocument?: PageDocument;
  onSaveDraft?: (page: PageDocument) => Promise<void>;
  onPublishLive?: (page: PageDocument) => Promise<void>;
  onPublish?: (page: PageDocument) => Promise<void>;
  onBackUrl?: string;
  versions?: any[];
  onRollback?: (versionNumber: number) => Promise<void>;
}

function BuilderLayout({
  onBackUrl,
  versions = [],
  onRollback,
}: {
  onBackUrl?: string;
  versions?: any[];
  onRollback?: (versionNumber: number) => Promise<void>;
}) {
  const {
    page,
    activeLeftTab,
    previewMode,
    updatePageMetadata,
  } = useBuilder();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090E] text-white">
      {/* 1. Persistent Top Toolbar */}
      <TopToolbar
        onBackUrl={onBackUrl}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenVersions={() => setIsVersionsOpen(true)}
      />

      {/* 2. Main 3-Panel Workplace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel (Hidden in Preview Mode) */}
        {!previewMode && (
          <aside className="w-80 border-r border-slate-800/80 shrink-0 flex flex-col h-full bg-[#0D111A]">
            {activeLeftTab === 'elements' && <ElementsPanel />}
            {activeLeftTab === 'navigator' && <NavigatorPanel />}
            {activeLeftTab === 'templates' && <TemplatesPanel />}
          </aside>
        )}

        {/* Center Live Canvas */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <BuilderCanvas />
        </main>

        {/* Right Inspector Panel (Hidden in Preview Mode) */}
        {!previewMode && (
          <aside className="w-80 border-l border-slate-800/80 shrink-0 flex flex-col h-full bg-[#0D111A]">
            <BuilderInspector />
          </aside>
        )}
      </div>

      {/* 3. Page Settings & SEO Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0D111A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Page & SEO Settings</h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase tracking-wider">Page Title</label>
                <input
                  type="text"
                  value={page.name || ''}
                  onChange={(e) => updatePageMetadata({ name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase tracking-wider">URL Slug</label>
                <input
                  type="text"
                  value={page.slug || ''}
                  onChange={(e) => updatePageMetadata({ slug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase tracking-wider">Meta Title (SEO)</label>
                <input
                  type="text"
                  value={page.seo?.title || ''}
                  onChange={(e) =>
                    updatePageMetadata({ seo: { ...page.seo, title: e.target.value } })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold uppercase tracking-wider">Meta Description (SEO)</label>
                <textarea
                  rows={3}
                  value={page.seo?.description || ''}
                  onChange={(e) =>
                    updatePageMetadata({ seo: { ...page.seo, description: e.target.value } })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Version History & Rollback Modal */}
      {isVersionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D111A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Version History</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
              {versions && versions.length > 0 ? (
                versions.map((ver: any) => (
                  <div
                    key={ver.version}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white">Version {ver.version}</span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(ver.publishedAt || ver.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {onRollback && (
                      <button
                        type="button"
                        onClick={async () => {
                          await onRollback(ver.version);
                          setIsVersionsOpen(false);
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No previous published versions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function VisualPageBuilder({
  initialPage,
  initialDocument,
  onSaveDraft,
  onPublishLive,
  onPublish,
  onBackUrl,
  versions,
  onRollback,
}: VisualPageBuilderProps) {
  const doc = initialPage || initialDocument;
  const publish = onPublishLive || onPublish;

  return (
    <BuilderProvider
      initialPage={doc}
      initialDocument={doc}
      onSaveDraft={onSaveDraft}
      onPublishLive={publish}
      onPublish={publish}
    >
      <BuilderLayout
        onBackUrl={onBackUrl}
        versions={versions}
        onRollback={onRollback}
      />
    </BuilderProvider>
  );
}
