'use client';

import { showAlertModal } from '@/lib/modal-context';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FolderOpen,
  Link as LinkIcon,
  X,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import { MediaService } from '@/services/media';

export interface ImageUploadInputProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  folder?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto' | '3/4' | '4/5';
  className?: string;
}

export function ImageUploadInput({
  value = '',
  onChange,
  label,
  description,
  placeholder = 'https://... or upload image',
  folder = 'Uploads',
  aspectRatio = 'auto',
  className = '',
}: ImageUploadInputProps) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mode, setMode] = useState<'preview' | 'url'>(value ? 'preview' : 'preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showAlertModal({ title: 'Invalid Image Format', message: 'Please upload a valid image format (PNG, JPG, WEBP, SVG, GIF)', type: 'warning' });
      return;
    }

    setIsUploading(true);
    try {
      // 1. Read as Data URL / File upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        try {
          // Upload to MediaService in background
          const asset = await MediaService.upload({
            filename: file.name,
            url: dataUrl,
            mimeType: file.type,
            sizeBytes: file.size,
            folder: (folder as any) || 'Products',
            altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          });

          onChange(asset.url || dataUrl);
        } catch {
          // Fallback to dataUrl directly
          onChange(dataUrl);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload failed:', err);
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[120px]';
      case 'video':
        return 'aspect-video max-w-[200px]';
      case 'banner':
        return 'aspect-21/9 max-w-[260px]';
      case '3/4':
        return 'aspect-3/4 max-w-[120px]';
      case '4/5':
        return 'aspect-4/5 max-w-[120px]';
      default:
        return 'h-24 w-auto min-w-[96px] max-w-[160px]';
    }
  };

  const inputId = React.useId();

  return (
    <div className={`space-y-1.5 select-none ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {label}
          </label>
          {description && <span className="text-[10px] text-slate-500">{description}</span>}
        </div>
      )}

      {/* Main Image Upload Box */}
      {value ? (
        /* Image Preview Box with Replace / Remove Actions */
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`relative rounded-lg overflow-hidden bg-slate-950 border border-slate-700 shrink-0 ${getAspectClass()}`}>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0 space-y-1">
              <span className="text-xs font-mono text-white truncate block max-w-xs" title={value}>
                {value.length > 45 ? `${value.slice(0, 45)}...` : value}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                  Active Asset
                </span>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Full</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <label
              htmlFor={inputId}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Upload replacement image from device"
            >
              <Upload className="w-3.5 h-3.5 text-rose-400" />
              <span>Replace</span>
            </label>

            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Pick from Media Library"
            >
              <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
            </button>

            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload / Dropzone Box */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`p-4 rounded-xl border-2 border-dashed transition-all text-center space-y-2.5 ${
            isDragOver
              ? 'border-rose-500 bg-rose-950/20'
              : 'border-slate-800 bg-[#090D15] hover:border-slate-700'
          }`}
        >
          {isUploading ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs font-bold">Uploading Asset...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3">
                <label
                  htmlFor={inputId}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Media Library</span>
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500">
                <span>or drag &amp; drop an image here</span>
              </div>

              {/* Paste URL Input bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder={placeholder}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onChange((e.target as HTMLInputElement).value);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      onChange(e.target.value.trim());
                    }
                  }}
                  className="w-full bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-hidden font-mono"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif, image/avif"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="sr-only" 
      />

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(selectedUrl) => {
            onChange(selectedUrl);
            setIsMediaPickerOpen(false);
          }}
          title={`Select Asset for ${label || 'Storefront'}`}
        />
      )}
    </div>
  );
}
