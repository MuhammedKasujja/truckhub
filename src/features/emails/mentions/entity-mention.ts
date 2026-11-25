import { Mention } from "@tiptap/extension-mention"
import { ReactRenderer } from "@tiptap/react"
import { PluginKey } from "@tiptap/pm/state"
import {
  MENTION_REGISTRY,
  MENTION_TYPES,
  resolveMentionField,
  searchMentions,
} from "./registry"
import { MentionList } from "./mention-list"
import type { MentionOptions } from "@tiptap/extension-mention"
import type { EditorState } from "@tiptap/pm/state"
import type { Node as PMNode } from "@tiptap/pm/model"
import type { Editor, Range } from "@tiptap/core"
import type { QueryClient } from "@tanstack/react-query"
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from "@tiptap/suggestion"
import type { MentionHit, MentionType } from "./registry"
import type { MentionListHandle } from "./mention-list"

export const ENTITY_MENTION = "entityMention"

export type EntityMentionAttrs = {
  entityType: MentionType
  id: string
  display: string
  /** The chosen field, e.g. "total"; null when the record itself is referenced */
  path: string | null
  /** The field's value, filled in on the frontend */
  value: string | null
  fieldLabel: string | null
}

/** One row of the popup. */
export type MentionItem =
  | { kind: "type"; type: MentionType }
  | { kind: "record"; hit: MentionHit }
  | { kind: "reference"; hit: MentionHit }
  | { kind: "field"; hit: MentionHit; path: string; label: string }

/** What a chosen row inserts; `replaceFrom` widens the range (the `.` trigger replaces its chip). */
export type MentionSelection =
  | { kind: "insert"; attrs: EntityMentionAttrs; replaceFrom?: number }
  | { kind: "type"; type: MentionType }

const typeItems = (): MentionItem[] => MENTION_TYPES.map((type) => ({ kind: "type", type }))

export const fieldItems = (hit: MentionHit, filter = ""): MentionItem[] =>
  MENTION_REGISTRY[hit.type].fields
    .filter((f) => f.path.startsWith(filter.toLowerCase()) || f.label.toLowerCase().includes(filter.toLowerCase()))
    .map((f) => ({ kind: "field", hit, path: f.path, label: f.label }))

/** `INV-0042.tot` -> the record's fields, if `INV-0042` names exactly one record. */
async function itemsForQuery(query: string): Promise<MentionItem[]> {
  if (!query.trim()) return typeItems()

  const dotted = /^(.*\S)\.([\w.]*)$/s.exec(query)
  if (dotted) {
    const [, ref, filter] = dotted
    const hits = await searchMentions(ref)
    const exact = hits.filter((h) => h.display.toLowerCase() === ref.trim().toLowerCase())
    if (exact.length === 1) return fieldItems(exact[0], filter)
  }

  const hits = await searchMentions(query)
  return hits.map((hit) => ({ kind: "record", hit }))
}

/** The reference chip just before a `.` at `dotPos` (allowing one space after the chip). */
function chipBeforeDot(state: EditorState, dotPos: number): { node: PMNode; pos: number } | null {
  let pos = dotPos
  let before = state.doc.resolve(pos).nodeBefore
  if (before?.isText && before.text === " ") {
    pos -= 1
    before = state.doc.resolve(pos).nodeBefore
  }
  if (before?.type.name !== ENTITY_MENTION || before.attrs.path) return null
  return { node: before, pos: pos - before.nodeSize }
}

function insertMention(editor: Editor, range: Range, selection: MentionSelection) {
  if (selection.kind === "type") {
    // `@inv` -> `@invoice `, which keeps the suggestion open, now searching invoices only
    const alias = MENTION_REGISTRY[selection.type].aliases[0]
    editor.chain().focus().insertContentAt(range, `@${alias} `).run()
    return
  }
  editor
    .chain()
    .focus()
    .insertContentAt({ from: selection.replaceFrom ?? range.from, to: range.to }, [
      { type: ENTITY_MENTION, attrs: selection.attrs },
      { type: "text", text: " " },
    ])
    .run()
}

function popupRenderer(queryClient: QueryClient): SuggestionOptions<MentionItem, MentionSelection>["render"] {
  return () => {
    let component: ReactRenderer<MentionListHandle> | null = null
    let unmount: (() => void) | null = null

    return {
      onStart: (props: SuggestionProps<MentionItem, MentionSelection>) => {
        component = new ReactRenderer(MentionList, {
          props: { ...props, queryClient },
          editor: props.editor,
        })
        unmount = props.mount(component.element)
      },
      onUpdate: (props: SuggestionProps<MentionItem, MentionSelection>) => {
        component?.updateProps({ ...props, queryClient })
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === "Escape") return false
        return component?.ref?.onKeyDown(props) ?? false
      },
      onExit: () => {
        unmount?.()
        component?.destroy()
        component = null
      },
    }
  }
}

type Options = {
  queryClient: QueryClient
  /** Where the popup is mounted, so it stays clickable inside a modal dialog */
  container?: string
}

/**
 * `@` searches records (invoice, quotation, trip, client, driver, vehicle, user) by
 * number or name and inserts a chip. Picking a field — from the menu, by typing
 * `@INV-0042.total`, or by typing `.` right after a chip — inserts that field's value.
 * Values are worked out here, in the browser; the sent HTML holds plain text only.
 */
export function createEntityMention({ queryClient, container }: Options) {
  return Mention.extend({
    name: ENTITY_MENTION,

    addAttributes() {
      return {
        id: { default: null },
        entityType: { default: null },
        display: { default: null },
        path: { default: null },
        value: { default: null },
        fieldLabel: { default: null },
      }
    },
  }).configure({
    deleteTriggerWithBackspace: true,
    renderText: ({ node }) => node.attrs.value ?? node.attrs.display ?? "",
    renderHTML: ({ node }) => {
      const a = node.attrs as EntityMentionAttrs
      const label = MENTION_REGISTRY[a.entityType].label
      return [
        "span",
        {
          "data-type": ENTITY_MENTION,
          class: "rounded bg-primary/10 px-1 py-0.5 font-medium text-primary",
          title: a.path ? `${label} ${a.display} · ${a.fieldLabel ?? a.path}` : `${label} ${a.display}`,
        },
        a.value ?? a.display,
      ]
    },
    suggestions: [
      {
        char: "@",
        pluginKey: new PluginKey("entityMention"),
        allowSpaces: true,
        debounce: 200,
        container,
        items: ({ query }) => itemsForQuery(query),
        command: ({ editor, range, props }) => insertMention(editor, range, props),
        render: popupRenderer(queryClient),
      },
      {
        // `.` straight after a reference chip: pick one of that record's fields
        char: ".",
        pluginKey: new PluginKey("entityMentionField"),
        allowedPrefixes: null,
        container,
        allow: ({ state, range }) => chipBeforeDot(state, range.from) !== null,
        items: ({ query, editor }) => {
          const dotPos = editor.state.selection.from - query.length - 1
          const chip = chipBeforeDot(editor.state, dotPos)
          if (!chip) return []
          const a = chip.node.attrs as EntityMentionAttrs
          return fieldItems({ type: a.entityType, id: a.id, display: a.display }, query)
        },
        command: ({ editor, range, props }) => {
          const chip = chipBeforeDot(editor.state, range.from)
          if (props.kind === "insert" && chip) {
            insertMention(editor, range, { ...props, replaceFrom: chip.pos })
          }
        },
        render: popupRenderer(queryClient),
      },
    ] satisfies Omit<SuggestionOptions<MentionItem, MentionSelection>, "editor">[] as unknown as MentionOptions["suggestions"],
  })
}

/** Builds the attributes for a chosen row, fetching the field value if there is one. */
export async function selectionFor(
  queryClient: QueryClient,
  item: Exclude<MentionItem, { kind: "type" } | { kind: "record" }>
): Promise<MentionSelection> {
  const base = { entityType: item.hit.type, id: item.hit.id, display: item.hit.display }
  if (item.kind === "reference") {
    return { kind: "insert", attrs: { ...base, path: null, value: null, fieldLabel: null } }
  }
  const value = await resolveMentionField(queryClient, item.hit.type, item.hit.id, item.path)
  return { kind: "insert", attrs: { ...base, path: item.path, value, fieldLabel: item.label } }
}

/** Re-reads every field chip so the email carries current values (e.g. a balance paid since). */
export async function refreshMentions(editor: Editor, queryClient: QueryClient): Promise<void> {
  const chips: { pos: number; attrs: EntityMentionAttrs }[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === ENTITY_MENTION && node.attrs.path) {
      chips.push({ pos, attrs: node.attrs as EntityMentionAttrs })
    }
  })
  if (!chips.length) return

  const values = await Promise.all(
    chips.map(({ attrs }) =>
      resolveMentionField(queryClient, attrs.entityType, attrs.id, attrs.path!).catch(() => attrs.value ?? "")
    )
  )
  const tr = editor.state.tr
  chips.forEach(({ pos, attrs }, i) => {
    if (values[i] !== attrs.value) tr.setNodeMarkup(pos, undefined, { ...attrs, value: values[i] })
  })
  if (tr.docChanged) editor.view.dispatch(tr)
}
