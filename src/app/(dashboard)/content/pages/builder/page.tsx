'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, ArrowLeft, RefreshCw, Layout, Layers } from 'lucide-react';
import { getStorefrontBaseUrl } from '@/services/api';

export default function VisualPageBuilderLauncherPage() {
  const [storefrontUrl, setStorefrontUrl] = useState('');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const base = getStorefrontBaseUrl();
    setStorefrontUrl(`${base}/admin/pages`);
  }, []);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col -m-6 -mt-4 bg-[#0B0D11] text-zinc-100">
      {/* Top Banner Bar */}
      <div className="h-12 border-b border-zinc-800/80 bg-[#101318] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/content/pages"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Custom Pages Studio</span>
          </Link>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold text-white">Elementor-Style Visual Page Builder Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {storefrontUrl && (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold rounded-lg shadow-md transition"
            >
              <span>Open Fullscreen Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Embedded Visual Page Builder */}
      <div className="flex-1 relative w-full h-full bg-[#0B0D11]">
        {storefrontUrl ? (
          <iframe
            src={storefrontUrl}
            className="w-full h-full border-none"
            title="Visual Page Builder"
            onLoad={() => setIframeLoaded(true)}
            allow="clipboard-read; clipboard-write"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 gap-2 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
            <span>Connecting to Storefront Visual Builder...</span>
          </div>
        )}
      </div>
    </div>
  );
}
