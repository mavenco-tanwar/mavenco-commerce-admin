/**
 * Module 38: ElementsPanel Component
 * Categorized widgets with instant search and insertion into canvas.
 */

'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { COMPONENT_REGISTRY } from '@/lib/page-builder/registry';
import { useBuilder } from './builder-context';

export function ElementsPanel() {
  const { insertWidget, selectedNodeId, rootNode } = useBuilder();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'layout', label: 'Layout' },
    { id: 'basic', label: 'Basic' },
    { id: 'media', label: 'Media' },
    { id: 'ecommerce', label: 'Ecommerce' },
    { id: 'marketing', label: 'Marketing' },
  ];

  const items = Object.values(COMPONENT_REGISTRY).filter((item) => {
    if (item.type === 'root') return false; // root cannot be inserted manually
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAdd = (widgetType: string) => {
    // If a container is selected, insert into it; otherwise insert into root
    const targetParentId = selectedNodeId || 'root';
    insertWidget(targetParentId, widgetType);
  };

  return (
    <div className="flex flex-col h-full bg-[#0D111A] text-white select-none">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search widgets & elements..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2.5 content-start">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.type}
              onClick={() => handleAdd(item.type)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.type);
              }}
              className="p-3 bg-[#090D15] hover:bg-slate-900 border border-slate-800/90 hover:border-rose-500/60 rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all group hover:scale-[1.02]"
              title={item.description}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-rose-400 group-hover:border-rose-500/40 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 w-full">
                <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">
                  {item.label}
                </h4>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-2 py-12 text-center text-xs text-slate-500">
            No widgets found matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
