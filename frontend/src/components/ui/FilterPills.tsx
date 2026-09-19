import React from 'react';
import { X } from 'lucide-react';

export interface FilterPillOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  options: FilterPillOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

const FilterPills: React.FC<FilterPillsProps> = ({
  options,
  selected,
  onChange,
  multiSelect = false,
  className = '',
}) => {
  const handleToggle = (key: string) => {
    if (multiSelect) {
      if (selected.includes(key)) {
        onChange(selected.filter((s) => s !== key));
      } else {
        onChange([...selected, key]);
      }
    } else {
      if (selected.includes(key)) {
        onChange([]);
      } else {
        onChange([key]);
      }
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const hasSelection = selected.length > 0;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.key);
        return (
          <button
            key={option.key}
            onClick={() => handleToggle(option.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}

      {hasSelection && (
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
};

export default FilterPills;
