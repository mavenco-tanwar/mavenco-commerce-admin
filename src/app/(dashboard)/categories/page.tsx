'use client';

import { useConfirm } from '@/lib/modal-context';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  CornerDownRight,
  Image as ImageIcon,
  Folder,
} from 'lucide-react';
import { CategoryService } from '@/services/categories';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<'department' | 'subcategory'>('department');
  const [parentId, setParentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    const list = await CategoryService.getAll();
    setCategories(list);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    const handleTenantChange = () => {
      fetchCategories();
    };
    window.addEventListener('tenant_updated', handleTenantChange);
    window.addEventListener('storage', handleTenantChange);
    return () => {
      window.removeEventListener('tenant_updated', handleTenantChange);
      window.removeEventListener('storage', handleTenantChange);
    };
  }, []);

  const rootDepartments = categories.filter((c) => !c.parentId);

  const openCreateModal = (parentDeptId?: string) => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsVisible(true);

    if (parentDeptId) {
      setCategoryType('subcategory');
      setParentId(parentDeptId);
    } else {
      setCategoryType('department');
      setParentId(null);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setIsVisible(cat.isVisible);

    if (cat.parentId) {
      setCategoryType('subcategory');
      setParentId(cat.parentId);
    } else {
      setCategoryType('department');
      setParentId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveParentId = categoryType === 'subcategory' ? parentId : null;

    if (categoryType === 'subcategory' && !effectiveParentId) {
      showToast('Please select a parent department for this subcategory', 'error');
      return;
    }

    if (editingCat) {
      await CategoryService.update(editingCat.id, {
        name,
        slug,
        description,
        imageUrl,
        parentId: effectiveParentId,
        isVisible,
      });
      showToast(
        effectiveParentId ? 'Subcategory updated successfully' : 'Department updated successfully',
        'success'
      );
    } else {
      await CategoryService.create({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        imageUrl,
        parentId: effectiveParentId,
        isVisible,
      });
      showToast(
        effectiveParentId ? 'Subcategory created successfully' : 'Department created successfully',
        'success'
      );
    }
    setIsModalOpen(false);
    fetchCategories();
  };

  const handleDelete = async (id: string, isSub: boolean = false) => {
    const confirmMsg = isSub
      ? 'Are you sure you want to delete this subcategory?'
      : 'Are you sure you want to delete this department? Any nested subcategories will also be deleted.';

    const ok = await confirm({
      title: isSub ? 'Delete Subcategory' : 'Delete Department',
      message: confirmMsg,
      confirmLabel: 'Delete',
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    await CategoryService.delete(id);
    showToast(isSub ? 'Subcategory deleted' : 'Department deleted', 'info');
    fetchCategories();
  };

  const handleToggleVisibility = async (cat: Category) => {
    await CategoryService.update(cat.id, { isVisible: !cat.isVisible });
    showToast(`Visibility updated for ${cat.name}`, 'info');
    fetchCategories();
  };

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Catalog Structure
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              {rootDepartments.length} Departments
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Nested Categories</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize main departments, nested sub-categories, and storefront menu taxonomy.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      {/* Category Hierarchy List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`cat-skel-${i}`} className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-36 bg-slate-800 rounded" />
                      <div className="h-2.5 w-20 bg-slate-800/60 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-20 bg-slate-800 rounded-lg" />
                    <div className="h-6 w-16 bg-slate-800 rounded-lg" />
                  </div>
                </div>
                <div className="pl-11 pr-4 py-2 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="h-3 w-32 bg-slate-800/60 rounded" />
                  <div className="h-3 w-16 bg-slate-800/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : rootDepartments.length === 0 ? (
          <div className="bg-[#161822] border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
              <FolderTree className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white">No Categories Created Yet</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This store currently has no product categories. Add your own departments and sub-categories to organize your catalog and storefront navigation menu.
              </p>
            </div>
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Department</span>
            </button>
          </div>
        ) : (
          rootDepartments.map((parent) => (
            <div
              key={parent.id}
              className="bg-[#161822] border border-slate-800 hover:border-slate-700/80 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              {/* Parent Category Header */}
              <div className="p-4 bg-[#12141D] flex items-center justify-between gap-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                    {parent.imageUrl ? (
                      <img src={parent.imageUrl} alt={parent.name} className="w-full h-full object-cover" />
                    ) : (
                      <Folder className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{parent.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Department
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">/{parent.slug}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-lg">
                      {parent.description || 'Primary Catalog Department'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleVisibility(parent)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                      parent.isVisible
                        ? 'text-emerald-400 hover:bg-emerald-950/30'
                        : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={parent.isVisible ? 'Visible on storefront' : 'Hidden from storefront'}
                  >
                    {parent.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => openCreateModal(parent.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    title="Add a subcategory inside this department"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Subcategory</span>
                  </button>

                  <button
                    onClick={() => openEditModal(parent)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit department"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(parent.id, false)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    title="Delete department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Child Subcategories Section */}
              <div className="bg-[#0c0e16] p-3 border-t border-slate-800/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  <div className="flex items-center gap-1.5 text-rose-400/90">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Subcategories ({parent.children?.length || 0})</span>
                  </div>
                </div>

                {parent.children && parent.children.length > 0 ? (
                  <div className="space-y-1.5 pl-2">
                    {parent.children.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2.5 bg-[#141622] hover:bg-[#181a28] border border-slate-800/80 hover:border-slate-700 rounded-lg flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-slate-500 font-mono text-sm shrink-0 pl-1">↳</span>
                          <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                            {sub.imageUrl ? (
                              <img src={sub.imageUrl} alt={sub.name} className="w-full h-full object-cover" />
                            ) : (
                              <FolderTree className="w-3.5 h-3.5 text-purple-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs">{sub.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Subcategory
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              /{parent.slug}/{sub.slug}
                            </span>
                            {sub.description && (
                              <span className="text-[11px] text-slate-400 truncate max-w-xs hidden sm:inline">
                                • {sub.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleVisibility(sub)}
                            className={`p-1.5 rounded transition-all ${
                              sub.isVisible ? 'text-emerald-400 hover:bg-emerald-950/30' : 'text-slate-500 hover:bg-slate-800'
                            }`}
                            title={sub.isVisible ? 'Visible' : 'Hidden'}
                          >
                            {sub.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Edit subcategory"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, true)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                            title="Delete subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 pl-4 text-slate-500 text-xs italic flex items-center justify-between bg-[#12141d]/50 rounded-lg border border-dashed border-slate-800/80">
                    <span>No subcategories created under {parent.name} yet.</span>
                    <button
                      onClick={() => openCreateModal(parent.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      + Add first subcategory
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            editingCat
              ? editingCat.parentId
                ? `Edit Subcategory: ${editingCat.name}`
                : `Edit Department: ${editingCat.name}`
              : categoryType === 'subcategory'
              ? 'Create New Subcategory'
              : 'Create New Department'
          }
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Category Type Selector */}
            {!editingCat && (
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Category Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryType('department');
                      setParentId(null);
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs border text-center transition-all ${
                      categoryType === 'department'
                        ? 'bg-rose-600/20 border-rose-500 text-rose-400 shadow-sm'
                        : 'bg-[#10121A] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    📁 Primary Department
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryType('subcategory');
                      if (!parentId && rootDepartments.length > 0) {
                        setParentId(rootDepartments[0].id);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs border text-center transition-all ${
                      categoryType === 'subcategory'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-sm'
                        : 'bg-[#10121A] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ↳ Subcategory
                  </button>
                </div>
              </div>
            )}

            {/* Parent Department Selection (when subcategory) */}
            {categoryType === 'subcategory' && (
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Parent Department *
                </label>
                <select
                  required
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-medium"
                >
                  <option value="">-- Select Parent Department --</option>
                  {rootDepartments
                    .filter((d) => !editingCat || d.id !== editingCat.id)
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        📁 {dept.name} (/{dept.slug})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  This subcategory will appear directly nested inside the chosen department.
                </p>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {categoryType === 'subcategory' ? 'Subcategory Name *' : 'Department Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={categoryType === 'subcategory' ? 'e.g. t-shirts, dresses' : 'e.g. Womens, Mens, Clothes'}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Short summary for customer guidance and SEO..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Thumbnail / Banner Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... or select from media"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setIsMediaOpen(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shrink-0 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md cursor-pointer"
              >
                {editingCat ? 'Save Changes' : categoryType === 'subcategory' ? 'Create Subcategory' : 'Create Department'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Media Picker */}
      {isMediaOpen && (
        <MediaPickerModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={(url) => setImageUrl(url)}
          title="Select Category Thumbnail"
        />
      )}
    </div>
  );
}
