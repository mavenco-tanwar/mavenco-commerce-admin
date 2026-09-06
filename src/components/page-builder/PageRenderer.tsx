/**
 * Module 38: Unified PageRenderer
 * Identically renders the BuilderNode tree in both Editor mode and Storefront mode.
 */

'use client';

import React from 'react';
import { BuilderNode, DeviceType, PageDocument } from '@/lib/page-builder/types';
import { COMPONENT_REGISTRY } from '@/lib/page-builder/registry';
import { resolveResponsive } from '@/lib/page-builder/style-utils';
import {
  Copy,
  Trash2,
  MoveUp,
  MoveDown,
  Plus,
  GripVertical,
  Layers,
} from 'lucide-react';

interface PageRendererProps {
  page?: PageDocument | null;
  rootNode?: BuilderNode | null;
  mode: 'editor' | 'storefront';
  activeDevice?: DeviceType;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (id: string) => void;
  onHoverNode?: (id: string | null) => void;
  onInsertNode?: (parentId: string, type: string, index?: number) => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  contextData?: Record<string, any>;
}

export function PageRenderer({
  page,
  rootNode,
  mode,
  activeDevice = 'desktop',
  selectedNodeId = null,
  hoveredNodeId = null,
  onSelectNode,
  onHoverNode,
  onInsertNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  contextData,
}: PageRendererProps) {
  const root = rootNode || page?.content?.root;
  if (!root) {
    if (mode === 'editor') {
      return (
        <div className="py-24 text-center text-slate-400 space-y-4">
          <Layers className="w-12 h-12 mx-auto text-slate-500 opacity-50" />
          <h3 className="text-base font-bold text-slate-300">Start Building Your Page</h3>
          <p className="text-xs text-slate-500">Drag a container or widget from the left panel onto the canvas.</p>
        </div>
      );
    }
    return null;
  }

  const renderNode = (node: BuilderNode, parentNode: BuilderNode | null = null, index: number = 0): React.ReactNode => {
    // 1. Check Responsive Visibility
    if (node.responsive?.visibility) {
      const isVisible = resolveResponsive(node.responsive.visibility, activeDevice);
      if (isVisible === false) {
        if (mode === 'storefront') return null;
      }
    }

    const regItem = COMPONENT_REGISTRY[node.type];
    if (!regItem) {
      if (mode === 'editor') {
        return (
          <div key={node.id} className="p-3 border border-red-500 bg-red-950/20 text-red-400 text-xs rounded">
            Unrecognized widget type: {node.type}
          </div>
        );
      }
      return null;
    }

    const isSelected = mode === 'editor' && selectedNodeId === node.id;
    const isHovered = mode === 'editor' && hoveredNodeId === node.id && !isSelected;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    // Render children recursively
    const renderedChildren = hasChildren ? (
      node.children.map((child, idx) => renderNode(child, node, idx))
    ) : null;

    // In Storefront Mode: Clean, zero-editor-overhead rendering
    if (mode === 'storefront') {
      const Component = regItem.render;
      return (
        <React.Fragment key={node.id}>
          <Component
            node={node}
            mode="storefront"
            activeDevice={activeDevice}
            contextData={contextData}
          />
          {renderedChildren}
        </React.Fragment>
      );
    }

    // In Editor Mode: Interactive overlays, outlines, drag & drop zones, floating toolbars
    const Component = regItem.render;

    return (
      <div
        key={node.id}
        data-editor-node-id={node.id}
        data-editor-node-type={node.type}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          onHoverNode?.(node.id);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          onHoverNode?.(null);
        }}
        className={`relative transition-all group ${
          isSelected
            ? 'ring-2 ring-rose-500 z-20'
            : isHovered
            ? 'ring-1 ring-sky-400/80 z-10'
            : 'ring-1 ring-transparent hover:ring-slate-300/40'
        }`}
      >
        {/* Floating Action Header when Selected */}
        {isSelected && (
          <div
            className="absolute -top-7 left-0 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-t-md bg-rose-600 text-white text-[10px] font-bold shadow-lg select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="uppercase tracking-wider font-mono">{regItem.label}</span>

            {/* Move Up/Down Controls */}
            {parentNode && (
              <div className="flex items-center gap-0.5 ml-1 border-l border-white/20 pl-1">
                <button
                  type="button"
                  onClick={() => onMoveNode?.(node.id, 'up')}
                  disabled={index === 0}
                  className={`p-0.5 hover:bg-rose-700 rounded ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  title="Move Up"
                >
                  <MoveUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveNode?.(node.id, 'down')}
                  disabled={index === (parentNode.children?.length || 1) - 1}
                  className={`p-0.5 hover:bg-rose-700 rounded ${
                    index === (parentNode.children?.length || 1) - 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  title="Move Down"
                >
                  <MoveDown className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => onDuplicateNode?.(node.id)}
              className="p-0.5 hover:bg-rose-700 rounded ml-0.5"
              title="Duplicate Element"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* Delete (Cannot delete root) */}
            {node.type !== 'root' && (
              <button
                type="button"
                onClick={() => onDeleteNode?.(node.id)}
                className="p-0.5 hover:bg-rose-700 rounded ml-0.5 text-rose-200 hover:text-white"
                title="Delete Element"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* The Actual Component Rendered in Editor Mode */}
        <Component
          node={node}
          mode="editor"
          activeDevice={activeDevice}
          contextData={contextData}
        />

        {/* Children Render Area */}
        {regItem.supportsChildren && (
          <div className="relative min-h-[32px]">
            {renderedChildren}

            {/* Empty Container Drop Prompt */}
            {!hasChildren && (
              <div
                className="my-2 p-4 border-2 border-dashed border-slate-400/40 hover:border-rose-500/60 bg-slate-500/5 hover:bg-rose-500/5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode?.(node.id);
                }}
              >
                <Plus className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-medium">Empty {regItem.label}. Drop widgets or click to select.</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return <div className="w-full h-full">{renderNode(root)}</div>;
}
