/**
 * Module 38: Builder State Context Engine
 * Manages documentTree, history (Undo/Redo), selection, clipboard, and devices.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BuilderNode,
  DeviceType,
  PageDocument,
  NodeStyle,
  BuilderTemplate,
} from '@/lib/page-builder/types';
import {
  createDefaultNode,
  createDefaultRootNode,
  findNodeById,
  findParentNode,
  insertNode,
  deleteNode,
  updateNode,
  moveNode,
  duplicateNode,
  cloneTreeWithNewIds,
} from '@/lib/page-builder/tree-utils';

interface BuilderContextValue {
  page: PageDocument;
  rootNode: BuilderNode;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  selectedNode: BuilderNode | null;
  activeDevice: DeviceType;
  activeLeftTab: 'elements' | 'navigator' | 'templates' | 'globals';
  activeInspectorTab: 'content' | 'style' | 'advanced';
  previewMode: boolean;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  hasClipboard: boolean;
  hasStyleClipboard: boolean;

  // Actions
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  setActiveDevice: (device: DeviceType) => void;
  setActiveLeftTab: (tab: 'elements' | 'navigator' | 'templates' | 'globals') => void;
  setActiveInspectorTab: (tab: 'content' | 'style' | 'advanced') => void;
  setPreviewMode: (val: boolean) => void;
  setZoom: (val: number) => void;

  insertWidget: (targetParentId: string, widgetType: string, index?: number) => void;
  deleteWidget: (id: string) => void;
  updateWidgetContent: (id: string, contentUpdates: Record<string, any>) => void;
  updateWidgetStyle: (id: string, styleUpdates: Partial<NodeStyle>) => void;
  updateWidgetResponsive: (id: string, responsiveUpdates: Record<string, any>) => void;
  updatePageMetadata: (updates: Partial<PageDocument>) => void;
  moveWidget: (id: string, direction: 'up' | 'down') => void;
  duplicateWidget: (id: string) => void;
  copyWidget: (id: string) => void;
  pasteWidget: (targetParentId?: string) => void;
  copyStyle: (id: string) => void;
  pasteStyle: (id: string) => void;
  insertTemplate: (template: BuilderTemplate) => void;

  undo: () => void;
  redo: () => void;
  saveDraft: () => Promise<void>;
  publishLive: () => Promise<void>;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return ctx;
}

interface BuilderProviderProps {
  initialPage?: PageDocument;
  initialDocument?: PageDocument;
  onSaveDraft?: (page: PageDocument) => Promise<void>;
  onPublishLive?: (page: PageDocument) => Promise<void>;
  onPublish?: (page: PageDocument) => Promise<void>;
  children: React.ReactNode;
}

export function BuilderProvider({
  initialPage,
  initialDocument,
  onSaveDraft,
  onPublishLive,
  onPublish,
  children,
}: BuilderProviderProps) {
  const resolvedPage: PageDocument = initialPage || initialDocument || {
    id: 'page_new',
    tenantId: 'default',
    storeId: 'store_primary',
    name: 'New Storefront Page',
    slug: 'new-page',
    type: 'standard',
    status: 'draft',
    version: 1,
    schemaVersion: '1.0',
    content: { root: createDefaultRootNode() },
  };

  const publishHandler = onPublishLive || onPublish;

  const [page, setPage] = useState<PageDocument>(resolvedPage);
  const [rootNode, setRootNode] = useState<BuilderNode>(
    resolvedPage?.content?.root || createDefaultRootNode()
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [activeLeftTab, setActiveLeftTab] = useState<'elements' | 'navigator' | 'templates' | 'globals'>('elements');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

  // History Stacks
  const [history, setHistory] = useState<BuilderNode[]>([]);
  const [future, setFuture] = useState<BuilderNode[]>([]);
  const [clipboard, setClipboard] = useState<BuilderNode | null>(null);
  const [styleClipboard, setStyleClipboard] = useState<NodeStyle | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const pushHistory = useCallback(
    (currentTree: BuilderNode) => {
      setHistory((prev) => [...prev.slice(-49), JSON.parse(JSON.stringify(currentTree))]);
      setFuture([]);
      setIsDirty(true);
    },
    []
  );

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const hoverNode = useCallback((id: string | null) => {
    setHoveredNodeId(id);
  }, []);

  const selectedNode = selectedNodeId ? findNodeById(rootNode, selectedNodeId) : null;

  // Insert Widget
  const insertWidget = useCallback(
    (targetParentId: string, widgetType: string, index?: number) => {
      const newNode = createDefaultNode(widgetType, targetParentId);
      pushHistory(rootNode);
      const updated = insertNode(rootNode, targetParentId, newNode, index);
      setRootNode(updated);
      setSelectedNodeId(newNode.id);
    },
    [rootNode, pushHistory]
  );

  // Delete Widget
  const deleteWidget = useCallback(
    (id: string) => {
      if (id === 'root') return;
      pushHistory(rootNode);
      const updated = deleteNode(rootNode, id);
      setRootNode(updated);
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
    },
    [rootNode, selectedNodeId, pushHistory]
  );

  // Update Content
  const updateWidgetContent = useCallback(
    (id: string, contentUpdates: Record<string, any>) => {
      const target = findNodeById(rootNode, id);
      if (!target) return;
      pushHistory(rootNode);
      const updated = updateNode(rootNode, id, {
        content: { ...target.content, ...contentUpdates },
      });
      setRootNode(updated);
    },
    [rootNode, pushHistory]
  );

  // Update Style
  const updateWidgetStyle = useCallback(
    (id: string, styleUpdates: Partial<NodeStyle>) => {
      const target = findNodeById(rootNode, id);
      if (!target) return;
      pushHistory(rootNode);
      const updated = updateNode(rootNode, id, {
        style: { ...target.style, ...styleUpdates },
      });
      setRootNode(updated);
    },
    [rootNode, pushHistory]
  );

  // Update Responsive
  const updateWidgetResponsive = useCallback(
    (id: string, responsiveUpdates: Record<string, any>) => {
      const target = findNodeById(rootNode, id);
      if (!target) return;
      pushHistory(rootNode);
      const updated = updateNode(rootNode, id, {
        responsive: { ...target.responsive, ...responsiveUpdates },
      });
      setRootNode(updated);
    },
    [rootNode, pushHistory]
  );

  // Update Page Metadata
  const updatePageMetadata = useCallback((updates: Partial<PageDocument>) => {
    setPage((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Move Widget Up / Down
  const moveWidget = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const parent = findParentNode(rootNode, id);
      if (!parent || !Array.isArray(parent.children)) return;
      const curIdx = parent.children.findIndex((c) => c.id === id);
      if (curIdx === -1) return;

      const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
      if (targetIdx < 0 || targetIdx >= parent.children.length) return;

      pushHistory(rootNode);
      const updated = moveNode(rootNode, id, parent.id, targetIdx);
      setRootNode(updated);
    },
    [rootNode, pushHistory]
  );

  // Duplicate Widget
  const duplicateWidget = useCallback(
    (id: string) => {
      pushHistory(rootNode);
      const res = duplicateNode(rootNode, id);
      setRootNode(res.newTree);
      if (res.duplicatedNodeId) {
        setSelectedNodeId(res.duplicatedNodeId);
      }
    },
    [rootNode, pushHistory]
  );

  // Copy / Paste Widget
  const copyWidget = useCallback(
    (id: string) => {
      const node = findNodeById(rootNode, id);
      if (node && node.type !== 'root') {
        setClipboard(JSON.parse(JSON.stringify(node)));
      }
    },
    [rootNode]
  );

  const pasteWidget = useCallback(
    (targetParentId?: string) => {
      if (!clipboard) return;
      const targetId = targetParentId || selectedNodeId || 'root';
      const cloned = cloneTreeWithNewIds(clipboard, targetId);
      pushHistory(rootNode);
      const updated = insertNode(rootNode, targetId, cloned);
      setRootNode(updated);
      setSelectedNodeId(cloned.id);
    },
    [clipboard, selectedNodeId, rootNode, pushHistory]
  );

  // Copy / Paste Style
  const copyStyle = useCallback(
    (id: string) => {
      const node = findNodeById(rootNode, id);
      if (node?.style) {
        setStyleClipboard(JSON.parse(JSON.stringify(node.style)));
      }
    },
    [rootNode]
  );

  const pasteStyle = useCallback(
    (id: string) => {
      if (!styleClipboard) return;
      pushHistory(rootNode);
      const updated = updateNode(rootNode, id, {
        style: JSON.parse(JSON.stringify(styleClipboard)),
      });
      setRootNode(updated);
    },
    [styleClipboard, rootNode, pushHistory]
  );

  // Insert Template
  const insertTemplate = useCallback(
    (tmpl: BuilderTemplate) => {
      if (!tmpl?.content) return;
      pushHistory(rootNode);
      const cloned = cloneTreeWithNewIds(tmpl.content, 'root');
      const updated = insertNode(rootNode, 'root', cloned);
      setRootNode(updated);
      setSelectedNodeId(cloned.id);
    },
    [rootNode, pushHistory]
  );

  // Undo / Redo
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [JSON.parse(JSON.stringify(rootNode)), ...prev]);
    setRootNode(previous);
    setIsDirty(true);
  }, [history, rootNode]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(rootNode))]);
    setRootNode(next);
    setIsDirty(true);
  }, [future, rootNode]);

  // Save Draft
  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      const updatedPage: PageDocument = {
        ...page,
        content: { root: rootNode },
        updatedAt: new Date().toISOString(),
      };
      setPage(updatedPage);
      if (onSaveDraft) {
        await onSaveDraft(updatedPage);
      }
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [page, rootNode, onSaveDraft]);

  // Publish Live
  const publishLive = useCallback(async () => {
    setIsPublishing(true);
    try {
      const nextVersion = (page.version || 1) + 1;
      const pubPage: PageDocument = {
        ...page,
        status: 'published',
        version: nextVersion,
        content: { root: rootNode },
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPage(pubPage);
      if (publishHandler) {
        await publishHandler(pubPage);
      }
      setIsDirty(false);
    } finally {
      setIsPublishing(false);
    }
  }, [page, rootNode, publishHandler]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input / textarea typing
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.getAttribute('contenteditable') === 'true';

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        if (!isInput) {
          e.preventDefault();
          undo();
        }
      } else if (mod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      } else if (mod && e.key === 's') {
        e.preventDefault();
        saveDraft();
      } else if (mod && e.key === 'c' && !isInput && selectedNodeId) {
        e.preventDefault();
        copyWidget(selectedNodeId);
      } else if (mod && e.key === 'v' && !isInput) {
        e.preventDefault();
        pasteWidget();
      } else if (mod && e.key === 'd' && !isInput && selectedNodeId) {
        e.preventDefault();
        duplicateWidget(selectedNodeId);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && selectedNodeId && selectedNodeId !== 'root') {
        e.preventDefault();
        deleteWidget(selectedNodeId);
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveDraft, copyWidget, pasteWidget, duplicateWidget, deleteWidget, selectedNodeId]);

  return (
    <BuilderContext.Provider
      value={{
        page,
        rootNode,
        selectedNodeId,
        hoveredNodeId,
        selectedNode,
        activeDevice,
        activeLeftTab,
        activeInspectorTab,
        previewMode,
        zoom,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
        isDirty,
        isSaving,
        isPublishing,
        hasClipboard: clipboard !== null,
        hasStyleClipboard: styleClipboard !== null,

        selectNode,
        hoverNode,
        setActiveDevice,
        setActiveLeftTab,
        setActiveInspectorTab,
        setPreviewMode,
        setZoom,

        insertWidget,
        deleteWidget,
        updateWidgetContent,
        updateWidgetStyle,
        updateWidgetResponsive,
        updatePageMetadata,
        moveWidget,
        duplicateWidget,
        copyWidget,
        pasteWidget,
        copyStyle,
        pasteStyle,
        insertTemplate,

        undo,
        redo,
        saveDraft,
        publishLive,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}
