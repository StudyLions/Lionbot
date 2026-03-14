// --- AI-MODIFIED (2026-03-14) ---
// Purpose: Updated layout interface to support optional SEO properties
export interface ILayout {
  children: any;
  SEO: {
    title: string;
    description: string;
    canonical?: string;
    openGraph?: Record<string, any>;
  };
}
// --- END AI-MODIFIED ---
