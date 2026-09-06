'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { ContentService } from '@/services/content';
import { PlatformService } from '@/services/platform';
import { getTenantStorefrontUrl } from '@/services/api';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import type { Page } from '@/types';

export default function PagesManagerPage() {
  const { showToast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  // General Form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Hero Block State
  const [heroBadge, setHeroBadge] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');

  // Rich Text Body State
  const [bodyHeading, setBodyHeading] = useState('');
  const [bodyContent, setBodyContent] = useState('');

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const fetchPages = async () => {
    const list = await ContentService.getPages();
    setPages(list);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setStatus('published');

    setHeroBadge('OUR HERITAGE & VISION');
    setHeroTitle('');
    setHeroSubtitle('');
    setHeroImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop');

    setBodyHeading('');
    setBodyContent('');

    setSeoTitle('');
    setSeoDescription('');

    setIsModalOpen(true);
  };

  const openEditModal = (page: Page) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setStatus(page.status);

    const heroBlock = page.blocks?.find((b: any) => b.type === 'hero');
    const richTextBlock = page.blocks?.find((b: any) => b.type === 'rich-text');

    setHeroBadge(heroBlock?.data?.badge || '');
    setHeroTitle(heroBlock?.data?.title || page.title);
    setHeroSubtitle(heroBlock?.data?.subtitle || '');
    setHeroImage(heroBlock?.data?.image || '');

    setBodyHeading(richTextBlock?.data?.heading || '');
    setBodyContent(richTextBlock?.data?.content || '');

    setSeoTitle(page.seo?.title || page.title);
    setSeoDescription(page.seo?.description || '');

    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedBlocks = [
      {
        type: 'hero',
        data: {
          title: heroTitle || title,
          subtitle: heroSubtitle,
          badge: heroBadge,
          image: heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop',
        },
      },
      {
        type: 'rich-text',
        data: {
          heading: bodyHeading || title,
          content: bodyContent,
        },
      },
    ];

    const seoPayload = {
      title: seoTitle || `${title} | JQ Trends`,
      description: seoDescription || `Explore ${title} at JQ Trends luxury fashion.`,
    };

    if (editingPage) {
      await ContentService.updatePage(editingPage.id, {
        title,
        slug,
        status,
        blocks: formattedBlocks as any,
        seo: seoPayload,
      });
      showToast('Page content updated and published live', 'success');
    } else {
      await ContentService.createPage({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status,
        blocks: formattedBlocks as any,
        seo: seoPayload,
      });
      showToast('Page created and published live', 'success');
    }

    setIsModalOpen(false);
    fetchPages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    await ContentService.deletePage(id);
    showToast('Page deleted', 'info');
    fetchPages();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Content Management
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Website Pages</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage static storefront content pages, legal policies, and custom editorial blogs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Page</span>
        </button>
      </div>

      <div className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-800/60 text-xs">
          {pages.map((p) => (
            <div
              key={p.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{p.title}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded ${
                      p.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">/{p.slug}</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getTenantStorefrontUrl(PlatformService.getActiveTenant().slug, p.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>View</span>
                </a>
                <button
                  onClick={() => openEditModal(p)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Page Content Editor Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPage ? `Edit Page: ${editingPage.title}` : 'Create Website Page'}
          subtitle="Full Editorial & Content Customization"
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* General Page Settings */}
            <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Page Identification &amp; URL</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    placeholder="e.g. About JQ Trends"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="about-us"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="published">● Published (Live on Storefront)</option>
                  <option value="draft">○ Draft (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Hero Header Section */}
            <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Top Hero Banner</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge Tagline</label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="e.g. OUR HERITAGE & VISION"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hero Main Heading</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder={title || 'Page Headline'}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-serif text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="A brief intro sentence displayed below the title..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hero Background Image URL</label>
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Main Body Story & HTML Content */}
            <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Main Body Editorial Content</span>
              </h4>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Content Section Heading</label>
                <input
                  type="text"
                  value={bodyHeading}
                  onChange={(e) => setBodyHeading(e.target.value)}
                  placeholder="e.g. Where Tradition Meets Contemporary Silhouette"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Editorial Body Story &amp; Formatted Content *
                </label>
                <RichTextEditor
                  value={bodyContent}
                  onChange={setBodyContent}
                  placeholder="Write your story, policy terms, or brand narrative..."
                  minHeight="200px"
                />
              </div>
            </div>

            {/* SEO & Meta Tags */}
            <div className="bg-[#10121A] p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                <span>SEO &amp; Search Engine Metadata</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta Page Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="About JQ Trends | Luxury Women & Kids Fashion"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Meta Description</label>
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Discover the story of JQ Trends..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save &amp; Publish Content</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
