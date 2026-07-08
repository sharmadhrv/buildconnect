import React, { useState, useEffect, useRef, ReactNode } from 'react';

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (value: string | number) => void;
}

interface DropdownProps {
  trigger: ReactNode;
  options: DropdownOption[];
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  options,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;
    if (option.onClick) {
      option.onClick(option.value);
    }
    setIsOpen(false);
  };

  const alignmentClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl z-40 p-1.5 focus:outline-none transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${alignmentClasses[align]}`}
        >
          <div className="flex flex-col gap-0.5">
            {options.map((option, idx) => (
              <button
                key={option.value || idx}
                disabled={option.disabled}
                onClick={() => handleOptionClick(option)}
                className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-left transition-all duration-150 ${
                  option.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {option.icon && <span className="flex-shrink-0 text-slate-400">{option.icon}</span>}
                <span className="flex-1 truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
