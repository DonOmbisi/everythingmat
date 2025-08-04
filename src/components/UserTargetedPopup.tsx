import React from 'react';

interface UserTargetedPopupProps {
  open: boolean;
  onSelect: (choice: string) => void;
  onClose: () => void;
}

const options = [
  { label: 'Are you expecting?', value: 'expecting' },
  { label: 'Just gave birth?', value: 'postpartum' },
  { label: 'Not pregnant', value: 'not_pregnant' },
];

const UserTargetedPopup: React.FC<UserTargetedPopupProps> = ({ open, onSelect, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-serif mb-6 text-gray-900">Let us personalize your experience</h2>
        <div className="space-y-4">
          {options.map(opt => (
            <button
              key={opt.value}
              className="w-full py-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/10 text-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserTargetedPopup; 