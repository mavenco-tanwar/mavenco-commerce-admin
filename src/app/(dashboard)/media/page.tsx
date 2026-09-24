import { useConfirm } from '@/lib/modal-context';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  Folder,
  Search,
  Plus,
  Smartphone,
  Link as LinkIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { MediaService, optimizeImageFile } from '@/services/media';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { MediaAsset } from '@/types';

const FOLDERS = ['All', 'Homepage', 'Products', 'Women', 'Kids', 'Banners', 'Campaigns'];

export default function MediaLibraryPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Upload state
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [dragOver, setDragOver] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [optimizedData, setOptimizedData] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    sizeBytes: number;
  } | null>(null);

  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState<any>('Products');

  const fetchAssets = async () => {
    const list = await MediaService.getAll();
    setAssets(list);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const resetUploadState = () => {
    setIsUploadOpen(false);
    setUploadMode('device');
    setFilePreview(null);
    setSelectedFile(null);
    setOptimizedData(null);
    setUploadUrl('');
    setUploadFilename('');
    setUploadAlt('');
    setUploadFolder('Products');
    setIsProcessing(false);
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Copied image link to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF)', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedFile(file);
      setUploadFilename(file.name);
      setUploadAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

      const optimized = await optimizeImageFile(file);
      setOptimizedData(optimized);
      setFilePreview(optimized.dataUrl);
    } catch (err) {
      console.error('Image optimization failed:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = e.target?.result as string;
        setFilePreview(rawUrl);
        setOptimizedData({
          dataUrl: rawUrl,
          width: 1200,
          height: 1200,
          sizeBytes: file.size,
        });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = uploadUrl;
    let finalSize = 250000;
    let finalMime = 'image/jpeg';
    let width = 1200;
    let height = 1200;

    if (uploadMode === 'device') {
      if (!optimizedData && !filePreview) return;
      finalUrl = optimizedData?.dataUrl || filePreview!;
      finalSize = optimizedData?.sizeBytes || selectedFile?.size || 250000;
      finalMime = selectedFile?.type || 'image/jpeg';
      width = optimizedData?.width || 1200;
      height = optimizedData?.height || 1200;
    } else {
      if (!uploadUrl) return;
    }

    setIsProcessing(true);
    try {
      await MediaService.upload({
        filename: uploadFilename || (selectedFile?.name || `upload-${Date.now()}.jpg`),
        url: finalUrl,
        altText: uploadAlt,
        folder: uploadFolder,
        mimeType: finalMime,
        sizeBytes: finalSize,
        width,
        height,
      });

      showToast('Image successfully added to media library', 'success');
      resetUploadState();
      fetchAssets();
    } catch (err: any) {
      showToast('Upload error: ' + (err.message || 'Unknown'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete Media Asset',
      message: 'Are you sure you want to delete this media asset? Any pages or products referencing this image may show a missing image.',
      confirmLabel: 'Delete Media',
      isDestructive: true,
      type: 'danger',
    });
    if (!ok) return;
    await MediaService.delete(id);
    showToast('Media asset removed', 'info');
    fetchAssets();
  };

  const filtered = assets.filter((a) => {
    if (selectedFolder !== 'All' && a.folder !== selectedFolder) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.filename.toLowerCase().includes(q) || (a.altText && a.altText.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 select-none max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Digital Asset Management
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Media Asset Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload from computer or phone, or link external CDN images with automatic folder categorization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Folders Bar & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#161822] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {FOLDERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedFolder === f
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search filename or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#161822] border border-dashed border-slate-800 rounded-2xl p-8">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-sm">No media assets found</p>
          <p className="text-slate-500 text-xs mt-1 mb-4">
            {search ? 'Try adjusting your search query' : 'Upload photos from your computer or phone'}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group bg-[#161822] border border-slate-800/90 hover:border-rose-500/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-square w-full bg-black/40 overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.altText || asset.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Hover overlay with action buttons */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg shadow text-xs flex items-center gap-1 cursor-pointer"
                    title="Copy Image URL"
                  >
                    {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg shadow text-xs cursor-pointer"
                    title="Delete Media Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  {asset.folder}
                </div>
              </div>

              {/* Metadata */}
              <div className="p-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <h4 className="text-white font-medium truncate text-xs" title={asset.filename}>
                    {asset.filename}
                  </h4>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5">
                    {asset.altText || 'No description'}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{((asset.sizeBytes || 250000) / 1024).toFixed(0)} KB</span>
                  <span>{new Date(asset.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <Modal
          isOpen={isUploadOpen}
          onClose={resetUploadState}
          title="Upload Media Asset"
          maxWidth="lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            {/* Mode Switch: Device (PC/Phone) vs URL */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('device')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    uploadMode === 'device'
                      ? 'bg-slate-800 text-rose-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>From Computer / Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    uploadMode === 'url'
                      ? 'bg-slate-800 text-rose-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Web CDN URL</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Folder:{' '}
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 ml-1 text-xs"
                >
                  {FOLDERS.filter((f) => f !== 'All').map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode A: Device File Upload */}
            {uploadMode === 'device' && (
              <div>
                {!filePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 block select-none overflow-hidden ${
                      dragOver
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-700 bg-[#10121A] hover:border-rose-500 hover:bg-slate-900'
                    }`}
                  >
                    {/* Native Invisible Full-Cover File Input: Zero redirection, Native OS Dialog on Click/Drop */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      disabled={isProcessing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      title="Click to browse from Computer / Phone or drag & drop"
                    />

                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-rose-400 shadow-md pointer-events-none">
                      {isProcessing ? <Sparkles className="w-6 h-6 animate-spin text-rose-400" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div className="pointer-events-none">
                      <p className="font-bold text-white text-xs">
                        {isProcessing ? 'Optimizing Image...' : 'Click to browse from Computer / Phone or drag & drop'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        High resolution JPG, PNG, WEBP, SVG or GIF (auto-optimized)
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md text-xs inline-flex items-center gap-1.5 transition-all mt-1 pointer-events-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Device Files</span>
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate">
                        {selectedFile?.name || 'Uploaded Image'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {optimizedData ? `${(optimizedData.sizeBytes / 1024).toFixed(1)} KB (Optimized)` : (selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready to upload')}
                      </p>
                      <div className="relative inline-block mt-0.5">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          disabled={isProcessing}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <span className="text-[11px] text-rose-400 hover:underline font-semibold cursor-pointer select-none">
                          Change Image
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFilePreview(null);
                        setSelectedFile(null);
                        setOptimizedData(null);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: URL Input */}
            {uploadMode === 'url' && (
              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL (Direct CDN Link) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={uploadUrl}
                  onChange={(e) => {
                    setUploadUrl(e.target.value);
                    if (!uploadFilename && e.target.value) {
                      setUploadFilename(`cdn-asset-${Date.now()}.jpg`);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">Filename</label>
              <input
                type="text"
                placeholder="e.g. spring-lookbook-01.jpg"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Alt Text (Accessibility & SEO)</label>
              <input
                type="text"
                placeholder="Descriptive image caption..."
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={resetUploadState}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || (uploadMode === 'device' ? !filePreview : !uploadUrl)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md disabled:opacity-40 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {isProcessing && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
                <span>Add to Library</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
