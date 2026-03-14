// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Client-side replica of the bot's /me profile card layout.
//          Matches the PIL-rendered ProfileCard from src/gui/cards/profile.py.
//          Shows demo data for logged-out users, session avatar/name when logged in.
// ============================================================
import React from "react";
import Image from "next/image";

interface CardData {
  username: string;
  discriminator: string;
  avatarUrl: string | null;
  coins: number;
  gems: number;
  gifts: number;
  badges: string[];
  currentRank: { name: string; range: string } | null;
  rankProgress: number;
  nextRank: { name: string; range: string } | null;
  achievements: number[];
}

const DEMO_DATA: CardData = {
  username: "LionBot User",
  discriminator: "",
  avatarUrl: null,
  coins: 58596,
  gems: 10000,
  gifts: 100,
  badges: ["STUDYING: MEDICINE", "HOBBY: MATHS", "CAREER: STUDENT", "FROM: EUROPE"],
  currentRank: { name: "VAMPIRE", range: "3000 - 4000h" },
  rankProgress: 0.5,
  nextRank: { name: "WIZARD", range: "4000 - 8000h" },
  achievements: [0, 2, 5, 7],
};

export function SkinCardPreview({
  backgroundSrc,
  skinName,
  userData,
  compact = false,
}: {
  backgroundSrc: any;
  skinName: string;
  userData?: Partial<CardData> | null;
  compact?: boolean;
}) {
  const data: CardData = { ...DEMO_DATA, ...userData };
  const isDemo = !userData;

  if (compact) {
    return (
      <div className="relative w-full aspect-[2.1/1] overflow-hidden rounded-xl">
        <Image src={backgroundSrc} alt={skinName} layout="fill" objectFit="cover" />
        <div className="absolute inset-0 p-[5%] flex gap-[3%]">
          {/* Col 1: avatar + counters */}
          <div className="flex flex-col items-center gap-1 w-[18%]">
            <div className="w-full aspect-square rounded-full border-2 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/60 text-[10px] font-bold">{data.username[0]}</span>
              )}
            </div>
            <CounterPillCompact icon="coin" value={fmt(data.coins)} />
            <CounterPillCompact icon="gem" value={fmt(data.gems)} />
          </div>
          {/* Col 2: name + badges */}
          <div className="flex-1 min-w-0">
            <p className="text-[#DDB21D] text-[9px] sm:text-[11px] font-black italic truncate leading-tight">
              {data.username}
              {data.discriminator && <span className="text-[#BABABA] ml-1">{data.discriminator}</span>}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[#DDB21D] text-[7px] sm:text-[8px] font-black uppercase">Profile</span>
              <span className="text-[#BABABA]/40 text-[7px] sm:text-[8px] font-black uppercase">Achievements</span>
            </div>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {data.badges.slice(0, 3).map((b, i) => (
                <span key={i} className="text-[5px] sm:text-[6px] text-white font-bold bg-[#1473A2] rounded-full px-1.5 py-[1px] uppercase leading-tight">{b}</span>
              ))}
            </div>
            {data.currentRank && (
              <div className="mt-auto pt-1">
                <p className="text-[#DDB21D] text-[7px] sm:text-[8px] font-black uppercase">{data.currentRank.name}</p>
                <div className="w-full h-[3px] sm:h-1 rounded-full bg-[#2F4858] mt-0.5 overflow-hidden">
                  <div className="h-full rounded-full bg-[#DDB21D]" style={{ width: `${data.rankProgress * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
        {isDemo && (
          <div className="absolute bottom-1 right-2">
            <span className="text-[6px] text-white/20">Demo</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[2.1/1] overflow-hidden rounded-xl">
      <Image src={backgroundSrc} alt={skinName} layout="fill" objectFit="cover" />
      <div className="absolute inset-0 p-[4.5%] flex flex-col">
        {/* Header: username + discriminator */}
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-[#DDB21D] text-sm sm:text-lg md:text-xl font-black italic truncate">
            {data.username}
          </span>
          {data.discriminator && (
            <span className="text-[#BABABA] text-sm sm:text-lg md:text-xl font-black italic">
              {data.discriminator}
            </span>
          )}
        </div>

        <div className="flex gap-[3%] flex-1 min-h-0">
          {/* Column 1: Avatar + counters */}
          <div className="flex flex-col items-center gap-1.5 w-[20%]">
            <div className="w-full aspect-square rounded-full border-[3px] border-white/25 overflow-hidden bg-white/10 flex items-center justify-center shadow-lg">
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/50 text-2xl font-bold">{data.username[0]}</span>
              )}
            </div>
            <CounterPill icon="coin" value={fmt(data.coins)} />
            <CounterPill icon="gem" value={fmt(data.gems)} />
            <CounterPill icon="gift" value={fmt(data.gifts)} />
          </div>

          {/* Column 2: Profile + Achievements + Rank */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex gap-[6%] flex-1 min-h-0">
              {/* Profile section */}
              <div className="flex-1 min-w-0">
                <p className="text-[#DDB21D] text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wide">
                  Profile
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="text-[7px] sm:text-[8px] md:text-[9px] text-white font-bold bg-[#1473A2] rounded-full px-2 py-[2px] uppercase whitespace-nowrap"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements section */}
              <div className="w-[45%] shrink-0">
                <p className="text-[#DDB21D] text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wide">
                  Achievements
                </p>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-md flex items-center justify-center text-[8px] sm:text-[10px] font-bold ${
                        data.achievements.includes(i)
                          ? "bg-[#DDB21D]/20 text-[#DDB21D] border border-[#DDB21D]/30"
                          : "bg-white/5 text-white/20 border border-white/5"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rank section (bottom) */}
            <div className="mt-auto pt-2">
              {data.currentRank ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#DDB21D] text-xs sm:text-sm md:text-base font-black uppercase">
                      {data.currentRank.name}
                    </span>
                    <span className="text-white/80 text-[9px] sm:text-[10px] md:text-xs font-light">
                      {data.currentRank.range}
                    </span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 rounded-full bg-[#2F4858] mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#DDB21D] transition-all duration-700"
                      style={{ width: `${data.rankProgress * 100}%` }}
                    />
                  </div>
                  {data.nextRank && (
                    <p className="text-white/70 text-[8px] sm:text-[9px] md:text-[10px] italic mt-1">
                      NEXT RANK: {data.nextRank.name} {data.nextRank.range}
                    </p>
                  )}
                </>
              ) : (
                <span className="text-[#DDB21D] text-xs font-black uppercase">UNRANKED</span>
              )}
            </div>
          </div>
        </div>

        {isDemo && (
          <div className="absolute bottom-2 right-3">
            <span className="text-[8px] text-white/20 italic">Demo preview</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CounterPill({ icon, value }: { icon: "coin" | "gem" | "gift"; value: string }) {
  const colors = { coin: "#FFD700", gem: "#6C9BF2", gift: "#FF6B9D" };
  const icons = { coin: "C", gem: "G", gift: "F" };
  return (
    <div className="w-full flex items-center gap-1.5 bg-[#515B8D60] rounded-md px-2 py-1">
      <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: colors[icon] }}>
        {icons[icon]}
      </span>
      <span className="text-white text-[9px] sm:text-[10px] font-black">{value}</span>
    </div>
  );
}

function CounterPillCompact({ icon, value }: { icon: "coin" | "gem"; value: string }) {
  const colors = { coin: "#FFD700", gem: "#6C9BF2" };
  const icons = { coin: "C", gem: "G" };
  return (
    <div className="w-full flex items-center gap-1 bg-[#515B8D60] rounded-sm px-1 py-[1px]">
      <span className="text-[5px] sm:text-[6px] font-bold" style={{ color: colors[icon] }}>{icons[icon]}</span>
      <span className="text-white text-[5px] sm:text-[6px] font-black">{value}</span>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString();
}
