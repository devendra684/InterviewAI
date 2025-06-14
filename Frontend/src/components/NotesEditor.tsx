
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Clock, User, Users } from 'lucide-react';

const NotesEditor = () => {
  const [notes, setNotes] = useState(
    "# Interview Notes\n\n## Candidate: John Doe\n\n### Technical Skills\n- JavaScript: Strong\n- React: Good understanding\n- Problem-solving: Excellent\n\n### Communication\n- Clear explanations\n- Asks good questions\n- Collaborative approach\n\n### Areas to Explore\n- [ ] System design experience\n- [ ] Testing methodologies\n- [ ] Performance optimization\n\n### Next Steps\n- Schedule follow-up\n- Technical deep-dive session"
  );
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isShared, setIsShared] = useState(true);

  const handleSave = () => {
    setLastSaved(new Date());
    // In a real app, this would save to the backend
    console.log('Notes saved:', notes);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
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

      {/* Quick Actions */}
      <div className="mt-3 space-y-2">
        <Separator />
        <div className="text-xs font-medium text-gray-600 mb-2">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs h-8">
            Add Timestamp
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            Add Rating
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            Mark Question
          </Button>
          <Button variant="outline" size="sm" className="text-xs h-8">
            Add Action Item
          </Button>
        </div>
      </div>

      {/* Collaboration Indicator */}
      {isShared && (
        <Card className="mt-3">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs">
                <p className="font-medium">Alex Smith is also viewing</p>
                <p className="text-gray-500">Last active: 2 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotesEditor;