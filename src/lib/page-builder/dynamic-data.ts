/**
 * Module 38: Safe Dynamic Data Source Resolver
 * Zero arbitrary code execution. Zero eval(). Structured evaluation only.
 */

import { DynamicDataSource } from './types';

export function resolveDynamicData(
  ds: DynamicDataSource,
  contextData: Record<string, any> = {}
): string | undefined {
  const sourceType = ds?.sourceType || (ds as any)?.source;
  if (!ds || !sourceType || !ds.field) return ds?.fallback;

  const targetObject = contextData[sourceType] || {};
  let value = targetObject[ds.field];

  if (value === undefined || value === null) {
    return ds.fallback;
  }

  // Format value if requested
  if (ds.format === 'currency') {
    const num = Number(value);
    if (!isNaN(num)) {
      return `₹${num.toLocaleString('en-IN')}`;
    }
  } else if (ds.format === 'uppercase') {
    return String(value).toUpperCase();
  } else if (ds.format === 'date') {
    try {
      return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return String(value);
    }
  }

  return String(value);
}

export function resolveNodeContent(
  content: Record<string, any>,
  dataSourceMap?: Record<string, DynamicDataSource>,
  contextData: Record<string, any> = {}
): Record<string, any> {
  if (!dataSourceMap || Object.keys(dataSourceMap).length === 0) {
    return content;
  }

  const resolved = { ...content };
  for (const [key, ds] of Object.entries(dataSourceMap)) {
    const dynamicVal = resolveDynamicData(ds, contextData);
    if (dynamicVal !== undefined) {
      resolved[key] = dynamicVal;
    }
  }

  return resolved;
}

export const resolveDynamicDataSource = resolveDynamicData;

export function resolveDynamicField(
  ds: { source?: string; sourceType?: string; field: string; fallback?: any; format?: string },
  contextData: Record<string, any> = {}
): any {
  if (!ds || !ds.field) return ds?.fallback;
  const source = ds.sourceType || ds.source;
  if (!source) return ds?.fallback;

  const targetObject = contextData[source] || {};
  const value = targetObject[ds.field];
  if (value === undefined || value === null) {
    return ds?.fallback;
  }
  return value;
}

