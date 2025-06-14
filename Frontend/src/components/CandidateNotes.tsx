import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";

interface CandidateNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const CandidateNotes = ({ notes, onNotesChange }: CandidateNotesProps) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleSave = () => {
    // In a real application, you would send these notes to the backend
    console.log("Notes saved:", localNotes);
    onNotesChange(localNotes);
    // You might want to show a toast notification here
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Personal Notes</h2>
        <Button size="sm" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
      <Textarea
        placeholder="Take notes here..."
        className="flex-1 font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
      />
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center space-x-1">
          <span className={`h-2 w-2 rounded-full ${autoSaveEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          <span>Auto-save enabled</span>
        </p>
        <h3 className="font-semibold mt-4">Tips:</h3>
        <ul className="list-disc list-inside text-gray-600">
          <li>Use notes to brainstorm your approach</li>
          <li>Write down edge cases to test</li>
          <li>Track your debugging process</li>
        </ul>
      </div>
    </div>
  );
};

export default CandidateNotes; 