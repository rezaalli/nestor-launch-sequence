
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-nestor-gray-700 mb-8 text-center">
        Additional Notes
      </label>
      <Textarea
        rows={4}
        className="w-full p-4 text-nestor-gray-900 bg-white border border-gray-200 rounded-xl resize-none"
        placeholder="Add any comments about your day..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};

export default NotesSection;
