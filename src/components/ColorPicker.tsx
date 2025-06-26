import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-sm font-medium text-neutral-300 min-w-[120px]">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-white/20 cursor-pointer bg-transparent"
          style={{ 
            backgroundColor: value,
            borderColor: value === '#ffffff' ? '#404040' : 'rgba(255, 255, 255, 0.2)'
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 liquid-glass border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 backdrop-blur-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

export default ColorPicker; 