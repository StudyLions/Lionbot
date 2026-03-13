// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Profile editor with read-only info and editable settings
// ============================================================
import Layout from "@/components/Layout/Layout"
import AdminGuard from "@/components/dashboard/AdminGuard"
import DashboardNav from "@/components/dashboard/DashboardNav"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

interface ProfileData {
  userId: string
  name: string | null
  timezone: string | null
  locale: string | null
  showGlobalStats: boolean | null
  gems: number
  firstSeen: string | null
  lastSeen: string | null
}

const LOCALE_OPTIONS = [
  { value: "", label: "Default" },
  { value: "en_GB", label: "English (UK)" },
  { value: "pt_BR", label: "Portugu\u00eas (Brasil)" },
  { value: "he_IL", label: "\u05e2\u05d1\u05e8\u05d9\u05ea" },
  { value: "tr", label: "T\u00fcrk\u00e7e" },
]

const TIMEZONE_OPTIONS = [
  "", "UTC", "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Moscow",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai",
  "Australia/Sydney", "America/Sao_Paulo", "Africa/Cairo",
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [original, setOriginal] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setOriginal(data)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { if (session) fetchData() }, [session, fetchData])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000) }

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(original)

  const save = async () => {
    if (!profile || !original) return
    setSaving(true)
    const updates: Record<string, any> = {}
    if (profile.timezone !== original.timezone) updates.timezone = profile.timezone || null
    if (profile.locale !== original.locale) updates.locale = profile.locale || null
    if (profile.showGlobalStats !== original.showGlobalStats) updates.show_global_stats = profile.showGlobalStats

    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (res.ok) { showToast("Profile saved"); setOriginal({ ...profile }) }
      else showToast("Failed to save")
    } catch { showToast("Error saving") }
    setSaving(false)
  }

  const reset = () => { if (original) setProfile({ ...original }) }

  return (
    <Layout SEO={{ title: "Profile - LionBot Dashboard", description: "Edit your profile" }}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-900 pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-8">
            <DashboardNav />
            <div className="flex-1 min-w-0 max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                  <span className="text-gray-400 hover:text-white cursor-pointer text-sm">&larr; Dashboard</span>
                </Link>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
              </div>

              {loading ? (
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-2xl p-6 animate-pulse h-32" />
                  <div className="bg-gray-800 rounded-2xl p-6 animate-pulse h-48" />
                </div>
              ) : !profile ? (
                <div className="text-center py-20 text-gray-400">Unable to load profile</div>
              ) : (
                <>
                  {/* Read-only info */}
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Account Info</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Username</p>
                        <p className="text-white font-medium">{profile.name || session?.user?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Discord ID</p>
                        <p className="text-gray-300 font-mono text-sm">{profile.userId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">LionGems</p>
                        <p className="text-amber-400 font-bold text-xl">{profile.gems.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Member Since</p>
                        <p className="text-gray-300 text-sm">
                          {profile.firstSeen ? new Date(profile.firstSeen).toLocaleDateString() : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Editable settings */}
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Preferences</h2>
                    <div className="space-y-5">
                      <div>
                        <label className="text-gray-400 text-sm block mb-2">Timezone</label>
                        <select value={profile.timezone || ""}
                          onChange={e => setProfile(p => p ? { ...p, timezone: e.target.value || null } : p)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                          {TIMEZONE_OPTIONS.map(tz => (
                            <option key={tz} value={tz}>{tz || "Not set"}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-400 text-sm block mb-2">Language</label>
                        <select value={profile.locale || ""}
                          onChange={e => setProfile(p => p ? { ...p, locale: e.target.value || null } : p)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                          {LOCALE_OPTIONS.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">Show Global Stats</p>
                          <p className="text-gray-500 text-xs">Display your stats on global leaderboards</p>
                        </div>
                        <button
                          onClick={() => setProfile(p => p ? { ...p, showGlobalStats: !p.showGlobalStats } : p)}
                          className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${
                            profile.showGlobalStats ? "bg-indigo-600" : "bg-gray-600"
                          }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            profile.showGlobalStats ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save bar */}
                  {hasChanges && (
                    <div className="sticky bottom-20 mt-6 bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-indigo-500/30 p-4 flex items-center justify-between shadow-xl">
                      <span className="text-gray-300 text-sm">You have unsaved changes</span>
                      <div className="flex gap-3">
                        <button onClick={reset}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl text-sm font-medium transition-all">
                          Reset
                        </button>
                        <button onClick={save} disabled={saving}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95">
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-xl border border-gray-700 text-sm z-50 animate-pulse">
            {toast}
          </div>
        )}
      </AdminGuard>
    </Layout>
  )
}
