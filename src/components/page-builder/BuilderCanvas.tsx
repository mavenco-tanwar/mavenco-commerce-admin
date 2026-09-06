/**
 * Module 38: BuilderCanvas Component
 * Responsive device viewport frame supporting drag-and-drop widget drops and live selection.
 */

'use client';

import React, { useState } from 'react';
import { useBuilder } from './builder-context';
import { PageRenderer } from './PageRenderer';
import { Plus, LayoutTemplate, Layers } from 'lucide-react';

export function BuilderCanvas() {
  const {
    rootNode,
    activeDevice,
    selectedNodeId,
    hoveredNodeId,
    selectNode,
    hoverNode,
    insertWidget,
    deleteWidget,
    duplicateWidget,
    moveWidget,
    setActiveLeftTab,
    previewMode,
  } = useBuilder();

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const widgetType = e.dataTransfer.getData('text/plain');
    if (widgetType) {
      insertWidget(selectedNodeId || 'root', widgetType);
    }
  };

  // Device canvas widths
  const getDeviceWidthClass = () => {
    if (activeDevice === 'mobile') return 'w-[390px] min-h-[844px] shadow-2xl rounded-3xl border-4 border-slate-800';
    if (activeDevice === 'tablet') return 'w-[768px] min-h-[1024px] shadow-2xl rounded-2xl border-4 border-slate-800';
    return 'w-full min-h-screen';
  };

  const isEmpty = !rootNode.children || rootNode.children.length === 0;

  return (
    <div
      onClick={() => selectNode(null)}
      className="flex-1 overflow-y-auto bg-[#07090E] p-4 sm:p-8 flex flex-col items-center justify-start select-none relative"
    >
      {/* Device Viewport Wrapper */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-all duration-300 bg-[#FFFDFC] text-[#111111] overflow-x-hidden ${getDeviceWidthClass()} ${
          isDragOver ? 'ring-4 ring-rose-500/50' : ''
        }`}
      >
        {/* Render Root and its children via PageRenderer in Editor mode */}
        <PageRenderer
          rootNode={rootNode}
          mode={previewMode ? 'storefront' : 'editor'}
          activeDevice={activeDevice}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={selectNode}
          onHoverNode={hoverNode}
          onInsertNode={insertWidget}
          onDeleteNode={deleteWidget}
          onDuplicateNode={duplicateWidget}
          onMoveNode={moveWidget}
        />

        {/* Empty Canvas Callout */}
        {isEmpty && (
          <div className="py-24 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF6F2] border border-[#E8DED8] flex items-center justify-center text-[#B77A68]">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#111111]">Canvas is Empty</h3>
              <p className="text-xs text-[#777777]">
                Start designing your storefront page by adding a container or choosing a pre-built luxury template.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => insertWidget('root', 'container')}
                className="px-4 py-2.5 bg-[#111111] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4 text-rose-400" />
                <span>+ Add Container</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeftTab('templates')}
                className="px-4 py-2.5 bg-[#FAF6F2] hover:bg-[#F3ECE5] text-[#111111] border border-[#E8DED8] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LayoutTemplate className="w-4 h-4 text-[#B77A68]" />
                <span>Browse Templates</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
