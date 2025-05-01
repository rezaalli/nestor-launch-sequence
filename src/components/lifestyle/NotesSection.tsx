
import React from "react";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="w-full flex flex-col items-center min-h-[400px] justify-center">
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium text-nestor-gray-700 mb-8 text-center">
          Additional Notes
        </label>
        <textarea
          rows={4}
          className="w-full p-4 text-nestor-gray-900 bg-white border border-gray-200 rounded-xl resize-none"
          placeholder="Add any comments about your day..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export default NotesSection;
