export function getApiBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_CMS_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!raw || raw.includes("jq-trends.vercel.app")) {
    raw =
      typeof window !== "undefined" && (window.location.hostname.includes("vercel.app") || window.location.protocol === "https:")
        ? "https://mavenco-storefront.vercel.app"
        : "http://localhost:3000";
  }

  raw = raw.trim().replace(/\/+$/, "");
  if (raw && !raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  return raw;
}

export function getStorefrontBaseUrl(): string {
  let raw = process.env.NEXT_PUBLIC_STOREFRONT_URL || "";
  if (!raw || raw.includes("jq-trends.vercel.app")) {
    raw =
      typeof window !== "undefined" && (window.location.hostname.includes("vercel.app") || window.location.protocol === "https:")
        ? "https://mavenco-storefront.vercel.app"
        : "http://localhost:3000";
  }
  raw = raw.trim().replace(/\/+$/, "");
  if (raw && !raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  return raw;
}

export function getTenantStorefrontUrl(tenantSlug?: string, subPath: string = ""): string {
  const base = getStorefrontBaseUrl();
  let cleanSlug = (tenantSlug || "").trim().toLowerCase();

  // If missing, generic placeholder, or stale mock lumina, retrieve from logged-in user
  if (!cleanSlug || cleanSlug === "demo" || cleanSlug === "store_demo" || cleanSlug === "all" || cleanSlug === "jqtrends" || cleanSlug === "lumina" || cleanSlug === "store_lumina") {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("jq_admin_user");
        if (raw) {
          const u = JSON.parse(raw);
          const isSuper =
            u.role === "superadmin" ||
            u.roleId === "role_superadmin" ||
            (u.email && (u.email.toLowerCase().includes("superadmin") || u.email.toLowerCase() === "admin@mavenco.com"));
          if (!isSuper && u.tenantSlug && u.tenantSlug !== "all" && u.tenantSlug !== "lumina") {
            cleanSlug = u.tenantSlug.toLowerCase().trim();
          } else if (!isSuper && u.storeSlug && u.storeSlug !== "all" && u.storeSlug !== "lumina") {
            cleanSlug = u.storeSlug.toLowerCase().trim();
          }
        }
      } catch {}
    }
  }

  if (!cleanSlug || cleanSlug === "demo" || cleanSlug === "store_demo" || cleanSlug === "all" || cleanSlug === "jqtrends" || cleanSlug === "lumina" || cleanSlug === "store_lumina") {
    cleanSlug = "jq-trends";
  }

  const cleanPath = subPath ? (subPath.startsWith("/") ? subPath : `/${subPath}`) : "";
  return `${base}/stores/${cleanSlug}${cleanPath}`;
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "store_jq_trends";

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  message?: string;
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface RequestOptions extends RequestInit {
  bypassCache?: boolean;
  ttlMs?: number;
}

// Global active request tracker
let activeRequestCount = 0;
function notifyLoadingChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("api_loading_change", {
        detail: { activeCount: activeRequestCount, isLoading: activeRequestCount > 0 },
      })
    );
  }
}

export class ApiClient {
  private static responseCache = new Map<string, { data: any; timestamp: number }>();
  private static pendingRequests = new Map<string, Promise<any>>();
  private static DEFAULT_TTL = 30_000; // 30 seconds fresh cache

  static {
    if (typeof window !== "undefined") {
      window.addEventListener("tenant_updated", () => {
        ApiClient.clearCache();
      });
      window.addEventListener("products_updated", () => {
        ApiClient.clearCache("/api/v1/products");
      });
      window.addEventListener("categories_updated", () => {
        ApiClient.clearCache("/api/v1/categories");
      });
      window.addEventListener("orders_updated", () => {
        ApiClient.clearCache("/api/v1/orders");
      });
    }
  }

  public static clearCache(keyPrefix?: string): void {
    if (!keyPrefix) {
      this.responseCache.clear();
      this.pendingRequests.clear();
      return;
    }
    for (const key of this.responseCache.keys()) {
      if (key.includes(keyPrefix)) {
        this.responseCache.delete(key);
      }
    }
    for (const key of this.pendingRequests.keys()) {
      if (key.includes(keyPrefix)) {
        this.pendingRequests.delete(key);
      }
    }
  }

  public static getActiveCount(): number {
    return activeRequestCount;
  }

  private static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("jq_admin_token") || "demo_jwt_token_jq_trends";
  }

  public static async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = getApiBaseUrl();
    let currentTenantSlug = "";
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const qTenant = urlParams.get("tenant");
        if (qTenant && qTenant !== "all" && qTenant !== "lumina") {
          currentTenantSlug = qTenant.replace(/^store_/, "").trim().toLowerCase();
        }
        if (!currentTenantSlug) {
          const storedTenantId = localStorage.getItem("jq_saas_active_tenant_id");
          const storedTenantSlug = localStorage.getItem("jq_saas_active_tenant_slug");
          const effective = storedTenantId || storedTenantSlug || "";
          if (effective && effective !== "all" && effective !== "lumina") {
            currentTenantSlug = effective.replace(/^store_/, "").trim().toLowerCase();
            localStorage.setItem("jq_saas_active_tenant_slug", currentTenantSlug);
          }
        }
        if (!currentTenantSlug) {
          const userRaw = localStorage.getItem("jq_admin_user");
          if (userRaw) {
            const u = JSON.parse(userRaw);
            if (u.tenantSlug && u.tenantSlug !== "all") {
              currentTenantSlug = u.tenantSlug.replace(/^store_/, "").trim().toLowerCase();
            } else if (u.tenantId) {
              currentTenantSlug = u.tenantId.replace(/^store_/, "").trim().toLowerCase();
            }
          }
        }
      }
    } catch {}

    if (!currentTenantSlug || currentTenantSlug === "all") {
      currentTenantSlug = "jq-trends";
    }

    // Explicitly append tenant query param if not already present
    let finalEndpoint = endpoint;
    if (!finalEndpoint.includes("tenant=") && currentTenantSlug) {
      const sep = finalEndpoint.includes("?") ? "&" : "?";
      finalEndpoint = `${finalEndpoint}${sep}tenant=${encodeURIComponent(currentTenantSlug)}`;
    }

    let effectiveBaseUrl = baseUrl;
    if (typeof window !== "undefined") {
      const isInternalRoute =
        finalEndpoint.startsWith("/api/v1/content") ||
        finalEndpoint.startsWith("/api/v1/theme") ||
        finalEndpoint.startsWith("/api/v1/products") ||
        finalEndpoint.startsWith("/api/v1/categories") ||
        finalEndpoint.startsWith("/api/v1/collections") ||
        finalEndpoint.startsWith("/api/v1/platform") ||
        finalEndpoint.startsWith("/api/v1/marketing") ||
        finalEndpoint.startsWith("/api/v1/reviews");
      if (isInternalRoute) {
        effectiveBaseUrl = window.location.origin;
      }
    }

    const url = `${effectiveBaseUrl}${finalEndpoint.startsWith("/") ? finalEndpoint : `/${finalEndpoint}`}`;
    const method = (options.method || "GET").toUpperCase();
    const isGet = method === "GET";
    const cacheKey = `${method}:${url}`;
    const ttl = options.ttlMs ?? this.DEFAULT_TTL;

    // Cache hit?
    if (isGet && !options.bypassCache && this.responseCache.has(cacheKey)) {
      const cached = this.responseCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < ttl) {
        return structuredClone(cached.data);
      } else {
        this.responseCache.delete(cacheKey);
      }
    }

    // In-flight deduplication for identical GET requests
    if (isGet && !options.bypassCache && this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Mutating request invalidates relevant cache
    if (!isGet) {
      this.clearCache(endpoint.split("?")[0]);
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Store-ID": `store_${currentTenantSlug}`,
      "x-tenant-slug": currentTenantSlug,
      "X-API-Key": "sk_live_master_admin_key_9921",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    activeRequestCount++;
    notifyLoadingChange();

    const fetchPromise = (async () => {
      try {
        const res = await fetch(url, {
          ...options,
          headers,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error?.message || `HTTP ${res.status} Error`);
        }

        const json = await res.json();
        if (isGet) {
          this.responseCache.set(cacheKey, {
            data: json,
            timestamp: Date.now(),
          });
        }
        return json;
      } catch (err: any) {
        console.warn(`[API Client fallback] API error on ${endpoint}:`, err.message);
        throw err;
      } finally {
        activeRequestCount = Math.max(0, activeRequestCount - 1);
        notifyLoadingChange();
        if (isGet) {
          this.pendingRequests.delete(cacheKey);
        }
      }
    })();

    if (isGet) {
      this.pendingRequests.set(cacheKey, fetchPromise);
    }

    return fetchPromise;
  }

  public static get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public static post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}
