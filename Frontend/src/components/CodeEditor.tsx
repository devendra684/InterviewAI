import React from 'react';

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, language, onChange }) => {
  return (
    <textarea
      className="w-full h-full font-mono text-sm border-none outline-none resize-none p-4"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck="false"
      // In a real application, you would integrate a proper code editor like Monaco Editor here.
      // For now, this textarea acts as a placeholder.
    />
  );
};

export default CodeEditor;