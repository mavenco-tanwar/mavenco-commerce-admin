import { ApiClient } from "./api";
import { PlatformService } from "./platform";
import { INITIAL_STORE_SETTINGS, INITIAL_THEME_SETTINGS } from "@/lib/mock-data";
import type { StoreSettings, ThemeSettings } from "@/types";

export class SettingsService {
  static async getStoreSettings(): Promise<StoreSettings> {
    const tenant = PlatformService.getActiveTenant();
    try {
      const res = await ApiClient.get<any>(`/api/v1/tenant-config?tenant=${tenant.slug}&_t=${Date.now()}`);
      if (res.data) {
        return {
          ...INITIAL_STORE_SETTINGS,
          storeName: res.data.name || tenant.name,
          tagline: res.data.tagline || tenant.tagline || INITIAL_STORE_SETTINGS.tagline,
          currency: res.data.currency || tenant.currency || INITIAL_STORE_SETTINGS.currency,
          contactEmail: res.data.contact?.email || tenant.ownerEmail || INITIAL_STORE_SETTINGS.contactEmail,
          phone: res.data.contact?.phone || INITIAL_STORE_SETTINGS.phone,
          address: res.data.contact?.address || INITIAL_STORE_SETTINGS.address,
        };
      }
    } catch {}
    return {
      ...INITIAL_STORE_SETTINGS,
      storeName: tenant.name,
      tagline: tenant.tagline || INITIAL_STORE_SETTINGS.tagline,
      currency: tenant.currency || INITIAL_STORE_SETTINGS.currency,
      contactEmail: tenant.ownerEmail || INITIAL_STORE_SETTINGS.contactEmail,
    };
  }

  static async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const tenant = PlatformService.getActiveTenant();

    if (updates.storeName || updates.tagline) {
      PlatformService.updateTenant(tenant.id, {
        name: updates.storeName || tenant.name,
        tagline: updates.tagline || tenant.tagline,
      });
    }

    try {
      await ApiClient.put(`/api/v1/tenant-config?tenant=${tenant.slug}`, {
        name: updates.storeName,
        tagline: updates.tagline,
        currency: updates.currency,
        contact: {
          email: updates.contactEmail,
          phone: updates.phone,
          address: updates.address,
        },
      });
    } catch {}

    return {
      ...INITIAL_STORE_SETTINGS,
      ...updates,
      storeName: updates.storeName || tenant.name,
      tagline: updates.tagline || tenant.tagline || "",
      currency: updates.currency || tenant.currency || "INR",
      contactEmail: updates.contactEmail || tenant.ownerEmail || "",
      phone: updates.phone || "+1 (555) 000-0000",
      address: updates.address || "",
    };
  }

  static async getThemeSettings(): Promise<ThemeSettings> {
    const tenant = PlatformService.getActiveTenant();
    try {
      const res = await ApiClient.get<any>(`/api/v1/tenant-config?tenant=${tenant.slug}&_t=${Date.now()}`);
      if (res.data?.theme) {
        const t = res.data.theme;
        return {
          ...INITIAL_THEME_SETTINGS,
          colors: {
            ...INITIAL_THEME_SETTINGS.colors,
            primary: t.primaryColor || tenant.theme?.primaryColor || INITIAL_THEME_SETTINGS.colors.primary,
            accent: t.accentColor || tenant.theme?.accentColor || INITIAL_THEME_SETTINGS.colors.accent,
            background: t.secondaryColor || tenant.theme?.secondaryColor || INITIAL_THEME_SETTINGS.colors.background,
          },
          typography: {
            headingFont: t.headingFont || tenant.theme?.headingFont || INITIAL_THEME_SETTINGS.typography.headingFont,
            bodyFont: t.bodyFont || tenant.theme?.bodyFont || INITIAL_THEME_SETTINGS.typography.bodyFont,
          },
        };
      }
    } catch {}

    return {
      ...INITIAL_THEME_SETTINGS,
      colors: {
        ...INITIAL_THEME_SETTINGS.colors,
        primary: tenant.theme?.primaryColor || INITIAL_THEME_SETTINGS.colors.primary,
        accent: tenant.theme?.accentColor || INITIAL_THEME_SETTINGS.colors.accent,
        background: tenant.theme?.secondaryColor || INITIAL_THEME_SETTINGS.colors.background,
      },
    };
  }

  static async updateThemeSettings(updates: any): Promise<ThemeSettings> {
    const tenant = PlatformService.getActiveTenant();

    PlatformService.updateTenant(tenant.id, {
      theme: {
        primaryColor: updates.colors?.primary || tenant.theme?.primaryColor || "#111111",
        secondaryColor: updates.colors?.background || tenant.theme?.secondaryColor || "#FFFDFC",
        accentColor: updates.colors?.accent || tenant.theme?.accentColor || "#B77A68",
        headingFont: updates.typography?.headingFont || tenant.theme?.headingFont || "Playfair Display, serif",
        bodyFont: updates.typography?.bodyFont || tenant.theme?.bodyFont || "Plus Jakarta Sans, sans-serif",
        borderRadius: updates.buttonStyle || "md",
      },
    });

    try {
      await ApiClient.put(`/api/v1/tenant-config?tenant=${tenant.slug}`, {
        name: updates.storeName,
        tagline: updates.storeTagline,
        theme: {
          primaryColor: updates.colors?.primary,
          secondaryColor: updates.colors?.background,
          accentColor: updates.colors?.accent,
          headingFont: updates.typography?.headingFont,
          bodyFont: updates.typography?.bodyFont,
        },
        announcements: updates.announcements,
      });
    } catch {}

    return {
      ...INITIAL_THEME_SETTINGS,
      ...updates,
      colors: {
        ...INITIAL_THEME_SETTINGS.colors,
        ...(updates.colors || {}),
      },
    };
  }
}
