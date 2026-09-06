/**
 * Module 38: BuilderInspector Component
 * Elementor-style property inspector with Content, Style, and Advanced tabs.
 */

'use client';

import React, { useState } from 'react';
import {
  Type,
  Palette,
  Sliders,
  Maximize2,
  Box,
  Eye,
  Trash2,
  Copy,
  Plus,
  Link as LinkIcon,
  Unlink,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { useBuilder } from './builder-context';
import { DeviceType, NodeSpacing } from '@/lib/page-builder/types';
import { COMPONENT_REGISTRY } from '@/lib/page-builder/registry';

export function BuilderInspector() {
  const {
    selectedNode,
    selectedNodeId,
    activeInspectorTab,
    setActiveInspectorTab,
    activeDevice,
    setActiveDevice,
    updateWidgetContent,
    updateWidgetStyle,
    updateWidgetResponsive,
    deleteWidget,
    duplicateWidget,
    copyStyle,
    pasteStyle,
    hasStyleClipboard,
  } = useBuilder();

  if (!selectedNode || !selectedNodeId) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center text-slate-500 bg-[#0D111A]">
        <Box className="w-10 h-10 mb-3 opacity-30 text-slate-400" />
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Element Selected</h4>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
          Click on any element or container in the canvas to inspect and customize its properties.
        </p>
      </div>
    );
  }

  const regItem = COMPONENT_REGISTRY[selectedNode.type];
  const content = selectedNode.content || {};
  const style = selectedNode.style || {};

  return (
    <div className="flex flex-col h-full bg-[#0D111A] text-white select-none">
      {/* Inspector Header with Node Name & Action Tools */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate">
              {selectedNode.metadata?.name || regItem?.label || selectedNode.type}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
              {selectedNode.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => copyStyle(selectedNode.id)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
            title="Copy Style"
          >
            Copy Style
          </button>
          {hasStyleClipboard && (
            <button
              type="button"
              onClick={() => pasteStyle(selectedNode.id)}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
              title="Paste Style"
            >
              Paste Style
            </button>
          )}
        </div>
      </div>

      {/* Tabs Header: Content | Style | Advanced */}
      <div className="flex border-b border-slate-800 bg-[#090D15]">
        <button
          type="button"
          onClick={() => setActiveInspectorTab('content')}
          className={`flex-1 py-2.5 text-xs font-bold transition-colors text-center ${
            activeInspectorTab === 'content'
              ? 'text-rose-400 border-b-2 border-rose-500 bg-[#0D111A]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Content
        </button>
        <button
          type="button"
          onClick={() => setActiveInspectorTab('style')}
          className={`flex-1 py-2.5 text-xs font-bold transition-colors text-center ${
            activeInspectorTab === 'style'
              ? 'text-rose-400 border-b-2 border-rose-500 bg-[#0D111A]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Style
        </button>
        <button
          type="button"
          onClick={() => setActiveInspectorTab('advanced')}
          className={`flex-1 py-2.5 text-xs font-bold transition-colors text-center ${
            activeInspectorTab === 'advanced'
              ? 'text-rose-400 border-b-2 border-rose-500 bg-[#0D111A]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Advanced
        </button>
      </div>

      {/* Tab 1: Content Tab */}
      {activeInspectorTab === 'content' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Heading Fields */}
          {selectedNode.type === 'heading' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Headline Text
                </label>
                <textarea
                  rows={2}
                  value={content.text || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    HTML Tag
                  </label>
                  <select
                    value={content.tag || 'h2'}
                    onChange={(e) => updateWidgetContent(selectedNode.id, { tag: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                    <option value="p">Paragraph</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={content.link || ''}
                    onChange={(e) => updateWidgetContent(selectedNode.id, { link: e.target.value })}
                    placeholder="/collections"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* Text Editor Fields */}
          {selectedNode.type === 'text' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Paragraph Copy
              </label>
              <textarea
                rows={5}
                value={content.text || ''}
                onChange={(e) => updateWidgetContent(selectedNode.id, { text: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs leading-relaxed"
              />
            </div>
          )}

          {/* Button Fields */}
          {selectedNode.type === 'button' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={content.text || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { text: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target Link URL
                </label>
                <input
                  type="text"
                  value={content.link || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { link: e.target.value })}
                  placeholder="/collections/festive"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </>
          )}

          {/* Image Fields */}
          {selectedNode.type === 'image' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Image Source URL
                </label>
                <input
                  type="text"
                  value={content.url || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Alt Description
                </label>
                <input
                  type="text"
                  value={content.alt || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { alt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
            </>
          )}

          {/* Container Layout Fields */}
          {(selectedNode.type === 'container' || selectedNode.type === 'section') && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Flex Direction
                </label>
                <select
                  value={content.direction || 'column'}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { direction: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="column">Vertical (Column)</option>
                  <option value="row">Horizontal (Row / Columns)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-white block">Boxed Width Container</span>
                  <span className="text-[10px] text-slate-400">Constrains max-width to 1280px</span>
                </div>
                <input
                  type="checkbox"
                  checked={content.boxed !== false}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { boxed: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
              </div>
            </>
          )}

          {/* Value Propositions Cards List */}
          {selectedNode.type === 'value_props' && (
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Value Proposition Cards ({((content.items as any[]) || []).length})
              </label>
              {((content.items as any[]) || []).map((card: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase">Card #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const list = [...(content.items || [])];
                        list.splice(idx, 1);
                        updateWidgetContent(selectedNode.id, { items: list });
                      }}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => {
                      const list = [...(content.items || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      updateWidgetContent(selectedNode.id, { items: list });
                    }}
                    placeholder="Card Title"
                    className="w-full px-2.5 py-1.5 bg-[#0B0D14] border border-slate-700 rounded text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={card.description || ''}
                    onChange={(e) => {
                      const list = [...(content.items || [])];
                      list[idx] = { ...list[idx], description: e.target.value };
                      updateWidgetContent(selectedNode.id, { items: list });
                    }}
                    placeholder="Description..."
                    className="w-full px-2.5 py-1.5 bg-[#0B0D14] border border-slate-700 rounded text-xs text-white"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const list = [...(content.items || [])];
                  list.push({ icon: 'sparkles', title: 'New Promise', description: 'Handcrafted luxury fabrics.' });
                  updateWidgetContent(selectedNode.id, { items: list });
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Add Promise Card</span>
              </button>
            </div>
          )}

          {/* Hero Banner Fields */}
          {selectedNode.type === 'hero' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tagline / Badge
                </label>
                <input
                  type="text"
                  value={content.tagline || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { tagline: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={content.heading || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { heading: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subheading
                </label>
                <textarea
                  rows={3}
                  value={content.subheading || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { subheading: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={content.bgImage || ''}
                  onChange={(e) => updateWidgetContent(selectedNode.id, { bgImage: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Style Tab (Elementor Style Controls) */}
      {activeInspectorTab === 'style' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Typography Controls */}
          <div className="space-y-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-rose-400" />
                Typography
              </span>
              {/* Responsive Device Indicator */}
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-400 uppercase">
                {activeDevice}
              </span>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Font Size</label>
              <input
                type="text"
                value={
                  (typeof style.typography?.fontSize === 'object'
                    ? (style.typography?.fontSize as any)[activeDevice]
                    : style.typography?.fontSize) || ''
                }
                onChange={(e) => {
                  const cur: any = typeof style.typography?.fontSize === 'object' ? { ...style.typography.fontSize } : { desktop: '' };
                  cur[activeDevice] = e.target.value;
                  updateWidgetStyle(selectedNode.id, {
                    typography: { ...style.typography, fontSize: cur },
                  });
                }}
                placeholder="e.g. 36px or 2.25rem"
                className="w-full px-3 py-1.5 bg-[#0B0D14] border border-slate-700 rounded text-white text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Font Weight</label>
                <select
                  value={style.typography?.fontWeight || '400'}
                  onChange={(e) =>
                    updateWidgetStyle(selectedNode.id, {
                      typography: { ...style.typography, fontWeight: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[#0B0D14] border border-slate-700 rounded text-white text-xs"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Text Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={style.typography?.color || '#111111'}
                    onChange={(e) =>
                      updateWidgetStyle(selectedNode.id, {
                        typography: { ...style.typography, color: e.target.value },
                      })
                    }
                    className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={style.typography?.color || ''}
                    onChange={(e) =>
                      updateWidgetStyle(selectedNode.id, {
                        typography: { ...style.typography, color: e.target.value },
                      })
                    }
                    placeholder="#111111"
                    className="flex-1 px-2 py-1 bg-[#0B0D14] border border-slate-700 rounded text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spacing Controls (Margin & Padding) */}
          <div className="space-y-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              Spacing ({activeDevice})
            </span>

            {/* Padding */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-medium">Padding (T / R / B / L)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['top', 'right', 'bottom', 'left'].map((side) => {
                  const curPadding =
                    typeof style.spacing?.padding === 'object'
                      ? (style.spacing.padding as any)[activeDevice] || {}
                      : {};
                  return (
                    <input
                      key={side}
                      type="text"
                      value={curPadding[side] || ''}
                      onChange={(e) => {
                        const nextObj = { ...curPadding, [side]: e.target.value };
                        const curSpacing: any = typeof style.spacing?.padding === 'object' ? { ...style.spacing.padding } : { desktop: {} };
                        curSpacing[activeDevice] = nextObj;
                        updateWidgetStyle(selectedNode.id, {
                          spacing: { ...style.spacing, padding: curSpacing },
                        });
                      }}
                      placeholder={side[0].toUpperCase()}
                      className="px-2 py-1 bg-[#0B0D14] border border-slate-700 rounded text-white text-xs font-mono text-center"
                    />
                  );
                })}
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 font-medium">Margin (T / R / B / L)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['top', 'right', 'bottom', 'left'].map((side) => {
                  const curMargin =
                    typeof style.spacing?.margin === 'object'
                      ? (style.spacing.margin as any)[activeDevice] || {}
                      : {};
                  return (
                    <input
                      key={side}
                      type="text"
                      value={curMargin[side] || ''}
                      onChange={(e) => {
                        const nextObj = { ...curMargin, [side]: e.target.value };
                        const curSpacing: any = typeof style.spacing?.margin === 'object' ? { ...style.spacing.margin } : { desktop: {} };
                        curSpacing[activeDevice] = nextObj;
                        updateWidgetStyle(selectedNode.id, {
                          spacing: { ...style.spacing, margin: curSpacing },
                        });
                      }}
                      placeholder={side[0].toUpperCase()}
                      className="px-2 py-1 bg-[#0B0D14] border border-slate-700 rounded text-white text-xs font-mono text-center"
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Controls */}
          <div className="space-y-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              Background
            </span>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.background?.color || '#ffffff'}
                  onChange={(e) =>
                    updateWidgetStyle(selectedNode.id, {
                      background: { ...style.background, type: 'color', color: e.target.value },
                    })
                  }
                  className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={style.background?.color || ''}
                  onChange={(e) =>
                    updateWidgetStyle(selectedNode.id, {
                      background: { ...style.background, type: 'color', color: e.target.value },
                    })
                  }
                  placeholder="#FAF6F2"
                  className="flex-1 px-2.5 py-1.5 bg-[#0B0D14] border border-slate-700 rounded text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Advanced Tab */}
      {activeInspectorTab === 'advanced' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Responsive Visibility Toggles */}
          <div className="space-y-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-rose-400" />
              Responsive Visibility
            </span>

            <div className="space-y-2">
              {[
                { key: 'desktop', label: 'Visible on Desktop (1024px+)' },
                { key: 'tablet', label: 'Visible on Tablet (768px–1023px)' },
                { key: 'mobile', label: 'Visible on Mobile (<768px)' },
              ].map(({ key, label }) => {
                const isVis =
                  selectedNode.responsive?.visibility?.[key as DeviceType] !== false;
                return (
                  <div key={key} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="text-[11px] text-slate-300">{label}</span>
                    <input
                      type="checkbox"
                      checked={isVis}
                      onChange={(e) => {
                        const cur = selectedNode.responsive?.visibility || { desktop: true, tablet: true, mobile: true };
                        updateWidgetResponsive(selectedNode.id, {
                          visibility: { ...cur, [key]: e.target.checked },
                        });
                      }}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom CSS Classes */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Custom CSS Classes
            </label>
            <input
              type="text"
              value={style.customClasses || ''}
              onChange={(e) => updateWidgetStyle(selectedNode.id, { customClasses: e.target.value })}
              placeholder="e.g. shadow-2xl hover:scale-105"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>

          {/* Z-Index */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Z-Index Layer
            </label>
            <input
              type="number"
              value={style.position?.zIndex || 0}
              onChange={(e) =>
                updateWidgetStyle(selectedNode.id, {
                  position: { ...style.position, zIndex: Number(e.target.value) },
                })
              }
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}
