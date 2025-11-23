import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <input
        className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-santa-red focus:border-santa-red outline-none transition-all ${
          error ? 'border-red-500' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <textarea
        className={`w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-santa-red focus:border-santa-red outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
};