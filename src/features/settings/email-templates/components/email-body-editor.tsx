import { useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Color } from "@tiptap/extension-color"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Placeholder } from "@tiptap/extension-placeholder"
import type { Content, Editor, JSONContent } from "@tiptap/react"
import { Link, RichTextEditor } from "@/components/editor"
import { cn } from "@/lib/utils"

import "@/components/editor/style.css"

export type EmailBodyChange = {
  html: string
  json: JSONContent
  isEmpty: boolean
}

type Props = {
  /** Read once, when the editor is created. Remount (change `key`) to load other content. */
  content: Content
  onChange: (change: EmailBodyChange) => void
  /** Gives the parent the editor, e.g. to insert a variable at the cursor */
  onReady?: (editor: Editor) => void
  editable?: boolean
  placeholder?: string
  /** Extra toolbar controls, e.g. the variable picker */
  toolbarExtra?: React.ReactNode
  className?: string
}

/**
 * The rich-text editor for an email body, limited to formatting that email
 * clients render reliably (no code blocks, tables, embeds or images).
 */
export function EmailBodyEditor({
  content,
  onChange,
  onReady,
  editable = true,
  placeholder = "Write the email…",
  toolbarExtra,
  className,
}: Props) {
  const editor = useEditor({
    content,
    editable,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        link: false, // replaced by the editor's Link (Mod-k opens the link dialog)
      }),
      Link,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onCreate: ({ editor: created }) => onReady?.(created),
    onUpdate: ({ editor: current }) =>
      onChange({
        html: current.getHTML(),
        json: current.getJSON(),
        isEmpty: current.isEmpty,
      }),
  })

  return (
    <RichTextEditor
      editor={editor}
      editable={editable}
      className={cn("min-w-0", className)}
    >
      {editable && (
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
          {toolbarExtra}
        </RichTextEditor.Toolbar>
      )}
      <RichTextEditor.BubbleMenu editor={editor} />
      <RichTextEditor.Content className="min-h-64 px-2" />
    </RichTextEditor>
  )
}
