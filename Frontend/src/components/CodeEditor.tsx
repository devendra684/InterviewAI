
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ value, language, onChange }: CodeEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = editorRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' +value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="h-full relative">
      <textarea
        ref={editorRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none bg-gray-50 leading-6"
        placeholder="Start coding here..."
        style={{ 
          minHeight: '100%',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          tabSize: 2
        }}
      />
      
      {/* Line numbers simulation */}
      <div className="absolute left-0 top-0 p-4 pointer-events-none text-gray-400 font-mono text-sm leading-6">
        {value.split('\n').map((_, index) => (
          <div key={index} className="h-6 flex items-center">
            {index + 1}
          </div>
        ))}
      </div>
      
      {/* Syntax highlighting overlay would go here in a real implementation */}
      <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs text-gray-500 border">
        {language}
      </div>
    </div>
  );
};

export default CodeEditor;