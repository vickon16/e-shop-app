import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import React, { useEffect, useRef } from 'react';

import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

export const RichTextEditor = (props: {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  classNames?: {
    content?: string;
  };
}) => {
  const { value, onChange, className, placeholder, classNames } = props;
  const [editorValue, setEditorValue] = React.useState(value || '');
  const quillRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!quillRef.current) {
      quillRef.current = true; // Mark as mounted

      // Ensure only one toolbar is present
      setTimeout(() => {
        document.querySelectorAll('.ql-toolbar').forEach((toolbar, index) => {
          if (index > 0) {
            toolbar.remove(); // Remove duplicate toolbars
          }
        });
      }, 100); // Short delay to ensure quill is fully initialized
    }
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* NO duplicate quill instance */}
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content: string) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }], // font picker
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // header levels
            [{ size: ['small', false, 'large', 'huge'] }], // custom sizes
            ['bold', 'italic', 'underline', 'strike'], // basic text styles
            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
            [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
            [{ list: 'ordered' }, { list: 'bullet' }], // Lists
            [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
            [{ align: [] }], // text align
            ['blockquote', 'code-block'], // blocks
            ['link', 'image', 'video'], // media
            ['clean'],
          ],
        }}
        formats={[
          'header',
          'bold',
          'italic',
          'underline',
          'strike',
          'blockquote',
          'list',
          'bullet',
          'link',
          'image',
        ]}
        placeholder={placeholder || 'Compose an epic...'}
        className={cn(
          'min-h-[150px] bg-transparent border border-gray-700 text-white rounded-md ',
          classNames?.content,
        )}
      />

      <style>
        {`
          .ql-toolbar {
            background: transparent;
            border-color: #444;
          }
          .ql-container {
            background: transparent;
            border-color: #444;
            color: white;
          }
          .ql-picker {
            color: white!important;
          }
          .ql-editor {
            min-height: 150px;
          }
          .ql-snow {
            border-color: #444!important;
          }
          .ql-editor.ql-blank::before {
            color: #aaa !important;
          }
          .ql-picker-options {
            background: #333 !important;
            color: white !important;
          }
          .ql-picker-item {
            color: white !important;
          }
          .ql-stroke {
            stroke: white !important;
          }
        `}
      </style>
    </div>
  );
};
