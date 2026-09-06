/**
 * Module 38: Builder Node Tree Utilities
 * Pure, deterministic tree operations with zero side effects.
 */

import { BuilderNode } from './types';

export function generateUniqueId(prefix: string = 'node'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function createDefaultRootNode(): BuilderNode {
  return {
    id: 'root',
    type: 'root',
    parentId: null,
    children: [],
    content: {},
    style: {
      spacing: {
        padding: {
          desktop: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        },
      },
    },
    responsive: {
      visibility: { desktop: true, tablet: true, mobile: true },
    },
    metadata: { name: 'Root Canvas' },
  };
}

export function createDefaultNode(type: string, parentId: string | null = null): BuilderNode {
  const id = generateUniqueId(type);
  const baseNode: BuilderNode = {
    id,
    type,
    parentId,
    children: [],
    content: {},
    style: {},
    responsive: {
      visibility: { desktop: true, tablet: true, mobile: true },
    },
  };

  switch (type) {
    case 'container':
    case 'section':
      baseNode.content = {
        direction: 'column',
        wrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        boxed: false,
      };
      baseNode.style = {
        size: {
          width: { desktop: '100%' },
        },
        spacing: {
          padding: { desktop: { top: '40px', right: '24px', bottom: '40px', left: '24px' } },
        },
      };
      break;

    case 'column':
      baseNode.content = {
        widthFraction: 1, // e.g. 1/2 or 1
      };
      baseNode.style = {
        size: {
          width: { desktop: '100%', tablet: '100%', mobile: '100%' },
        },
        spacing: {
          padding: { desktop: { top: '16px', right: '16px', bottom: '16px', left: '16px' } },
        },
      };
      break;

    case 'heading':
      baseNode.content = {
        text: 'Artisanal Elegance',
        tag: 'h2',
        link: '',
      };
      baseNode.style = {
        typography: {
          fontSize: { desktop: '36px', tablet: '28px', mobile: '24px' },
          fontWeight: '700',
          color: '#111111',
          textAlign: { desktop: 'left' },
        },
        spacing: {
          margin: { desktop: { top: '0px', right: '0px', bottom: '16px', left: '0px' } },
        },
      };
      break;

    case 'text':
      baseNode.content = {
        text: 'Discover handcrafted silhouettes engineered for modern living and understated luxury.',
      };
      baseNode.style = {
        typography: {
          fontSize: { desktop: '15px', tablet: '14px', mobile: '14px' },
          lineHeight: { desktop: '1.6' },
          color: '#555555',
          textAlign: { desktop: 'left' },
        },
        spacing: {
          margin: { desktop: { top: '0px', right: '0px', bottom: '16px', left: '0px' } },
        },
      };
      break;

    case 'button':
      baseNode.content = {
        text: 'Explore Collection',
        link: '/collections',
        variant: 'solid',
        target: '_self',
      };
      baseNode.style = {
        typography: {
          fontSize: { desktop: '12px' },
          fontWeight: '700',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
        },
        background: {
          type: 'color',
          color: '#111111',
        },
        spacing: {
          padding: { desktop: { top: '14px', right: '28px', bottom: '14px', left: '28px' } },
        },
      };
      break;

    case 'image':
      baseNode.content = {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
        alt: 'Curated Fashion Lookbook',
        aspectRatio: '3/4',
        objectFit: 'cover',
      };
      baseNode.style = {
        size: {
          width: { desktop: '100%' },
        },
      };
      break;

    case 'product_grid':
      baseNode.content = {
        heading: 'Featured Collection',
        querySource: 'best_sellers',
        limit: 8,
        columns: { desktop: 4, tablet: 2, mobile: 1 },
      };
      baseNode.style = {
        spacing: {
          padding: { desktop: { top: '40px', right: '0px', bottom: '40px', left: '0px' } },
        },
      };
      break;

    case 'divider':
      baseNode.content = {
        style: 'solid',
      };
      baseNode.style = {
        border: {
          style: 'solid',
          width: { top: '1px' },
          color: '#E8DED8',
        },
        spacing: {
          margin: { desktop: { top: '24px', right: '0px', bottom: '24px', left: '0px' } },
        },
      };
      break;

    case 'spacer':
      baseNode.style = {
        size: {
          height: { desktop: '48px', tablet: '36px', mobile: '24px' },
        },
      };
      break;
  }

  return baseNode;
}

export function findNodeById(root: BuilderNode, id: string): BuilderNode | null {
  if (root.id === id) return root;
  for (const child of root.children || []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

export function findParentNode(root: BuilderNode, id: string): BuilderNode | null {
  for (const child of root.children || []) {
    if (child.id === id) return root;
    const parent = findParentNode(child, id);
    if (parent) return parent;
  }
  return null;
}

export function cloneTreeWithNewIds(node: BuilderNode, parentId: string | null = null): BuilderNode {
  const newId = generateUniqueId(node.type);
  const cloned: BuilderNode = {
    ...JSON.parse(JSON.stringify(node)),
    id: newId,
    parentId: parentId,
    children: [],
  };

  if (Array.isArray(node.children)) {
    cloned.children = node.children.map((child) => cloneTreeWithNewIds(child, newId));
  }

  return cloned;
}

export function insertNode(
  root: BuilderNode,
  targetParentId: string,
  nodeToInsert: BuilderNode,
  index?: number
): BuilderNode {
  const newRoot: BuilderNode = JSON.parse(JSON.stringify(root));
  const parent = findNodeById(newRoot, targetParentId);
  if (!parent) return newRoot;

  nodeToInsert.parentId = targetParentId;
  if (!Array.isArray(parent.children)) {
    parent.children = [];
  }

  if (typeof index === 'number' && index >= 0 && index <= parent.children.length) {
    parent.children.splice(index, 0, nodeToInsert);
  } else {
    parent.children.push(nodeToInsert);
  }

  return newRoot;
}

export function deleteNode(root: BuilderNode, idToDelete: string): BuilderNode {
  if (root.id === idToDelete) return root; // Cannot delete root
  const newRoot: BuilderNode = JSON.parse(JSON.stringify(root));
  const parent = findParentNode(newRoot, idToDelete);
  if (parent && Array.isArray(parent.children)) {
    parent.children = parent.children.filter((c) => c.id !== idToDelete);
  }
  return newRoot;
}

export function moveNode(
  root: BuilderNode,
  nodeId: string,
  targetParentId: string,
  targetIndex: number
): BuilderNode {
  const newRoot: BuilderNode = JSON.parse(JSON.stringify(root));
  const targetParent = findNodeById(newRoot, targetParentId);
  const node = findNodeById(newRoot, nodeId);
  if (!targetParent || !node || node.id === targetParent.id) return newRoot;

  // Prevent moving into own descendant
  let check: BuilderNode | null = targetParent;
  while (check) {
    if (check.id === nodeId) return newRoot;
    check = findParentNode(newRoot, check.id);
  }

  // Remove from old parent
  const oldParent = findParentNode(newRoot, nodeId);
  if (oldParent && Array.isArray(oldParent.children)) {
    oldParent.children = oldParent.children.filter((c) => c.id !== nodeId);
  }

  // Insert into new parent
  node.parentId = targetParentId;
  if (!Array.isArray(targetParent.children)) {
    targetParent.children = [];
  }
  targetParent.children.splice(targetIndex, 0, node);

  return newRoot;
}

export function updateNode(
  root: BuilderNode,
  nodeId: string,
  updates: Partial<BuilderNode>
): BuilderNode {
  const newRoot: BuilderNode = JSON.parse(JSON.stringify(root));
  const target = findNodeById(newRoot, nodeId);
  if (!target) return newRoot;

  Object.assign(target, updates);
  return newRoot;
}

export function duplicateNode(
  root: BuilderNode,
  nodeId: string
): { newTree: BuilderNode; duplicatedNodeId: string | null } {
  const newRoot: BuilderNode = JSON.parse(JSON.stringify(root));
  const target = findNodeById(newRoot, nodeId);
  const parent = findParentNode(newRoot, nodeId);
  if (!target || !parent) return { newTree: newRoot, duplicatedNodeId: null };

  const cloned = cloneTreeWithNewIds(target, parent.id);
  cloned.metadata = {
    ...cloned.metadata,
    name: `${target.metadata?.name || target.type} (Copy)`,
  };

  const idx = parent.children.findIndex((c) => c.id === nodeId);
  parent.children.splice(idx + 1, 0, cloned);

  return { newTree: newRoot, duplicatedNodeId: cloned.id };
}

export function validateTree(root: BuilderNode): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  function traverse(node: BuilderNode, parentId: string | null) {
    if (!node.id) {
      errors.push('Found node without ID');
    } else if (seenIds.has(node.id)) {
      errors.push(`Duplicate node ID detected: ${node.id}`);
    } else {
      seenIds.add(node.id);
    }

    if (node.parentId !== parentId) {
      errors.push(`Mismatched parentId on node ${node.id}. Expected ${parentId}, got ${node.parentId}`);
    }

    for (const child of node.children || []) {
      traverse(child, node.id);
    }
  }

  traverse(root, null);
  return { isValid: errors.length === 0, errors };
}
