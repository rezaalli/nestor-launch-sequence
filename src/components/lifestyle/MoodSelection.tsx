
import React from "react";

interface MoodSelectionProps {
  mood: string;
  setMood: (mood: string) => void;
}

const MoodSelection: React.FC<MoodSelectionProps> = ({ mood, setMood }) => {
  const moods = [
    { id: "very-bad", label: "Very Bad", icon: "face-sad-tear" },
    { id: "bad", label: "Bad", icon: "face-frown" },
    { id: "okay", label: "Okay", icon: "face-meh" },
    { id: "good", label: "Good", icon: "face-smile" },
    { id: "great", label: "Great", icon: "face-laugh-beam" }
  ];

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm font-medium text-nestor-gray-700 mb-8 text-center">
        How are you feeling today?
      </label>
      <div className="grid grid-cols-5 gap-3 w-full">
        {moods.map((moodOption) => (
          <button
            key={moodOption.id}
            className="flex flex-col items-center"
            onClick={() => setMood(moodOption.id)}
          >
            <div 
              className={`w-14 h-14 rounded-full bg-white border-2 flex items-center justify-center mb-1 
              ${mood === moodOption.id ? "border-nestor-blue" : "border-gray-200"}`}
            >
              <i 
                className={`fa-regular fa-${moodOption.icon} text-2xl 
                ${mood === moodOption.id ? "text-nestor-blue" : "text-gray-400"}`}
              ></i>
            </div>
            <span 
              className={`text-xs ${mood === moodOption.id ? "text-nestor-blue" : "text-gray-500"}`}
            >
              {moodOption.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelection;
