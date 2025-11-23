import React, { useState } from 'react';
import { Friend, GroupData } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Gift, Lock } from 'lucide-react';

interface GuestLoginProps {
  groupData: GroupData;
  onLogin: (friend: Friend) => void;
}

export const GuestLogin: React.FC<GuestLoginProps> = ({ groupData, onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().toLowerCase();
    
    if (!cleanName) {
      setError('Please enter your name');
      return;
    }

    // Find friend case-insensitive
    const friend = groupData.friends.find(f => f.name.toLowerCase() === cleanName);

    if (friend) {
      onLogin(friend);
    } else {
      setError('Name not found in the guest list. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-fade-in pt-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-santa-red rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-200">
          <Gift className="text-white w-10 h-10" />
        </div>
        <h2 className="font-display text-4xl text-santa-red">Secret Santa Reveal</h2>
        <div className="bg-white inline-block px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">Group</p>
          <p className="font-bold text-slate-800 text-lg">{groupData.name}</p>
        </div>
        <p className="text-slate-600">
          Enter your name below to unlock your secret match.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Who are you?
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-santa-red focus:border-santa-red outline-none transition-all ${
                  error ? 'border-red-500' : 'border-slate-200'
                }`}
                placeholder="Enter your name..."
              />
              <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full">
            Unlock My Match
          </Button>
        </form>
      </div>
      
      <p className="text-center text-slate-400 text-xs">
        Hosted by {groupData.organizerName || 'a friend'}
      </p>
    </div>
  );
};