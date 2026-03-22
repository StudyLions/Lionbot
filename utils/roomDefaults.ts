// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Comprehensive room theme defaults and variant config.
//          Mirrors the bot's fuzzy asset discovery so the website
//          renders the same layers Discord does.
// ============================================================

export interface RoomThemeConfig {
  defaults: Partial<Record<string, string>>
  variants: Partial<Record<string, string[]>>
}

const NUMBERED_VARIANTS = ['_1', '_2', '_3', '_4', '_5']

function numberedLayers(prefix: string, layers: string[]): RoomThemeConfig {
  const defaults: Record<string, string> = {}
  const variants: Record<string, string[]> = {}
  for (const layer of layers) {
    defaults[layer] = `${prefix}/${layer}_1.png`
    variants[layer] = NUMBERED_VARIANTS.map(v => `${layer}${v}`)
  }
  return { defaults, variants }
}

const THEMED_LAYERS = ['wall', 'floor', 'chair', 'bed', 'lamp']

export const ROOM_THEME_CONFIG: Record<string, RoomThemeConfig> = {
  'rooms/default': {
    defaults: {
      wall: 'rooms/default/wall_checker_blue.png',
      floor: 'rooms/default/floor_blue.png',
      mat: 'rooms/default/mat_blue.png',
      table: 'rooms/default/table_blue.png',
      chair: 'rooms/default/chair_blue.png',
      bed: 'rooms/default/bed_blueyellow.png',
      lamp: 'rooms/default/lamp_blue.png',
      picture: 'rooms/default/picture_blue.png',
      window: 'rooms/default/window_blue.png',
    },
    variants: {
      wall: [
        'wall_checker_blue', 'wall_checker_green', 'wall_checker_grey', 'wall_checker_pink', 'wall_checker_yellow',
        'walldots_blue', 'walldots_green', 'walldots_grey', 'walldots_pink', 'walldots_yellow',
        'wall_stripe_green', 'wall_stripe_grey', 'wall_stripe_light_blue', 'wall_stripe_pink', 'wall_stripe_yellow',
      ],
      floor: ['floor_blue', 'floor_brown', 'floor_green', 'floor_orange', 'floor_purple'],
      mat: ['mat_blue', 'mat_green', 'mat_red', 'mat_silver', 'mat_yellow'],
      table: ['table_blue', 'table_brown', 'table_green', 'table_pink', 'table_white'],
      chair: ['chair_blue', 'chair_brown', 'chair_green', 'chair_pink', 'chair_white'],
      bed: ['bed_blueyellow', 'bed_orange', 'bed_pinkpurple', 'bed_red', 'bed_redgreen'],
      lamp: ['lamp_blue', 'lamp_green', 'lamp_purple', 'lamp_red', 'lamp_yellow'],
      picture: ['picture_blue', 'picture_brown', 'picture_grey', 'picture_orange', 'picture_red'],
      window: ['window_blue', 'window_green', 'window_purple_pink', 'window_red_blue', 'window_yellow'],
    },
  },

  'rooms/castle': numberedLayers('rooms/castle', THEMED_LAYERS),
  'rooms/cave': numberedLayers('rooms/cave', THEMED_LAYERS),
  'rooms/library': numberedLayers('rooms/library', THEMED_LAYERS),
  'rooms/moon': numberedLayers('rooms/moon', THEMED_LAYERS),

  'rooms/futuristic': {
    defaults: {
      wall: 'rooms/futuristic/wall.png',
      floor: 'rooms/futuristic/floor.png',
      chair: 'rooms/futuristic/chair.png',
      bed: 'rooms/futuristic/bed.png',
      lamp: 'rooms/futuristic/lamp.png',
    },
    variants: {},
  },
}

export function getRoomDefaults(roomPrefix: string): Record<string, string> {
  return { ...(ROOM_THEME_CONFIG[roomPrefix]?.defaults ?? {}) }
}

export function getRoomVariants(roomPrefix: string, layer: string): string[] {
  return ROOM_THEME_CONFIG[roomPrefix]?.variants[layer] ?? []
}
