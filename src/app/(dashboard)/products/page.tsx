import { useConfirm } from '@/lib/modal-context';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  ExternalLink,
  Layers,
  UploadCloud,
  FileSpreadsheet,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { ProductService } from '@/services/products';
import { PlatformService, TenantPlan } from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '@/types';

export default function ProductsListPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<TenantPlan | null>(null);

  // Bulk CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const currentTenant = PlatformService.getActiveTenant();
      const [list, plans] = await Promise.all([
        ProductService.getAll(currentTenant.slug),
        Promise.resolve(PlatformService.listPlans()),
      ]);
      const plan = plans.find((p) => p.id === currentTenant.planId) || plans[0];
      setProducts(list);
      setActivePlan(plan);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleTenantUpdated = () => fetchProducts();
    window.addEventListener('tenant_updated', handleTenantUpdated);
    return () => window.removeEventListener('tenant_updated', handleTenantUpdated);
  }, []);

  const handleDuplicate = async (p: Product) => {
    const { id, _id, ...rest } = p as any;
    const duplicated: Partial<Product> = {
      ...rest,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${p.title} (Copy)`,
      slug: `${p.slug}-copy-${Date.now()}`,
      sku: `${p.sku}-CPY-${Date.now().toString().slice(-4)}`,
      status: 'draft',
    };
    const created = await ProductService.create(duplicated);
    setProducts([created, ...products]);
    showToast(`Duplicated ${p.title} as draft`, 'success');
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmLabel: 'Delete Product',
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    await ProductService.delete(id);
    setProducts(products.filter((p) => p.id !== id));
    showToast('Product deleted', 'info');
  };

  const handleBulkDelete = async (ids: string[]) => {
    const ok = await confirm({
      title: 'Delete Selected Products',
      message: `Are you sure you want to permanently delete ${ids.length} selected products?`,
      confirmLabel: `Delete ${ids.length} Products`,
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    await ProductService.bulkDelete(ids);
    setProducts(products.filter((p) => !ids.includes(p.id)));
    showToast(`Deleted ${ids.length} products`, 'info');
  };

  const handleBulkPublish = async (ids: string[]) => {
    await ProductService.bulkUpdateStatus(ids, 'published');
    setProducts(
      products.map((p) => (ids.includes(p.id) ? { ...p, status: 'published' } : p))
    );
    showToast(`Published ${ids.length} products`, 'success');
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (products.length === 0) {
      showToast('No products to export', 'info');
      return;
    }
    const headers = ['Title', 'Slug', 'SKU', 'Price', 'CompareAtPrice', 'Stock', 'Status', 'Category', 'ImageURL'];
    const rows = products.map((p) => [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.slug || ''}"`,
      `"${p.sku || ''}"`,
      p.price || 0,
      p.compareAtPrice || 0,
      p.stock || 0,
      p.status || 'draft',
      `"${(p as any).category || p.categoryIds?.[0] || 'Apparel'}"`,
      `"${p.images?.[0]?.url || ''}"`,
    ]);
    const csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalog_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Catalog exported as CSV successfully!', 'success');
  };

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const template = `Title,SKU,Price,CompareAtPrice,Stock,Category,ImageURL,ShortDescription
"Banarasi Katan Silk Saree - Ruby Red","BKS-RED-01",2499,3999,25,"cat_women","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800","Pure zari handwoven silk saree"
"Artisanal Travertine Table Lamp","LUM-LAMP-02",4499,5999,15,"cat_decor","https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800","Natural fluted stone ambient lighting"
"Carbon Plate Marathon Speed Runner","APX-RUN-03",3299,4999,40,"cat_athletics","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800","Ultralight carbon composite marathon footwear"`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mavenco_product_import_template.csv';
    link.click();
  };

  // Execute Bulk CSV Import
  const handleExecuteImport = async () => {
    if (!csvContent.trim()) {
      showToast('Please paste CSV content or upload a file', 'error');
      return;
    }
    setIsImporting(true);
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length <= 1) {
        showToast('CSV must contain at least 1 product row', 'error');
        setIsImporting(false);
        return;
      }
      let addedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        const [title, sku, price, compareAtPrice, stock, category, imageUrl, shortDesc] = cols;
        if (!title) continue;

        const newProd: Partial<Product> = {
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
          price: Number(price) || 999,
          compareAtPrice: Number(compareAtPrice) || Number(price) || 1299,
          stock: Number(stock) || 20,
          categoryIds: [category || 'cat_women'],
          status: 'published',
          shortDescription: shortDesc || 'Curated luxury lifestyle essential.',
          images: imageUrl ? [{ id: `img_${Date.now()}`, url: imageUrl, isPrimary: true }] : [],
        };
        await ProductService.create(newProd);
        addedCount++;
      }
      setImportedCount(addedCount);
      showToast(`Successfully imported ${addedCount} products!`, 'success');
      await fetchProducts();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvContent('');
        setImportedCount(null);
      }, 1500);
    } catch {
      showToast('Failed to import CSV. Please check formatting.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'title',
      header: 'Product Details',
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
            <img
              src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&auto=format&fit=crop'}
              alt={p.title || 'Product'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">{p.title}</div>
            <div className="text-[11px] font-mono text-slate-400">SKU: {p.sku || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-bold text-white text-xs font-mono">₹{p.price?.toLocaleString('en-IN')}</span>
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <span className="block text-[10px] text-slate-500 line-through font-mono">
              ₹{p.compareAtPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Inventory',
      sortable: true,
      render: (p) => {
        const isLow = (p.stock || 0) <= (p.lowStockThreshold || 10);
        return (
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              isLow
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            }`}
          >
            {p.stock ?? 0} in stock
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
            p.status === 'published'
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/products/${p.id}`}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit Product"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleDuplicate(p)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Duplicate Product"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Catalog Management
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage multi-variant garments, size matrices, pricing, stock allocations, and bulk CSV uploads.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activePlan && (
            <div className="px-3 py-1.5 bg-[#10121A] border border-slate-800 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-slate-400">Quota:</span>
              <span className="font-bold text-white font-mono">
                {products.length} / {activePlan.maxProducts}
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/20">
                {activePlan.name}
              </span>
            </div>
          )}

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#121522] hover:bg-[#1A1D2B] text-slate-300 hover:text-white font-bold text-xs rounded-lg border border-slate-700 transition-all"
            title="Export full catalog to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {/* Import CSV Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-xs rounded-lg border border-purple-500/40 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </button>

          {/* Add Product Button */}
          <Link
            href="/products/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </Link>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        isLoading={isLoading}
        data={products}
        columns={columns}
        searchPlaceholder="Search by title, SKU, tags..."
        searchKey={(p) => `${p.title || ''} ${p.sku || ''} ${p.tags?.join(' ') || ''}`}
        filterOptions={[
          { label: 'Published', value: 'published', filterFn: (p) => p.status === 'published' },
          { label: 'Draft', value: 'draft', filterFn: (p) => p.status === 'draft' },
          { label: 'Low Stock', value: 'low_stock', filterFn: (p) => (p.stock || 0) <= (p.lowStockThreshold || 10) },
        ]}
        bulkActions={[
          { label: 'Publish Selected', action: handleBulkPublish },
          { label: 'Delete Selected', action: handleBulkDelete, isDestructive: true },
        ]}
      />

      {/* BULK CSV IMPORT MODAL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Product CSV Importer"
        subtitle="Upload or paste product rows to batch-create multi-variant catalog items in seconds."
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#10121A] border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300">Need the correct column structure?</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="text-purple-400 hover:text-purple-300 font-bold underline flex items-center gap-1 text-[11px]"
            >
              <Download className="w-3 h-3" />
              <span>Download Sample Template</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Paste CSV Raw Data (or type rows):</label>
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`Title,SKU,Price,CompareAtPrice,Stock,Category,ImageURL,ShortDescription\n"Chanderi Silk Kurti - Mustard","CSK-01",1899,2499,30,"cat_women","https://...","Luxury festive ethnic wear"`}
              className="w-full p-3 bg-[#0A0C10] border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {importedCount !== null && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Imported {importedCount} products successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isImporting || !csvContent.trim()}
              onClick={handleExecuteImport}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>{isImporting ? 'Importing Products...' : 'Execute CSV Import'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
