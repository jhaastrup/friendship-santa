import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface ChipInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxChips?: number;
}

export const ChipInput: React.FC<ChipInputProps> = ({ 
  label, 
  values, 
  onChange, 
  placeholder = "Type and press Enter...",
  maxChips = 5 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip();
    } else if (e.key === 'Backspace' && inputValue === '' && values.length > 0) {
      removeChip(values.length - 1);
    }
  };

  const addChip = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (values.includes(trimmed)) {
      setError('Interest already added');
      return;
    }

    if (values.length >= maxChips) {
      setError(`Maximum ${maxChips} interests allowed`);
      return;
    }

    onChange([...values, trimmed]);
    setInputValue('');
    setError('');
  };

  const removeChip = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
    setError('');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} <span className="text-slate-400 font-normal">({values.length}/{maxChips})</span>
      </label>
      <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-santa-red focus-within:border-santa-red transition-all">
        {values.map((chip, index) => (
          <span key={index} className="flex items-center gap-1 bg-red-50 text-santa-red px-2 py-1 rounded-full text-sm font-medium border border-red-100">
            {chip}
            <button
              type="button"
              onClick={() => removeChip(index)}
              className="hover:text-santa-darkRed focus:outline-none"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          onBlur={addChip}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm py-1"
          disabled={values.length >= maxChips}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};