// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Pet crafting page - stub (crafting system removed)
// ============================================================
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import PixelCard from "@/components/pet/ui/PixelCard"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Crafting removed -- equipment and scrolls now drop from activity.
// This page is a stub placeholder for future use.

export default function CraftingPage() {
  return (
    <Layout SEO={{ title: "Crafting - LionGotchi", description: "Crafting coming soon" }}>
      <AdminGuard variant="pet">
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="font-pixel text-2xl text-[var(--pet-text,#e2e8f0)]">Crafting</h1>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="block h-[3px] w-8 bg-[var(--pet-gold,#f0c040)]" />
                  <span className="block h-[3px] w-4 bg-[var(--pet-gold,#f0c040)]/60" />
                  <span className="block h-[3px] w-2 bg-[var(--pet-gold,#f0c040)]/30" />
                </div>
              </div>

              <PixelCard className="p-12 text-center" corners>
                <p className="font-pixel text-xl text-[var(--pet-gold,#f0c040)] mb-4">Coming Soon</p>
                <p className="font-pixel text-sm text-[var(--pet-text-dim,#8899aa)] leading-relaxed max-w-md mx-auto">
                  Equipment and scrolls now drop directly from studying and chatting.
                  <br /><br />
                  A new crafting system is being designed. Stay tuned!
                </p>
              </PixelCard>
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}
// --- END AI-MODIFIED ---

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
