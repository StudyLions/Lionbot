-- AI-GENERATED FILE
-- Created: 2026-04-24
-- Purpose: Add a parallel "cosmetic" equipment layer to the LionGotchi system
--          so users can show one item visually while wearing a different item
--          for stats — like MapleStory NX cash items.
--
--          The new lg_pet_cosmetics table mirrors lg_pet_equipment in shape,
--          but is read ONLY by the renderer (overlay on top of equipment).
--          It is NEVER read by the stats engine — bonuses continue to come
--          exclusively from lg_pet_equipment + lg_user_inventory + lg_enhancement_slots.
--
--          A per-pet cosmetics_enabled toggle on lg_pets lets a user quickly
--          hide all cosmetics (revert to "true equipment view") without
--          wiping their cosmetic picks.
--
--          Safe, additive migration — uses IF NOT EXISTS so it can be
--          re-applied on both studylion_test (staging) and studylion
--          (production) without side effects. The new table starts empty,
--          so every existing pet's render is byte-for-byte identical until
--          the user opts in. ZERO migration of existing equipped users
--          required.

CREATE TABLE IF NOT EXISTS lg_pet_cosmetics (
    userid BIGINT          NOT NULL,
    slot   lgequipmentslot NOT NULL,
    itemid INTEGER         NOT NULL REFERENCES lg_items(itemid),
    set_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (userid, slot),
    FOREIGN KEY (userid) REFERENCES lg_pets(userid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lg_pet_cosmetics_user
    ON lg_pet_cosmetics (userid);

-- Per-pet master toggle. Default TRUE so once a user sets a cosmetic it
-- just works without an extra step. Setting it to FALSE makes the renderer
-- ignore lg_pet_cosmetics rows entirely (without deleting them).
ALTER TABLE lg_pets
    ADD COLUMN IF NOT EXISTS cosmetics_enabled BOOLEAN NOT NULL DEFAULT TRUE;
