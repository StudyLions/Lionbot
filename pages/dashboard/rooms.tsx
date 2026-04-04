// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Private Rooms dashboard page - two-panel master-detail
//          layout with room list on left, room detail on right.
//          Mobile collapses to single column with navigation.
// ============================================================
// --- AI-REPLACED (2026-04-03) ---
// Reason: Complete redesign from single-column accordion to two-panel
//         master-detail layout with componentized architecture
// What the new code does better: Responsive two-panel layout, separated
//         components, wallet display, member management, voice indicators
// --- Original code (commented out for rollback) ---
// The original ~1160-line single-file implementation has been replaced.
// All original component logic is preserved in the new component files
// under components/dashboard/rooms/. The original file is available
// in git history on the lionbot-2026 branch.
// --- End original code ---
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { DashboardShell, PageHeader } from "@/components/dashboard/ui"
import { useDashboard } from "@/hooks/useDashboard"
import { useSession } from "next-auth/react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { DoorOpen } from "lucide-react"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import RoomList from "@/components/dashboard/rooms/RoomList"
import RoomDetail from "@/components/dashboard/rooms/RoomDetail"
import RentRoomModal from "@/components/dashboard/rooms/RentRoomModal"
import type { RoomsData } from "@/components/dashboard/rooms/types"

export default function RoomsPage() {
  const { data: session } = useSession()
  const { data, isLoading, mutate } = useDashboard<RoomsData>(
    session ? "/api/dashboard/rooms" : null,
    { refreshInterval: 30000 }
  )
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<"list" | "detail">("list")
  const [showRentModal, setShowRentModal] = useState(false)

  const handleSelectRoom = useCallback((channelId: string) => {
    setSelectedRoom(channelId)
    setMobileView("detail")
  }, [])

  const handleBack = useCallback(() => {
    setMobileView("list")
  }, [])

  const handleRoomClosed = useCallback(() => {
    setSelectedRoom(null)
    setMobileView("list")
    mutate()
  }, [mutate])

  const handleMutate = useCallback(() => {
    mutate()
  }, [mutate])

  const hasRooms = data && (data.servers.length > 0 || data.expiredRooms.length > 0)

  return (
    <Layout
      SEO={{ title: "My Rooms - LionBot Dashboard", description: "Manage your private rooms" }}
    >
      <AdminGuard>
        <DashboardShell nav={<DashboardNav />}>
          <PageHeader
            title="My Rooms"
            description={
              data && data.totalActiveRooms > 0
                ? `${data.totalActiveRooms} active room${data.totalActiveRooms !== 1 ? "s" : ""} across ${data.servers.length} server${data.servers.length !== 1 ? "s" : ""}`
                : undefined
            }
            breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Rooms" }]}
          />

          {isLoading ? (
            <LoadingSkeleton />
          ) : !hasRooms ? (
            <EmptyState onRentClick={() => setShowRentModal(true)} />
          ) : (
            <div className="flex gap-5 min-h-0">
              {/* Left panel: Room List */}
              <div
                className={cn(
                  "w-full lg:w-[380px] lg:flex-shrink-0 lg:block",
                  mobileView === "detail" && "hidden"
                )}
              >
                <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
                  <RoomList
                    servers={data!.servers}
                    expiredRooms={data!.expiredRooms}
                    selectedRoom={selectedRoom}
                    onSelectRoom={handleSelectRoom}
                    onRentClick={() => setShowRentModal(true)}
                  />
                </div>
              </div>

              {/* Right panel: Room Detail */}
              <div
                className={cn(
                  "flex-1 min-w-0 lg:block",
                  mobileView === "list" && "hidden"
                )}
              >
                {selectedRoom ? (
                  <div className="lg:sticky lg:top-4">
                    <RoomDetail
                      channelId={selectedRoom}
                      onBack={handleBack}
                      onRoomClosed={handleRoomClosed}
                    />
                  </div>
                ) : (
                  <NoRoomSelected />
                )}
              </div>
            </div>
          )}

          <RentRoomModal
            open={showRentModal}
            onClose={() => setShowRentModal(false)}
            walletBalanceByGuild={data?.walletBalanceByGuild ?? {}}
            servers={data?.servers ?? []}
          />
        </DashboardShell>
      </AdminGuard>
    </Layout>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex gap-5">
      <div className="w-full lg:w-[380px] space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-card/50 border border-border/50 animate-pulse">
            <div className="h-4 bg-muted rounded w-2/5 mb-3" />
            <div className="h-3 bg-muted rounded w-3/5 mb-2" />
            <div className="h-1.5 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
      <div className="hidden lg:block flex-1">
        <div className="p-6 rounded-xl bg-card/30 border border-border/50 animate-pulse">
          <div className="h-5 bg-muted rounded w-1/3 mb-4" />
          <div className="h-3 bg-muted rounded w-2/3 mb-3" />
          <div className="h-2 bg-muted rounded w-full mb-6" />
          <div className="h-24 bg-muted rounded w-full" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onRentClick }: { onRentClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
        <DoorOpen size={40} className="text-blue-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No Private Rooms Yet</h2>
      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
        Private rooms are personal voice channels you rent in a server. You get your own space to
        study with friends, set timers, and manage who can join.
      </p>
      <div className="bg-card/50 rounded-xl p-5 max-w-sm w-full text-left space-y-3 border border-border/50 mb-4">
        <h3 className="text-sm font-semibold text-foreground">How to get started</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>Join a server that has private rooms enabled</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>
              Use{" "}
              <code className="text-blue-300 bg-blue-500/10 px-1 rounded">/room rent</code> to
              create your room
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span>Invite friends, set timers, and manage everything here!</span>
          </div>
        </div>
      </div>
      <button
        onClick={onRentClick}
        className="px-6 py-2.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Learn More
      </button>
    </div>
  )
}

function NoRoomSelected() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-xl bg-card/20 border border-border/30 border-dashed">
      <DoorOpen size={32} className="text-muted-foreground/50 mb-3" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">Select a room to view details</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
// --- END AI-REPLACED ---
