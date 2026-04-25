// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: A horizontal trust band placed before the FAQ. Single
//          row of 4 confidence signals: Stripe / cancel anytime /
//          live support / active subscriber count. Removes the
//          last "but is this safe?" objection before they buy.
// ============================================================
import { Lock, MessageCircle, RefreshCcw, ShieldCheck } from "lucide-react";

interface TrustBandProps {
  activeSubscribers?: number;
}

export default function TrustBand({ activeSubscribers }: TrustBandProps = {}) {
  const items = [
    {
      icon: ShieldCheck,
      label: "Powered by Stripe",
      sub: "256-bit secure payments",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: RefreshCcw,
      label: "Cancel anytime",
      sub: "Manage from your dashboard",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: MessageCircle,
      label: "Live support on Discord",
      sub: "Real humans, fast replies",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Lock,
      label: activeSubscribers
        ? `${activeSubscribers.toLocaleString()}+ active subscribers`
        : "Trusted by thousands",
      sub: "Active LionHeart members",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <section className="relative py-10 lg:py-14">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-5 lg:p-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`inline-flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-xl ${item.bg} ${item.color} flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm lg:text-[15px] font-bold text-foreground leading-tight">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
