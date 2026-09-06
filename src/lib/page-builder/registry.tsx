/**
 * Module 38: Centralized Component Registry
 * Identical registry shared by both the visual editor and storefront renderer.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutTemplate,
  Columns,
  Type,
  AlignLeft,
  FileText,
  MousePointerClick,
  Image as ImageIcon,
  Video,
  Minus,
  MoveVertical,
  Code,
  ShoppingBag,
  Grid,
  FolderTree,
  Boxes,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Mail,
  Award,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { ComponentRegistryItem, BuilderNode, DeviceType } from './types';
import { computeNodeStyle } from './style-utils';
import { resolveNodeContent } from './dynamic-data';

export const COMPONENT_REGISTRY: Record<string, ComponentRegistryItem> = {
  // 1. Structural Nodes
  root: {
    type: 'root',
    label: 'Canvas Root',
    category: 'layout',
    icon: LayoutTemplate,
    description: 'Root page container',
    defaultProps: {},
    supportsChildren: true,
    render: ({ node, mode, activeDevice, contextData }) => {
      const style = computeNodeStyle(node.style, activeDevice);
      return (
        <div
          id={node.id}
          data-node-id={node.id}
          data-node-type={node.type}
          style={style}
          className={`w-full min-h-[400px] flex flex-col ${node.style.customClasses || ''}`}
        >
          {/* Children will be rendered by PageRenderer */}
        </div>
      );
    },
  },

  container: {
    type: 'container',
    label: 'Container',
    category: 'layout',
    icon: Columns,
    description: 'Flex/Grid container for arranging columns and widgets',
    defaultProps: {
      content: {
        direction: 'column',
        boxed: true,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      },
      style: {
        size: { width: { desktop: '100%' } },
        spacing: {
          padding: { desktop: { top: '32px', right: '20px', bottom: '32px', left: '20px' } },
        },
      },
    },
    supportsChildren: true,
    render: ({ node, mode, activeDevice }) => {
      const content = node.content || {};
      const style = computeNodeStyle(node.style, activeDevice);
      const isRow = content.direction === 'row';
      const isBoxed = content.boxed !== false;

      return (
        <div
          id={node.id}
          data-node-id={node.id}
          data-node-type={node.type}
          style={style}
          className={`w-full ${isBoxed ? 'max-w-7xl mx-auto' : ''} flex ${
            isRow ? 'flex-col sm:flex-row' : 'flex-col'
          } ${node.style.customClasses || ''}`}
        />
      );
    },
  },

  column: {
    type: 'column',
    label: 'Column',
    category: 'layout',
    icon: Columns,
    description: 'Responsive column to place inside containers',
    defaultProps: {
      content: { widthFraction: 1 },
      style: {
        spacing: {
          padding: { desktop: { top: '12px', right: '12px', bottom: '12px', left: '12px' } },
        },
      },
    },
    supportsChildren: true,
    render: ({ node, mode, activeDevice }) => {
      const style = computeNodeStyle(node.style, activeDevice);
      return (
        <div
          id={node.id}
          data-node-id={node.id}
          data-node-type={node.type}
          style={style}
          className={`flex-1 flex flex-col min-w-0 ${node.style.customClasses || ''}`}
        />
      );
    },
  },

  // 2. Content & Typography
  heading: {
    type: 'heading',
    label: 'Heading',
    category: 'basic',
    icon: Type,
    description: 'H1–H6 headline with typography and link controls',
    defaultProps: {
      content: { text: 'Curated Atelier Modern', tag: 'h2', link: '' },
      style: {
        typography: {
          fontSize: { desktop: '36px', tablet: '28px', mobile: '24px' },
          fontWeight: '700',
          color: '#111111',
        },
        spacing: {
          margin: { desktop: { top: '0px', right: '0px', bottom: '16px', left: '0px' } },
        },
      },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice, contextData }) => {
      const content = resolveNodeContent(node.content, node.dataSource, contextData);
      const style = computeNodeStyle(node.style, activeDevice);
      const Tag = (content.tag || 'h2') as any;

      const inner = (
        <Tag style={style} className={`font-serif ${node.style.customClasses || ''}`}>
          {content.text || 'Heading'}
        </Tag>
      );

      if (content.link && mode === 'storefront') {
        return <Link href={content.link}>{inner}</Link>;
      }
      return inner;
    },
  },

  text: {
    type: 'text',
    label: 'Text Editor',
    category: 'basic',
    icon: AlignLeft,
    description: 'Paragraph body copy with responsive typography and spacing',
    defaultProps: {
      content: {
        text: 'Discover handcrafted silhouettes engineered for modern living and understated luxury.',
      },
      style: {
        typography: {
          fontSize: { desktop: '15px', tablet: '14px', mobile: '14px' },
          lineHeight: { desktop: '1.6' },
          color: '#555555',
        },
        spacing: {
          margin: { desktop: { top: '0px', right: '0px', bottom: '16px', left: '0px' } },
        },
      },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice, contextData }) => {
      const content = resolveNodeContent(node.content, node.dataSource, contextData);
      const style = computeNodeStyle(node.style, activeDevice);
      return (
        <p style={style} className={`font-sans ${node.style.customClasses || ''}`}>
          {content.text || ''}
        </p>
      );
    },
  },

  button: {
    type: 'button',
    label: 'Button',
    category: 'basic',
    icon: MousePointerClick,
    description: 'Call to action button with links, icons, and styling',
    defaultProps: {
      content: { text: 'Explore Collection', link: '/collections', target: '_self' },
      style: {
        typography: {
          fontSize: { desktop: '12px' },
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
        },
        background: { type: 'color', color: '#111111' },
        spacing: {
          padding: { desktop: { top: '14px', right: '28px', bottom: '14px', left: '28px' } },
        },
      },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice, contextData }) => {
      const content = resolveNodeContent(node.content, node.dataSource, contextData);
      const style = computeNodeStyle(node.style, activeDevice);

      const btn = (
        <button
          style={style}
          className={`inline-flex items-center justify-center transition-all cursor-pointer select-none ${
            node.style.customClasses || ''
          }`}
        >
          <span>{content.text || 'Click Here'}</span>
        </button>
      );

      if (content.link && mode === 'storefront') {
        return (
          <Link href={content.link} target={content.target || '_self'}>
            {btn}
          </Link>
        );
      }
      return btn;
    },
  },

  image: {
    type: 'image',
    label: 'Image',
    category: 'media',
    icon: ImageIcon,
    description: 'High-resolution responsive image with aspect ratio and links',
    defaultProps: {
      content: {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        alt: 'Curated Boutique Visual',
        aspectRatio: '3/4',
      },
      style: { size: { width: { desktop: '100%' } } },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice, contextData }) => {
      const content = resolveNodeContent(node.content, node.dataSource, contextData);
      const style = computeNodeStyle(node.style, activeDevice);

      return (
        <div style={style} className={`relative overflow-hidden ${node.style.customClasses || ''}`}>
          {content.url ? (
            <img
              src={content.url}
              alt={content.alt || ''}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
              No image selected
            </div>
          )}
        </div>
      );
    },
  },

  divider: {
    type: 'divider',
    label: 'Divider',
    category: 'basic',
    icon: Minus,
    description: 'Clean separator line between sections',
    defaultProps: {
      style: {
        border: { style: 'solid', width: { top: '1px' }, color: '#E8DED8' },
        spacing: {
          margin: { desktop: { top: '24px', right: '0px', bottom: '24px', left: '0px' } },
        },
      },
    },
    supportsChildren: false,
    render: ({ node, activeDevice }) => {
      const style = computeNodeStyle(node.style, activeDevice);
      return <hr style={style} className={`border-none ${node.style.customClasses || ''}`} />;
    },
  },

  spacer: {
    type: 'spacer',
    label: 'Spacer',
    category: 'basic',
    icon: MoveVertical,
    description: 'Vertical whitespace rhythm controller',
    defaultProps: {
      style: { size: { height: { desktop: '48px', tablet: '36px', mobile: '24px' } } },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice }) => {
      const style = computeNodeStyle(node.style, activeDevice);
      return (
        <div
          style={style}
          className={`w-full ${mode === 'editor' ? 'bg-slate-500/5 border border-dashed border-slate-300' : ''}`}
        >
          {mode === 'editor' && (
            <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-mono select-none">
              Spacer ({style.height || '48px'})
            </div>
          )}
        </div>
      );
    },
  },

  // 3. Ecommerce Widgets
  product_grid: {
    type: 'product_grid',
    label: 'Product Grid',
    category: 'ecommerce',
    icon: Grid,
    description: 'Live catalog product grid with query controls and responsive columns',
    defaultProps: {
      content: {
        heading: 'Featured Silhouettes',
        subtitle: 'Handcrafted with organic chanderi silk and fine mulmul.',
        columns: 4,
        limit: 8,
      },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice, contextData }) => {
      const content = resolveNodeContent(node.content, node.dataSource, contextData);
      const style = computeNodeStyle(node.style, activeDevice);
      const cols = content.columns || 4;

      // Mock showcase cards for preview or real data
      const demoProducts = [
        { title: 'Chanderi Silk Anarkali', price: '₹4,990', tag: 'Bestseller', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop' },
        { title: 'Zari Border Kurti Set', price: '₹3,450', tag: 'New', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop' },
        { title: 'Mulmul Festive Co-ord', price: '₹2,890', tag: 'Trending', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop' },
        { title: 'Embroidered Mirror Dress', price: '₹5,200', tag: 'Limited', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop' },
      ];

      return (
        <div style={style} className={`w-full py-8 ${node.style.customClasses || ''}`}>
          {content.heading && (
            <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
              <h3 className="text-2xl font-serif font-bold text-[#111111]">{content.heading}</h3>
              {content.subtitle && <p className="text-xs text-[#777777]">{content.subtitle}</p>}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {demoProducts.slice(0, cols).map((p, idx) => (
              <div key={idx} className="group bg-[#FFFDFC] border border-[#E8DED8] p-3 flex flex-col space-y-3">
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#111111]/80 text-white text-[9px] font-bold uppercase tracking-wider">
                    {p.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111111] truncate">{p.title}</h4>
                  <p className="text-xs font-medium text-[#B77A68] mt-1">{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },

  value_props: {
    type: 'value_props',
    label: 'Value Propositions',
    category: 'marketing',
    icon: Award,
    description: '4-column guarantee cards with authenticity and shipping perks',
    defaultProps: {
      content: {
        items: [
          { icon: 'sparkles', title: 'Trendy Collections', description: 'Handpicked silhouettes updated weekly.' },
          { icon: 'award', title: 'Premium Quality', description: 'Breathable, skin-friendly luxury fabrics.' },
          { icon: 'tag', title: 'Affordable Luxury', description: 'Runway-inspired luxury at fair prices.' },
          { icon: 'truck', title: 'Easy Delivery & Returns', description: 'Complimentary express shipping with easy returns.' },
        ],
      },
    },
    supportsChildren: false,
    render: ({ node, activeDevice }) => {
      const items = node.content?.items || [];
      const style = computeNodeStyle(node.style, activeDevice);
      return (
        <div style={style} className={`w-full py-8 ${node.style.customClasses || ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200/80 bg-white text-center space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">{item.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },

  hero: {
    type: 'hero',
    label: 'Hero Banner',
    category: 'marketing',
    icon: LayoutTemplate,
    description: 'High-impact full width banner with headline, CTAs, and background media',
    defaultProps: {
      content: {
        tagline: 'SPRING / SUMMER 2026 COLLECTION',
        heading: 'Curated Modern Design',
        subheading: 'High-precision craftsmanship, sustainable materials, and timeless aesthetic silhouettes.',
        primaryBtnText: 'Explore New In',
        primaryBtnLink: '/new-arrivals',
        secondaryBtnText: 'View Collections',
        secondaryBtnLink: '/collections',
        bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
        overlayOpacity: 40,
      },
    },
    supportsChildren: false,
    render: ({ node, mode, activeDevice, contextData }) => {
      const content = resolveNodeContent(node.content, node.dataSource, contextData);
      const style = computeNodeStyle(node.style, activeDevice);
      const opacity = (content.overlayOpacity || 40) / 100;

      return (
        <section
          style={style}
          className={`relative w-full py-24 sm:py-32 px-6 flex items-center justify-center overflow-hidden bg-[#111111] text-white ${
            node.style.customClasses || ''
          }`}
        >
          {content.bgImage && (
            <img
              src={content.bgImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity }}
            />
          )}
          <div className="relative z-10 max-w-3xl text-center space-y-6">
            {content.tagline && (
              <span className="inline-block px-3 py-1 bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-[#E8B8B5]">
                {content.tagline}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight">
              {content.heading || 'Curated Modern Design'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
              {content.subheading || ''}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {content.primaryBtnText && (
                <Link
                  href={content.primaryBtnLink || '/collections'}
                  className="px-6 py-3 bg-white text-[#111111] hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
                >
                  {content.primaryBtnText}
                </Link>
              )}
              {content.secondaryBtnText && (
                <Link
                  href={content.secondaryBtnLink || '/about'}
                  className="px-6 py-3 border border-white/40 hover:border-white text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {content.secondaryBtnText}
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    },
  },
};

export function getRegistryItem(type: string): ComponentRegistryItem | undefined {
  return COMPONENT_REGISTRY[type];
}

export function getAllRegistryItems(): ComponentRegistryItem[] {
  return Object.values(COMPONENT_REGISTRY);
}

