import React, { useState } from 'react';
import { Friend, GroupData } from '../types';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { ChipInput } from './ChipInput';
import { Plus, Trash2, Users, Gift, ChevronRight } from 'lucide-react';
import { generatePairings } from '../services/pairingService';

interface SetupFormProps {
  onComplete: (data: GroupData) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onComplete }) => {
  const [groupName, setGroupName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: '', interests: [], notes: '' },
    { id: '2', name: '', interests: [], notes: '' },
    { id: '3', name: '', interests: [], notes: '' },
  ]);
  const [error, setError] = useState('');

  const addFriend = () => {
    setFriends([...friends, { id: crypto.randomUUID(), name: '', interests: [], notes: '' }]);
  };

  const removeFriend = (id: string) => {
    if (friends.length <= 3) return; // Maintain minimum
    setFriends(friends.filter(f => f.id !== id));
  };

  const updateFriend = (id: string, field: keyof Friend, value: any) => {
    setFriends(friends.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleSubmit = () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    const validFriends = friends.filter(f => f.name.trim().length > 0);
    if (validFriends.length < 3) {
      setError('Please add at least 3 friends with names');
      return;
    }

    try {
      const pairings = generatePairings(validFriends);
      onComplete({
        name: groupName,
        organizerName,
        friends: validFriends,
        pairings
      });
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="font-display text-4xl text-santa-red">Start a New Group</h2>
        <p className="text-slate-600">Enter details to organize the perfect Secret Santa exchange.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input 
            label="Group Name" 
            placeholder="e.g. Office Holiday Party 2025" 
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Input 
            label="Organizer Name (Optional)" 
            placeholder="Your name" 
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-santa-green" />
              Participants ({friends.length})
            </h3>
            <span className="text-xs text-slate-400">Min. 3 people</span>
          </div>

          <div className="space-y-4">
            {friends.map((friend, index) => (
              <div key={friend.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group transition-all hover:shadow-md hover:border-red-100">
                <div className="absolute -left-3 -top-3 w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-400 shadow-sm text-sm">
                  {index + 1}
                </div>
                {friends.length > 3 && (
                  <button 
                    onClick={() => removeFriend(friend.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-2 transition-colors"
                    title="Remove friend"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <div className="space-y-4">
                  <Input 
                    placeholder="Friend's Name" 
                    value={friend.name}
                    onChange={(e) => updateFriend(friend.id, 'name', e.target.value)}
                    className="bg-white font-medium"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <ChipInput
                      label="Interests & Hobbies"
                      values={friend.interests}
                      onChange={(vals) => updateFriend(friend.id, 'interests', vals)}
                      placeholder="Type & press Enter (e.g. Coffee, Cats)"
                    />
                    <TextArea 
                      label="Notes / Dislikes"
                      placeholder="e.g. Allergic to nuts, dislikes plastic trinkets"
                      value={friend.notes}
                      onChange={(e) => updateFriend(friend.id, 'notes', e.target.value)}
                      rows={1}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            variant="outline" 
            onClick={addFriend} 
            className="w-full border-dashed border-2 hover:border-solid py-4"
          >
            <Plus size={18} className="mr-2" />
            Add Another Friend
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-center font-medium animate-pulse">
          {error}
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex justify-center">
        <Button size="lg" onClick={handleSubmit} className="shadow-2xl shadow-red-200 w-full md:w-auto min-w-[300px]">
          <Gift className="mr-2 w-5 h-5" />
          Generate Pairings
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};