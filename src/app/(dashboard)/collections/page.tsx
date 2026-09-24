'use client';

import { useConfirm } from '@/lib/modal-context';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  Sparkles,
  Search,
  Check,
  Package,
  X,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CollectionService } from '@/services/collections';
import { ProductService } from '@/services/products';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { Collection, Product } from '@/types';

export default function CollectionsPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'manual' | 'automated'>('manual');
  const [isVisible, setIsVisible] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Product Picker Filter State
  const [productSearch, setProductSearch] = useState('');
  const [productTab, setProductTab] = useState<'all' | 'selected'>('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [colList, prodList] = await Promise.all([
        CollectionService.getAll(),
        ProductService.getAll(),
      ]);
      setCollections(colList);
      setAllProducts(prodList);
    } catch (err) {
      console.error('Failed to load collections or products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCol(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setType('manual');
    setIsVisible(true);
    setSelectedProductIds([]);
    setProductSearch('');
    setProductTab('all');
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCol(col);
    setTitle(col.title);
    setSlug(col.slug);
    setDescription(col.description || '');
    setImageUrl(col.imageUrl || '');
    setType(col.type);
    setIsVisible(col.isVisible);

    // Collect initial selected product IDs from both col.productIds and products having this collection
    const fromCol = Array.isArray(col.productIds) ? col.productIds : [];
    const fromProds = allProducts
      .filter((p) => p.collectionIds?.includes(col.id) || p.collectionIds?.includes(col.slug))
      .map((p) => p.id);
    const combined = Array.from(new Set([...fromCol, ...fromProds]));
    setSelectedProductIds(combined);

    setProductSearch('');
    setProductTab('all');
    setIsModalOpen(true);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Filtered products inside the modal picker
  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (productTab === 'selected') {
      list = list.filter((p) => selectedProductIds.includes(p.id));
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allProducts, productTab, selectedProductIds, productSearch]);

  const selectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const clearSelection = () => {
    if (productTab === 'selected') {
      setSelectedProductIds([]);
    } else {
      const filteredIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a collection title', 'error');
      return;
    }

    setIsSaving(true);
    const targetSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    try {
      if (editingCol) {
        await CollectionService.update(editingCol.id, {
          title,
          slug: targetSlug,
          description,
          imageUrl,
          type,
          isVisible,
          productIds: selectedProductIds,
          productCount: selectedProductIds.length,
        });
        showToast('Collection updated with ' + selectedProductIds.length + ' products', 'success');
      } else {
        await CollectionService.create({
          title,
          slug: targetSlug,
          description,
          imageUrl,
          type,
          isVisible,
          productIds: selectedProductIds,
          productCount: selectedProductIds.length,
        });
        showToast('Collection created with ' + selectedProductIds.length + ' products', 'success');
      }

      setIsModalOpen(false);
      // Refresh list to reflect authoritative changes
      const updatedList = await CollectionService.getAll();
      setCollections(updatedList);
    } catch (err: any) {
      showToast(err.message || 'Failed to save collection', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Collection',
      message: 'Are you sure you want to delete this collection? Products in this collection will not be deleted.',
      confirmLabel: 'Delete Collection',
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    try {
      await CollectionService.delete(id);
      showToast('Collection deleted', 'info');
      const updatedList = await CollectionService.getAll();
      setCollections(updatedList);
    } catch {
      showToast('Failed to delete collection', 'error');
    }
  };

  // Helper map for fast lookup of products by ID
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of allProducts) {
      map.set(p.id, p);
    }
    return map;
  }, [allProducts]);

  return (
    <div className="space-y-6 pb-20 select-none max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Catalog Collections
            </span>
            <span className="text-[10px] bg-rose-500/10 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-rose-500/20">
              {collections.length} Curations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Collections &amp; Lookbooks</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Curate seasonal edits, attach lookbook products, and organize fashion stories for your boutique.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-[#161822] border border-slate-800 rounded-2xl p-5 h-48 animate-pulse space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-800 rounded w-2/3" />
              <div className="h-12 bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-[#161822] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Collections Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Create your first seasonal lookbook or product collection to showcase curated assortments on your storefront.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
          >
            + Create First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((col) => {
            const assignedIds = Array.isArray(col.productIds) ? col.productIds : [];
            const effectiveCount = col.productCount ?? assignedIds.length;
            const assignedPreviewProducts = assignedIds
              .map((id) => productMap.get(id))
              .filter((p): p is Product => !!p);

            return (
              <div
                key={col.id}
                className="bg-[#161822] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                        col.type === 'automated'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}
                    >
                      {col.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono font-bold bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">
                      {effectiveCount} {effectiveCount === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-200 transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {col.description || 'No collection description provided.'}
                    </p>
                  </div>

                  {/* Visual Products Thumbnail Stack */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Assigned Items
                    </span>
                    {assignedPreviewProducts.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden py-1">
                          {assignedPreviewProducts.slice(0, 4).map((p, idx) => (
                            <img
                              key={p.id || idx}
                              src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200'}
                              alt={p.title}
                              title={`${p.title} (${p.sku})`}
                              className="inline-block h-8 w-8 rounded-lg object-cover ring-2 ring-[#161822] shadow-sm bg-slate-800"
                            />
                          ))}
                        </div>
                        {assignedPreviewProducts.length > 4 && (
                          <span className="text-[10px] font-mono text-slate-400 font-semibold bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50">
                            +{assignedPreviewProducts.length - 4} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => openEditModal(col)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 py-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add products to this lookbook</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                    /{col.slug}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(col)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit &amp; Products</span>
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      title="Delete Collection"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL WITH PRODUCT PICKER */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCol ? `Edit Collection: ${editingCol.title}` : 'Create Collection & Lookbook'}
          subtitle="Configure collection details and assign garments to curate this lookbook."
          maxWidth="4xl"
        >
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* Top Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0E1017] p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Collection Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Heritage Festive Drop"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug || !editingCol) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#161822] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. royal-heritage-festive"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161822] border border-slate-700/80 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Collection Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#161822] border border-slate-700/80 rounded-lg text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="manual">Manual (Admin curates specific products)</option>
                  <option value="automated">Automated (Dynamic tags &amp; prices)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Cover Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161822] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">Editorial Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the aesthetic, fabric craftsmanship, or seasonal inspiration behind this drop..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161822] border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* PRODUCT SELECTOR SECTION */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Products in this Lookbook / Collection</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono text-[11px]">
                      {selectedProductIds.length} Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select the garments that will be featured and displayed in this collection.
                  </p>
                </div>

                {/* Tabs & Quick Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#0E1017] p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setProductTab('all')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        productTab === 'all'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Products ({allProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductTab('selected')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        productTab === 'selected'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Selected ({selectedProductIds.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[11px] font-semibold transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-md text-[11px] font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title, SKU, brand, or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#0E1017] border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 text-xs"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Product Picker List */}
              <div className="border border-slate-800 rounded-xl bg-[#0E1017] overflow-hidden">
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1">
                  {filteredProducts.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 space-y-1">
                      <Package className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                      <p className="font-medium">
                        {productTab === 'selected'
                          ? 'No products currently selected for this collection.'
                          : 'No products match your search query.'}
                      </p>
                      {productTab === 'selected' && (
                        <button
                          type="button"
                          onClick={() => setProductTab('all')}
                          className="text-rose-400 hover:underline text-xs mt-1 inline-block"
                        >
                          Browse all products to add items &rarr;
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      const thumbUrl = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200';

                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProduct(prod.id)}
                          className={`flex items-center justify-between gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/30'
                              : 'hover:bg-slate-800/50 border border-transparent'
                          }`}
                        >
                          {/* Checkbox and Product Details */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? 'bg-rose-600 text-white'
                                  : 'border border-slate-600 bg-slate-900/60'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <img
                              src={thumbUrl}
                              alt={prod.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700/60 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate">{prod.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  SKU: {prod.sku || 'N/A'}
                                </span>
                                {prod.brand && (
                                  <span className="text-[10px] text-slate-400">&bull; {prod.brand}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price and Badges */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-rose-300 font-mono">
                              &#8377;{Number(prod.price || 0).toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                prod.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              }`}
                            >
                              {prod.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Total Assigned:{' '}
                <span className="font-bold text-white font-mono">
                  {selectedProductIds.length} {selectedProductIds.length === 1 ? 'product' : 'products'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Collection...</span>
                    </>
                  ) : (
                    <span>Save Collection ({selectedProductIds.length} Products)</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
