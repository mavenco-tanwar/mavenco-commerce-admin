/**
 * Module 38: NavigatorPanel Component
 * Interactive DOM tree viewer with live selection, reordering, and element deletion.
 */

'use client';

import React from 'react';
import {
  Layers,
  ChevronRight,
  ChevronDown,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BuilderNode } from '@/lib/page-builder/types';
import { COMPONENT_REGISTRY } from '@/lib/page-builder/registry';
import { useBuilder } from './builder-context';

export function NavigatorPanel() {
  const {
    rootNode,
    selectedNodeId,
    selectNode,
    hoverNode,
    deleteWidget,
    duplicateWidget,
    moveWidget,
    updateWidgetResponsive,
  } = useBuilder();

  const renderTreeItem = (node: BuilderNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedNodeId === node.id;
    const regItem = COMPONENT_REGISTRY[node.type];
    const Icon = regItem?.icon || Layers;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isRoot = node.type === 'root';

    return (
      <div key={node.id} className="flex flex-col">
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectNode(node.id);
          }}
          onMouseEnter={() => hoverNode(node.id)}
          onMouseLeave={() => hoverNode(null)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`h-8 pr-2 flex items-center justify-between text-xs cursor-pointer group transition-colors select-none ${
            isSelected
              ? 'bg-rose-600 text-white font-bold'
              : 'text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Icon className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate text-[11px]">
              {node.metadata?.name || regItem?.label || node.type}
            </span>
          </div>

          {/* Action Icons */}
          {!isRoot && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveWidget(node.id, 'up');
                }}
                className="p-1 hover:bg-black/20 rounded"
                title="Move Up"
              >
                <MoveUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveWidget(node.id, 'down');
                }}
                className="p-1 hover:bg-black/20 rounded"
                title="Move Down"
              >
                <MoveDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateWidget(node.id);
                }}
                className="p-1 hover:bg-black/20 rounded"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteWidget(node.id);
                }}
                className="p-1 hover:bg-black/20 rounded text-rose-300 hover:text-white"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {hasChildren && (
          <div className="flex flex-col">
            {node.children.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0D111A] text-white">
      <div className="h-10 px-4 border-b border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
        <span>Structure Navigator</span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {renderTreeItem(rootNode)}
      </div>
    </div>
  );
}
