import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rich-editor-wrapper">
      <div className="editor-toolbar">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

export default RichTextEditor;

