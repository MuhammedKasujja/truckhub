import { ENGINE_MODES, LINE_ITEM_TYPES } from "./config"

export type LineItemType = (typeof LINE_ITEM_TYPES)[number]

export type EngineMode = (typeof ENGINE_MODES)[number]
