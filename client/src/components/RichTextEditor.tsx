import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your content...",
  height = 400
}: RichTextEditorProps) {
  const [editorValue, setEditorValue] = useState(value);

  const handleChange = (val?: string) => {
    const newValue = val || '';
    setEditorValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full" data-color-mode="light">
      <MDEditor
        value={editorValue}
        onChange={handleChange}
        height={height}
        data-color-mode="light"
        preview="edit"
        hideToolbar={false}
        toolbarHeight={50}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          },
        }}
        previewOptions={{
          rehypePlugins: [],
        }}
      />
      
      <div className="mt-2 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <span><strong>Bold:</strong> **text** or Ctrl+B</span>
          <span><strong>Italic:</strong> *text* or Ctrl+I</span>
          <span><strong>Heading:</strong> # H1, ## H2, ### H3</span>
          <span><strong>Link:</strong> [text](url)</span>
          <span><strong>List:</strong> - item or 1. item</span>
        </div>
      </div>
    </div>
  );
}