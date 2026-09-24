import { showConfirmModal } from '@/lib/modal-context';
'use client';

import React, { useState, useEffect } from 'react';
import {
  BuilderDocument,
  BuilderDevice,
  BuilderSection,
  BuilderBlock,
  BuilderPreset,
  BuilderVersion,
} from '../types/builder.types';
import { BlockRegistry } from '../registry/BlockRegistry';
import { useBuilderHistory } from '../history/HistoryManager';
import { BuilderToolbar } from './BuilderToolbar';
import { BuilderSidebar } from './BuilderSidebar';
import { BuilderCanvas } from './BuilderCanvas';
import { BuilderBlockRenderer } from './BuilderBlockRenderer';
import { BlockSettingsPanel } from '../panels/BlockSettingsPanel';
import { Sparkles, History, RotateCcw, X, CheckCircle2, Monitor, Tablet, Smartphone } from 'lucide-react';

interface BuilderProps {
  initialDocument: BuilderDocument;
  presets?: BuilderPreset[];
  onSaveDraft: (doc: BuilderDocument) => Promise<void>;
  onPublish: (doc: BuilderDocument) => Promise<void>;
  onFetchVersions?: () => Promise<BuilderVersion[]>;
  onRestoreVersion?: (versionId: string) => Promise<BuilderDocument | void>;
  tenantSlug: string;
}

export function Builder({
  initialDocument,
  presets = [],
  onSaveDraft,
  onPublish,
  onFetchVersions,
  onRestoreVersion,
  tenantSlug,
}: BuilderProps) {
  const {
    currentState: document,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBuilderHistory(initialDocument);

  const [device, setDevice] = useState<BuilderDevice>('desktop');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Responsive Drawer/Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [versionsList, setVersionsList] = useState<BuilderVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Add New Section
  const handleAddSection = () => {
    const newSection: BuilderSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `Section ${document.sections.length + 1}`,
      enabled: true,
      order: document.sections.length + 1,
      layout: {
        containerWidth: 'contained',
        columns: { desktop: 4, tablet: 2, mobile: 1 },
      },
      styles: {
        backgroundColor: 'transparent',
      },
      responsive: {
        desktop: { visible: true },
        tablet: { visible: true },
        mobile: { visible: true },
      },
      blocks: [],
    };

    const next = {
      ...document,
      sections: [...document.sections, newSection],
    };
    pushState(next);
    setSelectedSectionId(newSection.id);
    setSelectedBlockId(null);
    setIsInspectorOpen(true);
    showToast('New section added', 'info');
  };

  // 2. Add Block to Section
  const handleAddBlockToSection = (sectionId: string, type?: string) => {
    const blockType = type || 'text';
    const newBlock = BlockRegistry.createBlockInstance(blockType);

    const nextSections = document.sections.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          blocks: [...sec.blocks, newBlock],
        };
      }
      return sec;
    });

    const next = { ...document, sections: nextSections };
    pushState(next);
    setSelectedSectionId(sectionId);
    setSelectedBlockId(newBlock.id);
    setIsInspectorOpen(true);
    showToast(`Added ${newBlock.name || blockType} block`, 'info');
  };

  // 3. Add Block from Sidebar (adds to active section or first section)
  const handleAddBlockFromSidebar = (type: string) => {
    let targetSectionId = selectedSectionId;
    if (!targetSectionId && document.sections.length > 0) {
      targetSectionId = document.sections[0].id;
    }

    if (!targetSectionId) {
      // Create section first
      const newSection: BuilderSection = {
        id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: 'Main Section',
        enabled: true,
        order: 1,
        layout: {
          containerWidth: 'contained',
          columns: { desktop: 4, tablet: 2, mobile: 1 },
        },
        styles: { backgroundColor: 'transparent' },
        blocks: [],
      };
      const newBlock = BlockRegistry.createBlockInstance(type);
      newSection.blocks.push(newBlock);

      const next = {
        ...document,
        sections: [newSection],
      };
      pushState(next);
      setSelectedSectionId(newSection.id);
      setSelectedBlockId(newBlock.id);
      setIsInspectorOpen(true);
      showToast(`Added section and ${newBlock.name}`, 'info');
      return;
    }

    handleAddBlockToSection(targetSectionId, type);
  };

  // 4. Update Section
  const handleUpdateSection = (updated: Partial<BuilderSection>) => {
    if (!selectedSectionId) return;
    const nextSections = document.sections.map((s) => (s.id === selectedSectionId ? { ...s, ...updated } : s));
    const next = { ...document, sections: nextSections };
    pushState(next);
  };

  // 5. Update Block
  const handleUpdateBlock = (updated: Partial<BuilderBlock>) => {
    if (!selectedSectionId || !selectedBlockId) return;
    const nextSections = document.sections.map((s) => {
      if (s.id === selectedSectionId) {
        const nextBlocks = s.blocks.map((b) => (b.id === selectedBlockId ? { ...b, ...updated } : b));
        return { ...s, blocks: nextBlocks };
      }
      return s;
    });
    const next = { ...document, sections: nextSections };
    pushState(next);
  };

  // 6. Delete Section
  const handleDeleteSection = (sectionId: string) => {
    const nextSections = document.sections.filter((s) => s.id !== sectionId);
    const next = { ...document, sections: nextSections };
    pushState(next);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      setSelectedBlockId(null);
    }
    showToast('Section removed', 'info');
  };

  // 7. Duplicate Section
  const handleDuplicateSection = (sectionId: string) => {
    const sec = document.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const duplicated: BuilderSection = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${sec.name} (Copy)`,
      order: document.sections.length + 1,
    };
    const next = { ...document, sections: [...document.sections, duplicated] };
    pushState(next);
    showToast('Section duplicated', 'info');
  };

  // 8. Move Section
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const list = [...document.sections];
    const idx = list.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
    }
    const next = { ...document, sections: list.map((s, i) => ({ ...s, order: i + 1 })) };
    pushState(next);
  };

  // 9. Toggle Section Visibility
  const handleToggleSectionVisibility = (sectionId: string) => {
    const nextSections = document.sections.map((s) => {
      if (s.id === sectionId) {
        const cur = s.responsive?.[device]?.visible !== false;
        return {
          ...s,
          responsive: {
            ...s.responsive,
            [device]: { visible: !cur },
          },
        };
      }
      return s;
    });
    const next = { ...document, sections: nextSections };
    pushState(next);
    showToast(`Updated section ${device} visibility`, 'info');
  };

  // 10. Delete Block
  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    const nextSections = document.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) };
      }
      return s;
    });
    const next = { ...document, sections: nextSections };
    pushState(next);
    if (selectedBlockId === blockId) setSelectedBlockId(null);
    showToast('Block removed', 'info');
  };

  // 11. Duplicate Block
  const handleDuplicateBlock = (sectionId: string, blockId: string) => {
    const nextSections = document.sections.map((s) => {
      if (s.id === sectionId) {
        const blk = s.blocks.find((b) => b.id === blockId);
        if (!blk) return s;
        const copy = {
          ...JSON.parse(JSON.stringify(blk)),
          id: `blk_${blk.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          order: s.blocks.length + 1,
        };
        return { ...s, blocks: [...s.blocks, copy] };
      }
      return s;
    });
    const next = { ...document, sections: nextSections };
    pushState(next);
    showToast('Block duplicated', 'info');
  };

  // 12. Toggle Block Visibility
  const handleToggleBlockVisibility = (sectionId: string, blockId: string) => {
    const nextSections = document.sections.map((s) => {
      if (s.id === sectionId) {
        const nextBlocks = s.blocks.map((b) => {
          if (b.id === blockId) {
            const cur = b.enabled !== false && b.responsive?.[device]?.visible !== false;
            return {
              ...b,
              responsive: {
                ...b.responsive,
                [device]: { visible: !cur },
              },
            };
          }
          return b;
        });
        return { ...s, blocks: nextBlocks };
      }
      return s;
    });
    const next = { ...document, sections: nextSections };
    pushState(next);
    showToast(`Updated block ${device} visibility`, 'info');
  };

  // 13. Move Block
  const handleMoveBlock = (sectionId: string, blockId: string, direction: 'up' | 'down') => {
    const nextSections = document.sections.map((s) => {
      if (s.id === sectionId) {
        const list = [...s.blocks];
        const idx = list.findIndex((b) => b.id === blockId);
        if (idx === -1) return s;
        if (direction === 'up' && idx > 0) {
          const temp = list[idx];
          list[idx] = list[idx - 1];
          list[idx - 1] = temp;
        } else if (direction === 'down' && idx < list.length - 1) {
          const temp = list[idx];
          list[idx] = list[idx + 1];
          list[idx + 1] = temp;
        }
        return { ...s, blocks: list.map((b, i) => ({ ...b, order: i + 1 })) };
      }
      return s;
    });
    const next = { ...document, sections: nextSections };
    pushState(next);
  };

  // 14. Reorder Blocks (DnD)
  const handleReorderBlocks = (sectionId: string, blocks: BuilderBlock[]) => {
    const nextSections = document.sections.map((s) => (s.id === sectionId ? { ...s, blocks } : s));
    const next = { ...document, sections: nextSections };
    pushState(next);
  };

  // 15. Save Draft Handler
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draftDoc = { ...document, status: 'draft' as const, updatedAt: new Date().toISOString() };
      await onSaveDraft(draftDoc);
      showToast('Draft saved successfully', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save draft', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 16. Publish Handler
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const pubDoc = {
        ...document,
        status: 'published' as const,
        version: document.version + 1,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await onPublish(pubDoc);
      pushState(pubDoc);
      showToast(`Version ${pubDoc.version} published live!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish live', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // 17. Load Versions
  const handleOpenVersions = async () => {
    setIsVersionsOpen(true);
    if (onFetchVersions) {
      setIsLoadingVersions(true);
      try {
        const vList = await onFetchVersions();
        setVersionsList(vList);
      } catch (err) {
        console.warn('Failed to load version history:', err);
      } finally {
        setIsLoadingVersions(false);
      }
    }
  };

  // Selected Entities
  const activeSection = document.sections.find((s) => s.id === selectedSectionId) || null;
  const activeBlock = activeSection?.blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#07090E] text-slate-100 overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-bottom-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
              : toastMessage.type === 'info'
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
              : 'bg-rose-950 border-rose-500 text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <BuilderToolbar
        device={device}
        onDeviceChange={setDevice}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
        isPreviewOpen={isPreviewOpen}
        onOpenVersions={handleOpenVersions}
        onOpenPresets={presets.length > 0 ? () => setIsPresetsOpen(true) : undefined}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
        document={document}
      />

      {/* Main Workspace (Left Sidebar + Center Canvas + Right Inspector) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Blocks & Layers Sidebar */}
        {isSidebarOpen && (
          <BuilderSidebar
            document={document}
            onAddBlock={handleAddBlockFromSidebar}
            onAddSection={handleAddSection}
            onSelectBlock={(blockId, sectionId) => {
              setSelectedSectionId(sectionId);
              setSelectedBlockId(blockId);
              setIsInspectorOpen(true);
            }}
            onSelectSection={(sectionId) => {
              setSelectedSectionId(sectionId);
              setSelectedBlockId(null);
              setIsInspectorOpen(true);
            }}
            selectedBlockId={selectedBlockId}
            selectedSectionId={selectedSectionId}
            onUpdateTheme={(themeUpdates) => {
              const next = { ...document, theme: { ...document.theme, ...themeUpdates } };
              pushState(next);
            }}
            onDeleteSection={handleDeleteSection}
            onDeleteBlock={handleDeleteBlock}
            onToggleSectionVisibility={handleToggleSectionVisibility}
            onToggleBlockVisibility={handleToggleBlockVisibility}
          />
        )}

        {/* Center Interactive WYSIWYG Canvas */}
        <BuilderCanvas
          document={document}
          device={device}
          selectedSectionId={selectedSectionId}
          selectedBlockId={selectedBlockId}
          onSelectSection={(secId) => {
            setSelectedSectionId(secId);
            setSelectedBlockId(null);
            setIsInspectorOpen(true);
          }}
          onSelectBlock={(blkId, secId) => {
            setSelectedSectionId(secId);
            setSelectedBlockId(blkId);
            setIsInspectorOpen(true);
          }}
          onAddSection={handleAddSection}
          onAddBlockToSection={(secId) => handleAddBlockToSection(secId, 'text')}
          onDeleteSection={handleDeleteSection}
          onDuplicateSection={handleDuplicateSection}
          onToggleSectionVisibility={handleToggleSectionVisibility}
          onMoveSection={handleMoveSection}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
          onToggleBlockVisibility={handleToggleBlockVisibility}
          onMoveBlock={handleMoveBlock}
          onReorderBlocks={handleReorderBlocks}
          onDeselect={() => {
            setSelectedSectionId(null);
            setSelectedBlockId(null);
          }}
          tenantSlug={tenantSlug}
        />

        {/* Right Inspector Panel */}
        {isInspectorOpen && (
          <BlockSettingsPanel
            block={activeBlock}
            section={activeSection}
            theme={document.theme}
            onUpdateBlock={handleUpdateBlock}
            onUpdateSection={handleUpdateSection}
            onClose={() => {
              setSelectedSectionId(null);
              setSelectedBlockId(null);
              setIsInspectorOpen(false);
            }}
          />
        )}
      </div>

      {/* MODAL 1: PRESETS ARCHETYPE MODAL */}
      {isPresetsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Layout Archetype Presets
                </h3>
              </div>
              <button onClick={() => setIsPresetsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Apply a battle-tested preset as a starting canvas. Everything remains 100% editable afterwards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {presets.map((p) => (
                <div
                  key={p.id}
                  onClick={async () => {
                    const ok = await showConfirmModal({
                      title: 'Apply Preset Layout?',
                      message: `Apply "${p.name}" preset? Your current canvas will be updated with this layout.`,
                      confirmLabel: 'Apply Preset',
                      isDestructive: false,
                      type: 'info',
                    });
                    if (!ok) return;
                      const applied: BuilderDocument = {
                        ...document,
                        ...(p.document as any),
                        tenantSlug,
                        version: document.version,
                        status: 'draft',
                      };
                      pushState(applied);
                      setIsPresetsOpen(false);
                      showToast(`Applied preset: ${p.name}`);
                  }}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400">{p.name}</h4>
                    {p.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 font-bold uppercase tracking-wider border border-rose-800">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VERSION HISTORY MODAL */}
      {isVersionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F131D] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Version History &amp; Rollbacks
                </h3>
              </div>
              <button onClick={() => setIsVersionsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingVersions ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading version snapshots...</div>
            ) : versionsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No past versions found. Published builds are snapshotted automatically.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {versionsList.map((v) => (
                  <div
                    key={v.versionId || v.version}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">v{v.version}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {v.publishedAt ? new Date(v.publishedAt).toLocaleString() : 'Draft'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{v.changeSummary || 'Snapshot'}</p>
                    </div>

                    <button
                      onClick={async () => {
                        const ok = await showConfirmModal({
                          title: 'Rollback Version?',
                          message: `Are you sure you want to rollback to version ${v.version}?`,
                          confirmLabel: `Rollback to v${v.version}`,
                          isDestructive: true,
                          type: 'warning',
                        });
                        if (!ok) return;
                          if (onRestoreVersion) {
                            const restored = await onRestoreVersion(v.versionId || String(v.version));
                            if (restored) pushState(restored);
                          } else if (v.snapshot) {
                            pushState(v.snapshot);
                          }
                          setIsVersionsOpen(false);
                          showToast(`Restored version ${v.version}`);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: FULLSCREEN LIVE PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-md flex flex-col">
          <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Live Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                {device.toUpperCase()} MODE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    device === 'desktop' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    device === 'tablet' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                    device === 'mobile' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-start bg-black/40">
            <div
              style={{
                backgroundColor: document.theme?.backgroundColor || '#07090E',
                color: document.theme?.textColor || '#F8FAFC',
                fontFamily: document.theme?.fontFamily,
              }}
              className={`transition-all duration-300 border border-white/10 rounded-2xl p-8 ${
                device === 'desktop'
                  ? 'w-full max-w-7xl'
                  : device === 'tablet'
                  ? 'w-[768px] shadow-2xl rounded-3xl'
                  : 'w-[390px] shadow-2xl rounded-[36px]'
              }`}
            >
              {document.sections
                .filter((s) => s.enabled !== false && s.responsive?.[device]?.visible !== false)
                .map((sec) => {
                  const cols =
                    device === 'desktop'
                      ? sec.layout.columns?.desktop || 4
                      : device === 'tablet'
                      ? sec.layout.columns?.tablet || 2
                      : sec.layout.columns?.mobile || 1;

                  const gridClass =
                    cols === 1
                      ? 'grid grid-cols-1'
                      : cols === 2
                      ? 'grid grid-cols-1 sm:grid-cols-2 gap-8'
                      : cols === 3
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8';

                  return (
                    <div
                      key={sec.id}
                      style={{
                        borderColor: sec.styles.borderColor || 'rgba(255,255,255,0.08)',
                        borderBottomWidth: sec.styles.borderBottomWidth || '0px',
                        borderTopWidth: sec.styles.borderTopWidth || '0px',
                      }}
                      className={`py-6 ${gridClass}`}
                    >
                      {sec.blocks
                        .filter((b) => b.enabled !== false && b.responsive?.[device]?.visible !== false)
                        .map((b) => (
                          <div key={b.id} className="min-w-0 max-w-full overflow-hidden">
                            <BuilderBlockRenderer
                              block={b}
                              device={device}
                              isEditor={false}
                              tenantSlug={tenantSlug}
                            />
                          </div>
                        ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
