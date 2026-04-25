// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-24
// Purpose: Mobile-only horizontal snap-scroll carousel for the
//          subscription tier cards. On screens < md the tiers stack
//          vertically by default which buries the "Most Popular" cue
//          (LionHeart+) between two other cards. The carousel keeps
//          LionHeart+ centered on first paint with a small dot
//          indicator so mobile users see the recommended tier first
//          and can swipe between options like a real product picker.
// ============================================================
import { useEffect, useRef, useState } from "react";

interface TierCarouselProps {
  children: React.ReactNode[];
  centerIndex?: number;
  ariaLabel?: string;
}

export default function TierCarousel({
  children,
  centerIndex = 1,
  ariaLabel = "Subscription tiers",
}: TierCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(centerIndex);

  useEffect(() => {
    const target = slideRefs.current[centerIndex];
    if (target && scrollerRef.current) {
      const targetLeft = target.offsetLeft;
      const scrollerWidth = scrollerRef.current.clientWidth;
      const targetWidth = target.clientWidth;
      const center = targetLeft - (scrollerWidth - targetWidth) / 2;
      scrollerRef.current.scrollTo({ left: center, behavior: "auto" });
    }
  }, [centerIndex]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => {
      const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
      let closest = 0;
      let closestDelta = Infinity;
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const elCenter = el.offsetLeft + el.clientWidth / 2;
        const delta = Math.abs(elCenter - scrollerCenter);
        if (delta < closestDelta) {
          closestDelta = delta;
          closest = i;
        }
      });
      setActiveIndex(closest);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [children.length]);

  const goTo = (i: number) => {
    const target = slideRefs.current[i];
    if (target && scrollerRef.current) {
      const targetLeft = target.offsetLeft;
      const scrollerWidth = scrollerRef.current.clientWidth;
      const targetWidth = target.clientWidth;
      const center = targetLeft - (scrollerWidth - targetWidth) / 2;
      scrollerRef.current.scrollTo({ left: center, behavior: "smooth" });
    }
  };

  return (
    <div className="relative" aria-label={ariaLabel}>
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2"
        style={{ scrollBehavior: "smooth", scrollSnapType: "x mandatory" }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="snap-center flex-shrink-0 w-[85%] sm:w-[60%]"
          >
            {child}
          </div>
        ))}
      </div>

      <div
        className="flex justify-center gap-1.5 mt-4"
        role="tablist"
        aria-label="Tier indicator"
      >
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Show tier ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-6 bg-pink-500"
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
