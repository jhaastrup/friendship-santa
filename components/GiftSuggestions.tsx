import React, { useState, useEffect } from 'react';
import { GiftIdea } from '../types';
import { generateGiftIdeas } from '../services/geminiService';
import { Sparkles, Gift, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface GiftSuggestionsProps {
  receiverName: string;
  interests: string[];
  notes: string;
}

export const GiftSuggestions: React.FC<GiftSuggestionsProps> = ({ receiverName, interests, notes }) => {
  const [ideas, setIdeas] = useState<GiftIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState('');

  const fetchIdeas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const suggestions = await generateGiftIdeas(receiverName, interests, notes);
      setIdeas(suggestions);
      setHasFetched(true);
    } catch (err) {
      setError('Failed to get suggestions from the elves. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Funny': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Practical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Luxury': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DIY': return 'bg-green-100 text-green-800 border-green-200';
      case 'Sentimental': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (!hasFetched && !isLoading) {
    return (
      <div className="mt-6 text-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <Sparkles className="w-10 h-10 text-santa-gold mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Stuck for ideas?</h3>
        <p className="text-slate-600 mb-4 text-sm">
          Let our AI Santa Helper suggest gifts based on {receiverName}'s interests: 
          <span className="italic block mt-1 text-slate-500">
            {interests.length > 0 ? interests.join(", ") : "General surprises"}
          </span>
        </p>
        <Button onClick={fetchIdeas} variant="secondary" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          Ask Santa AI
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-6 p-8 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
        <div className="animate-bounce mb-4">
          <Gift className="w-12 h-12 text-santa-red mx-auto" />
        </div>
        <p className="text-slate-600 font-medium">Checking the nice list...</p>
        <p className="text-slate-400 text-sm mt-2">Generating personalized ideas for {receiverName}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
        <button onClick={fetchIdeas} className="text-sm underline hover:text-red-900 ml-auto">Retry</button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-2xl text-santa-red">Gift Ideas</h3>
        <Button onClick={fetchIdeas} variant="ghost" size="sm" className="text-xs">
          Regenerate
        </Button>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-1">
        {ideas.map((idea, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border ${getCategoryColor(idea.category)}`}>
                {idea.category}
              </span>
              {idea.estimatedPrice && (
                <span className="text-xs font-medium text-slate-400">{idea.estimatedPrice}</span>
              )}
            </div>
            <h4 className="font-bold text-slate-800 mb-1 text-lg group-hover:text-santa-red transition-colors">{idea.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{idea.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};