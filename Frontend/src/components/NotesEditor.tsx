import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Clock, User, Users } from 'lucide-react';

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ value, onChange }) => {
  const [notes, setNotes] = useState(value);

useEffect(() => {
  setNotes(value);
}, [value]);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isShared, setIsShared] = useState(true);

  const handleSave = () => {
    setLastSaved(new Date());
    // In a real app, this would save to the backend
    console.log('Notes saved:', notes);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">Interview Notes</h3>
          <Badge variant={isShared ? "default" : "secondary"} className="text-xs">
            {isShared ? (
              <>
                <Users className="w-3 h-3 mr-1" />
                Shared
              </>
            ) : (
              <>
                <User className="w-3 h-3 mr-1" />
                Private
              </>
            )}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <textarea
          value={notes}
          onChange={handleChange}
          className="flex-1 w-full p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Take notes during the interview..."
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Auto-save enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesEditor;