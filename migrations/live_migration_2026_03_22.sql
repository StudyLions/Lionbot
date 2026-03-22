-- ============================================================
-- AI-GENERATED FILE
-- Created: 2026-03-22
-- Purpose: Migrate studylion (live) DB to match studylion_test
--          Adds: sticky_messages, ambient_sounds_config,
--          sounds_bot_heartbeat, and all social feature tables
-- ============================================================

-- ===================== ENUMS (must run outside transaction) =====================

DO $$ BEGIN
    CREATE TYPE lg_family_role AS ENUM ('LEADER', 'ADMIN', 'MODERATOR', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TYPE lggoldtransactiontype ADD VALUE IF NOT EXISTS 'GIFT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

BEGIN;

-- ===================== STICKY MESSAGES =====================

CREATE TABLE IF NOT EXISTS sticky_messages(
    stickyid SERIAL PRIMARY KEY,
    guildid BIGINT NOT NULL REFERENCES guild_config(guildid) ON DELETE CASCADE,
    channelid BIGINT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    color INTEGER DEFAULT 3447003,
    image_url TEXT,
    footer_text TEXT,
    interval_seconds INTEGER NOT NULL DEFAULT 60,
    last_posted_id BIGINT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guildid, channelid)
);

-- ===================== AMBIENT SOUNDS =====================

CREATE TABLE IF NOT EXISTS ambient_sounds_config (
    guildid BIGINT NOT NULL,
    bot_number SMALLINT NOT NULL,
    sound_type VARCHAR(20),
    channelid BIGINT,
    volume SMALLINT DEFAULT 50,
    enabled BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'pending',
    error_msg TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (guildid, bot_number)
);

CREATE TABLE IF NOT EXISTS sounds_bot_heartbeat (
    bot_number SMALLINT PRIMARY KEY,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== FRIENDS =====================

CREATE TABLE IF NOT EXISTS lg_friends (
    userid1 BIGINT NOT NULL REFERENCES user_config(userid),
    userid2 BIGINT NOT NULL REFERENCES user_config(userid),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (userid1, userid2),
    CONSTRAINT lg_friends_ordered CHECK (userid1 < userid2)
);

CREATE TABLE IF NOT EXISTS lg_friend_requests (
    request_id SERIAL PRIMARY KEY,
    from_userid BIGINT NOT NULL REFERENCES user_config(userid),
    to_userid BIGINT NOT NULL REFERENCES user_config(userid),
    status VARCHAR(16) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (from_userid, to_userid)
);

CREATE TABLE IF NOT EXISTS lg_friend_interactions (
    interaction_id SERIAL PRIMARY KEY,
    actor_userid BIGINT NOT NULL REFERENCES user_config(userid),
    target_userid BIGINT NOT NULL REFERENCES user_config(userid),
    interaction_type VARCHAR(16) NOT NULL,
    plot_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_daily
    ON lg_friend_interactions (actor_userid, target_userid, interaction_type, created_at);

CREATE TABLE IF NOT EXISTS lg_blocks (
    blocker_userid BIGINT NOT NULL REFERENCES user_config(userid),
    blocked_userid BIGINT NOT NULL REFERENCES user_config(userid),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_userid, blocked_userid)
);

-- ===================== FAMILIES =====================

CREATE TABLE IF NOT EXISTS lg_families (
    family_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    icon_url VARCHAR(256),
    level INT DEFAULT 1,
    xp BIGINT DEFAULT 0,
    gold BIGINT DEFAULT 0,
    leader_userid BIGINT NOT NULL REFERENCES user_config(userid),
    max_members INT DEFAULT 10,
    max_farms INT DEFAULT 1,
    daily_gold_withdraw_cap INT DEFAULT 10000,
    role_permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lg_family_members (
    family_id INT NOT NULL REFERENCES lg_families(family_id) ON DELETE CASCADE,
    userid BIGINT NOT NULL REFERENCES user_config(userid),
    role lg_family_role DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    contribution_xp BIGINT DEFAULT 0,
    left_at TIMESTAMPTZ,
    PRIMARY KEY (family_id, userid)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_one_per_user
    ON lg_family_members (userid) WHERE left_at IS NULL;

CREATE TABLE IF NOT EXISTS lg_family_invites (
    invite_id SERIAL PRIMARY KEY,
    family_id INT NOT NULL REFERENCES lg_families(family_id) ON DELETE CASCADE,
    from_userid BIGINT NOT NULL REFERENCES user_config(userid),
    to_userid BIGINT NOT NULL REFERENCES user_config(userid),
    status VARCHAR(16) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (family_id, to_userid)
);

CREATE TABLE IF NOT EXISTS lg_family_bank (
    bank_entry_id SERIAL PRIMARY KEY,
    family_id INT NOT NULL REFERENCES lg_families(family_id) ON DELETE CASCADE,
    itemid INT NOT NULL REFERENCES lg_items(itemid),
    enhancement_level INT DEFAULT 0,
    quantity INT DEFAULT 1,
    scroll_data JSONB,
    total_bonus FLOAT DEFAULT 0,
    deposited_by BIGINT NOT NULL REFERENCES user_config(userid),
    deposited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lg_family_gold_log (
    log_id SERIAL PRIMARY KEY,
    family_id INT NOT NULL REFERENCES lg_families(family_id) ON DELETE CASCADE,
    userid BIGINT NOT NULL REFERENCES user_config(userid),
    amount INT NOT NULL,
    action VARCHAR(32) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lg_family_farms (
    family_id INT NOT NULL REFERENCES lg_families(family_id) ON DELETE CASCADE,
    farm_index INT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (family_id, farm_index)
);

CREATE TABLE IF NOT EXISTS lg_family_farm_plots (
    family_id INT NOT NULL,
    farm_index INT NOT NULL,
    plot_id INT NOT NULL,
    seed_id INT REFERENCES lg_farm_seeds(seed_id),
    planted_at TIMESTAMPTZ,
    planted_by BIGINT REFERENCES user_config(userid),
    last_watered TIMESTAMPTZ,
    growth_stage INT DEFAULT 0,
    growth_points FLOAT DEFAULT 0,
    gold_invested INT DEFAULT 0,
    dead BOOLEAN DEFAULT false,
    rarity VARCHAR(16) DEFAULT 'COMMON',
    PRIMARY KEY (family_id, farm_index, plot_id),
    FOREIGN KEY (family_id, farm_index) REFERENCES lg_family_farms(family_id, farm_index) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lg_family_gold_withdrawals (
    withdrawal_id SERIAL PRIMARY KEY,
    family_id INT NOT NULL REFERENCES lg_families(family_id) ON DELETE CASCADE,
    userid BIGINT NOT NULL REFERENCES user_config(userid),
    amount INT NOT NULL,
    withdrawn_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_family_gold_withdrawals_daily
    ON lg_family_gold_withdrawals (family_id, userid, withdrawn_at);

COMMIT;
