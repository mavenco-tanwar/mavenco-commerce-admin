/**
 * Module 38: Style Conversion Utilities
 * Converts Elementor-style NodeStyle configuration into React CSSProperties.
 */

import { CSSProperties } from 'react';
import { NodeStyle, DeviceType, ResponsiveValue, NodeSpacing } from './types';

export function resolveResponsive<T>(val?: ResponsiveValue<T> | T, device: DeviceType = 'desktop'): T | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val !== 'object' || Array.isArray(val) || !('desktop' in (val as any))) {
    return val as T;
  }

  const rVal = val as ResponsiveValue<T>;
  if (device === 'mobile') {
    return rVal.mobile !== undefined ? rVal.mobile : rVal.tablet !== undefined ? rVal.tablet : rVal.desktop;
  }
  if (device === 'tablet') {
    return rVal.tablet !== undefined ? rVal.tablet : rVal.desktop;
  }
  return rVal.desktop;
}

export function formatSpacing(spacing?: NodeSpacing): string | undefined {
  if (!spacing) return undefined;
  const top = spacing.top || '0px';
  const right = spacing.right || '0px';
  const bottom = spacing.bottom || '0px';
  const left = spacing.left || '0px';
  return `${top} ${right} ${bottom} ${left}`;
}

export const resolveNodeStyles = computeNodeStyle;

export function computeNodeStyle(style?: NodeStyle, device: DeviceType = 'desktop'): CSSProperties {
  if (!style) return {};


  const css: CSSProperties = {};

  // 1. Typography
  if (style.typography) {
    const typo = style.typography;
    if (typo.fontFamily) css.fontFamily = typo.fontFamily;
    const fontSize = resolveResponsive(typo.fontSize, device);
    if (fontSize) css.fontSize = fontSize;
    if (typo.fontWeight) css.fontWeight = typo.fontWeight;
    const lineHeight = resolveResponsive(typo.lineHeight, device);
    if (lineHeight) css.lineHeight = lineHeight;
    if (typo.letterSpacing) css.letterSpacing = typo.letterSpacing;
    if (typo.textTransform) css.textTransform = typo.textTransform;
    if (typo.textDecoration) css.textDecoration = typo.textDecoration;
    const textAlign = resolveResponsive(typo.textAlign, device);
    if (textAlign) css.textAlign = textAlign;
    if (typo.color) css.color = typo.color;
  }

  // 2. Spacing
  if (style.spacing) {
    const margin = resolveResponsive(style.spacing.margin, device);
    if (margin) {
      if (margin.top) css.marginTop = margin.top;
      if (margin.right) css.marginRight = margin.right;
      if (margin.bottom) css.marginBottom = margin.bottom;
      if (margin.left) css.marginLeft = margin.left;
    }

    const padding = resolveResponsive(style.spacing.padding, device);
    if (padding) {
      if (padding.top) css.paddingTop = padding.top;
      if (padding.right) css.paddingRight = padding.right;
      if (padding.bottom) css.paddingBottom = padding.bottom;
      if (padding.left) css.paddingLeft = padding.left;
    }

    const gap = resolveResponsive(style.spacing.gap, device);
    if (gap) css.gap = gap;
  }

  // 3. Sizing
  if (style.size) {
    const width = resolveResponsive(style.size.width, device);
    if (width) css.width = width;
    if (style.size.minWidth) css.minWidth = style.size.minWidth;
    const maxWidth = resolveResponsive(style.size.maxWidth, device);
    if (maxWidth) css.maxWidth = maxWidth;

    const height = resolveResponsive(style.size.height, device);
    if (height) css.height = height;
    const minHeight = resolveResponsive(style.size.minHeight, device);
    if (minHeight) css.minHeight = minHeight;
    if (style.size.maxHeight) css.maxHeight = style.size.maxHeight;
  }

  // 4. Position
  if (style.position) {
    if (style.position.type) css.position = style.position.type;
    if (typeof style.position.zIndex === 'number') css.zIndex = style.position.zIndex;
  }

  // 5. Border
  if (style.border) {
    if (style.border.style && style.border.style !== 'none') {
      css.borderStyle = style.border.style;
      if (style.border.color) css.borderColor = style.border.color;
      if (style.border.width) {
        if (style.border.width.top) css.borderTopWidth = style.border.width.top;
        if (style.border.width.right) css.borderRightWidth = style.border.width.right;
        if (style.border.width.bottom) css.borderBottomWidth = style.border.width.bottom;
        if (style.border.width.left) css.borderLeftWidth = style.border.width.left;
      }
    }
    if (style.border.radius) {
      if (style.border.radius.top) css.borderTopLeftRadius = style.border.radius.top;
      if (style.border.radius.right) css.borderTopRightRadius = style.border.radius.right;
      if (style.border.radius.bottom) css.borderBottomRightRadius = style.border.radius.bottom;
      if (style.border.radius.left) css.borderBottomLeftRadius = style.border.radius.left;
    }
  }

  // 6. Box Shadow
  if (style.shadow) {
    const s = style.shadow;
    const x = s.x || '0px';
    const y = s.y || '4px';
    const blur = s.blur || '12px';
    const spread = s.spread || '0px';
    const color = s.color || 'rgba(0,0,0,0.08)';
    const inset = s.inset ? 'inset ' : '';
    css.boxShadow = `${inset}${x} ${y} ${blur} ${spread} ${color}`;
  }

  // 7. Background
  if (style.background) {
    const bg = style.background;
    if (bg.type === 'color' && bg.color) {
      css.backgroundColor = bg.color;
    } else if (bg.type === 'gradient' && bg.gradient) {
      css.background = bg.gradient;
    } else if (bg.type === 'image' && bg.imageUrl) {
      css.backgroundImage = `url(${bg.imageUrl})`;
      css.backgroundSize = bg.size || 'cover';
      css.backgroundPosition = bg.position || 'center';
      css.backgroundRepeat = bg.repeat || 'no-repeat';
    }
  }

  // 8. Opacity
  if (typeof style.opacity === 'number') {
    css.opacity = style.opacity;
  }

  return css;
}
