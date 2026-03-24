// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 8 -- Marketplace with mock listing
//          cards, buy/sell flow diagram, and fee explanation
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import PixelBadge from "@/components/pet/ui/PixelBadge"
import GoldDisplay from "@/components/pet/ui/GoldDisplay"
import CroppedItemImage from "@/components/pet/ui/CroppedItemImage"
import ItemGlow from "@/components/pet/ui/ItemGlow"
import { getItemImageUrl } from "@/utils/petAssets"
import { MOCK_MARKETPLACE_LISTINGS } from "../tutorialMockData"
import Link from "next/link"
import { ArrowRight, Tag, ShoppingCart, TrendingUp } from "lucide-react"

export default function StepMarketplace() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is the Marketplace?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
          The Marketplace is where players buy and sell items with each other.
          Think of it like an <strong className="text-[var(--pet-text,#e2e8f0)]">online store</strong>,
          except every item is listed by another real person. You set your own prices,
          browse what others are selling, and trade using gold.
        </p>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Live Listings</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Here&apos;s what marketplace listings look like. Each card shows the item, its rarity, the price, and who&apos;s selling it.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOCK_MARKETPLACE_LISTINGS.map((listing, i) => {
            const imgUrl = getItemImageUrl(listing.itemAssetPath, listing.itemCategory)
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <PixelCard className="p-3 h-full">
                  <div className="flex justify-center mb-2">
                    <ItemGlow rarity={listing.itemRarity}>
                      <div className="w-12 h-12">
                        {imgUrl ? (
                          <CroppedItemImage src={imgUrl} alt={listing.itemName} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                        )}
                      </div>
                    </ItemGlow>
                  </div>
                  <p className="font-pixel text-[10px] text-[var(--pet-text,#e2e8f0)] truncate text-center">{listing.itemName}</p>
                  <div className="flex justify-center mt-1">
                    <PixelBadge rarity={listing.itemRarity} />
                  </div>
                  <div className="flex justify-center mt-2">
                    <GoldDisplay amount={listing.price} size="sm" />
                  </div>
                  <p className="font-pixel text-[8px] text-[var(--pet-text-dim,#8899aa)] text-center mt-1">
                    by {listing.sellerName} · {listing.listedAt}
                  </p>
                </PixelCard>
              </motion.div>
            )
          })}
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">How It Works</h3>

        <div className="space-y-4">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <h4 className="font-pixel text-[11px] text-emerald-400">Selling</h4>
            </div>
            <div className="flex items-center gap-2 font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
              <span>You have an item</span>
              <span className="text-[var(--pet-text-dim,#8899aa)]">→</span>
              <span>Set a price</span>
              <span className="text-[var(--pet-text-dim,#8899aa)]">→</span>
              <span>List it</span>
              <span className="text-[var(--pet-text-dim,#8899aa)]">→</span>
              <span className="text-emerald-400">Get gold!</span>
            </div>
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded p-3">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <h4 className="font-pixel text-[11px] text-cyan-400">Buying</h4>
            </div>
            <div className="flex items-center gap-2 font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">
              <span>Browse listings</span>
              <span className="text-[var(--pet-text-dim,#8899aa)]">→</span>
              <span>Find what you want</span>
              <span className="text-[var(--pet-text-dim,#8899aa)]">→</span>
              <span>Buy it</span>
              <span className="text-[var(--pet-text-dim,#8899aa)]">→</span>
              <span className="text-cyan-400">Item is yours!</span>
            </div>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-4" corners>
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-[var(--pet-gold,#f0c040)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-pixel text-[12px] text-[var(--pet-text,#e2e8f0)] mb-1">Tips</h4>
            <ul className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed space-y-1">
              <li>• Check the Wiki for price history before listing</li>
              <li>• Rare items are worth more — don&apos;t undersell!</li>
              <li>• There&apos;s a small fee on each sale (the marketplace takes a cut)</li>
              <li>• You can cancel a listing anytime if it hasn&apos;t sold</li>
            </ul>
          </div>
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link
          href="/pet/marketplace"
          className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors"
        >
          Visit Marketplace
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
