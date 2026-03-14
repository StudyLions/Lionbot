// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Client-side profile card preview overlay on skin backgrounds.
//          Shows demo data for logged-out users, real data for logged-in users.
// ============================================================
import React from "react";
import Image from "next/image";
import { Gem, Coins, Trophy } from "lucide-react";

interface CardData {
  username: string;
  avatarUrl: string | null;
  level: number;
  rank: string;
  coins: number;
  gems: number;
  studyHours: number;
}

const DEMO_DATA: CardData = {
  username: "LionBot User",
  avatarUrl: null,
  level: 42,
  rank: "Gold III",
  coins: 12500,
  gems: 3200,
  studyHours: 847,
};

export function SkinCardPreview({
  backgroundSrc,
  skinName,
  userData,
  compact = false,
}: {
  backgroundSrc: any;
  skinName: string;
  userData?: CardData | null;
  compact?: boolean;
}) {
  const data = userData || DEMO_DATA;
  const isDemo = !userData;

  if (compact) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl">
        <Image
          src={backgroundSrc}
          alt={`${skinName} skin`}
          layout="responsive"
          width={1000}
          height={400}
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 flex items-center p-4 gap-3">
          {/* Avatar */}
          <div className="shrink-0 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/70 text-lg font-bold">{data.username[0]}</span>
            )}
          </div>
          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-bold truncate drop-shadow-md">{data.username}</p>
            <p className="text-white/60 text-xs drop-shadow-md">Lvl {data.level}</p>
          </div>
          {/* Stats pill */}
          <div className="shrink-0 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="flex items-center gap-1">
              <Coins className="h-3 w-3 text-yellow-400" />
              <span className="text-white/90 text-[10px] font-medium">{formatNum(data.coins)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gem className="h-3 w-3 text-blue-400" />
              <span className="text-white/90 text-[10px] font-medium">{formatNum(data.gems)}</span>
            </div>
          </div>
          {isDemo && (
            <div className="absolute bottom-1.5 right-2">
              <span className="text-[9px] text-white/30">Demo preview</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <Image
        src={backgroundSrc}
        alt={`${skinName} skin`}
        layout="responsive"
        width={1000}
        height={400}
        objectFit="cover"
        priority
      />
      <div className="absolute inset-0 flex p-5 sm:p-6 gap-5">
        {/* Column 1: Avatar + counters */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/70 text-2xl font-bold">{data.username[0]}</span>
            )}
          </div>
          <div className="flex flex-col gap-1 w-full">
            <CounterPill icon={<Coins className="h-3 w-3 text-yellow-400" />} value={formatNum(data.coins)} />
            <CounterPill icon={<Gem className="h-3 w-3 text-blue-400" />} value={formatNum(data.gems)} />
            <CounterPill icon={<Trophy className="h-3 w-3 text-amber-400" />} value={data.rank} />
          </div>
        </div>

        {/* Column 2: Profile info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400/90 drop-shadow-md">Profile</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">Achievements</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white truncate drop-shadow-md">
            {data.username}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
            <StatRow label="Level" value={String(data.level)} />
            <StatRow label="Rank" value={data.rank} />
            <StatRow label="Study Hours" value={formatNum(data.studyHours)} />
            <StatRow label="Coins" value={formatNum(data.coins)} />
          </div>
          {isDemo && (
            <p className="mt-3 text-[10px] text-white/30 italic">Demo preview with sample data</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CounterPill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-md px-2 py-1">
      {icon}
      <span className="text-white/90 text-[11px] font-semibold">{value}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white/90 drop-shadow-sm">{value}</p>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
