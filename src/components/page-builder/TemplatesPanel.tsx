/**
 * Module 38: TemplatesPanel Component
 * Pre-built section and page templates library with one-click insertion.
 */

'use client';

import React, { useState } from 'react';
import { LayoutTemplate, Sparkles, Plus, ArrowRight, Bookmark } from 'lucide-react';
import { BuilderTemplate } from '@/lib/page-builder/types';
import { useBuilder } from './builder-context';

export const PREBUILT_TEMPLATES: BuilderTemplate[] = [
  {
    id: 'tmpl_luxury_hero',
    tenantId: 'platform',
    type: 'section',
    name: 'Atelier Luxury Hero Banner',
    category: 'Hero & Promo',
    isPlatform: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      id: 'sec_hero_tmpl',
      type: 'hero',
      parentId: 'root',
      children: [],
      content: {
        tagline: 'SPRING / SUMMER 2026 DROP',
        heading: 'Curated Modern Design',
        subheading: 'High-precision craftsmanship, sustainable materials, and timeless aesthetic silhouettes.',
        primaryBtnText: 'Explore New In',
        primaryBtnLink: '/collections',
        secondaryBtnText: 'View Collections',
        secondaryBtnLink: '/about',
        bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
        overlayOpacity: 40,
      },
      style: {
        spacing: {
          padding: { desktop: { top: '100px', right: '24px', bottom: '100px', left: '24px' } },
        },
      },
    },
  },
  {
    id: 'tmpl_guarantees',
    tenantId: 'platform',
    type: 'section',
    name: 'Brand Value Propositions (4 Cards)',
    category: 'Marketing',
    isPlatform: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      id: 'sec_vprops_tmpl',
      type: 'value_props',
      parentId: 'root',
      children: [],
      content: {
        items: [
          { icon: 'sparkles', title: 'Trendy Collections', description: 'Handpicked silhouettes updated weekly.' },
          { icon: 'award', title: 'Premium Quality', description: 'Breathable, skin-friendly luxury fabrics.' },
          { icon: 'tag', title: 'Affordable Luxury', description: 'Runway-inspired luxury at direct prices.' },
          { icon: 'truck', title: 'Easy Delivery & Returns', description: 'Complimentary express doorstep returns.' },
        ],
      },
      style: {
        spacing: {
          padding: { desktop: { top: '32px', right: '16px', bottom: '32px', left: '16px' } },
        },
      },
    },
  },
  {
    id: 'tmpl_product_grid',
    tenantId: 'platform',
    type: 'section',
    name: 'Featured Best Sellers Grid',
    category: 'Ecommerce',
    isPlatform: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      id: 'sec_grid_tmpl',
      type: 'product_grid',
      parentId: 'root',
      children: [],
      content: {
        heading: 'Featured Essentials',
        subtitle: 'Artisanal tailoring crafted for timeless versatility.',
        columns: 4,
        limit: 8,
      },
      style: {
        spacing: {
          padding: { desktop: { top: '48px', right: '20px', bottom: '48px', left: '20px' } },
        },
      },
    },
  },
  {
    id: 'tmpl_split_editorial',
    tenantId: 'platform',
    type: 'section',
    name: 'Split 2-Column Editorial Story',
    category: 'Content',
    isPlatform: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: {
      id: 'sec_split_container',
      type: 'container',
      parentId: 'root',
      children: [
        {
          id: 'col_editorial_img',
          type: 'column',
          parentId: 'sec_split_container',
          children: [
            {
              id: 'img_editorial',
              type: 'image',
              parentId: 'col_editorial_img',
              children: [],
              content: {
                url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
                alt: 'Our Atelier Story',
              },
              style: {},
            },
          ],
          content: {},
          style: {},
        },
        {
          id: 'col_editorial_text',
          type: 'column',
          parentId: 'sec_split_container',
          children: [
            {
              id: 'hd_editorial',
              type: 'heading',
              parentId: 'col_editorial_text',
              children: [],
              content: { text: 'Artisanal Craftsmanship & Ethical Textiles', tag: 'h2' },
              style: { typography: { fontSize: { desktop: '32px' } } },
            },
            {
              id: 'txt_editorial',
              type: 'text',
              parentId: 'col_editorial_text',
              children: [],
              content: {
                text: 'Each silhouette is assembled by master artisans using organic chanderi silk and sustainably sourced linen weaves.',
              },
              style: {},
            },
            {
              id: 'btn_editorial',
              type: 'button',
              parentId: 'col_editorial_text',
              children: [],
              content: { text: 'Read Our Story', link: '/about' },
              style: {},
            },
          ],
          content: {},
          style: {},
        },
      ],
      content: { direction: 'row', boxed: true },
      style: {
        spacing: {
          padding: { desktop: { top: '64px', right: '20px', bottom: '64px', left: '20px' } },
        },
      },
    },
  },
];

export function TemplatesPanel() {
  const { insertTemplate } = useBuilder();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Hero & Promo', 'Marketing', 'Ecommerce', 'Content'];

  const filtered = PREBUILT_TEMPLATES.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  return (
    <div className="flex flex-col h-full bg-[#0D111A] text-white select-none">
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Template Library</h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-rose-400 font-mono">
            {PREBUILT_TEMPLATES.length} Templates
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-4 bg-[#090D15] hover:bg-slate-900 border border-slate-800/80 hover:border-rose-500/70 rounded-xl flex flex-col justify-between space-y-3 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {tmpl.category}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Platform</span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                {tmpl.name}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => insertTemplate(tmpl)}
              className="w-full py-2 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Insert Template</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
