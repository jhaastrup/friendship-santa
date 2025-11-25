import React, { useState, useEffect } from 'react';
import { GroupData, Friend } from '../types';
import { getReceiverForGiver } from '../services/pairingService';
import { createShortUrl } from '../services/shareService';
import { GiftSuggestions } from './GiftSuggestions';
import { Button } from './Button';
import { User, RefreshCw, ArrowLeft, Eye, Gift, Link as LinkIcon, Check, Copy, Share2 } from 'lucide-react';

interface RevealViewProps {
  groupData: GroupData;
  onReset: () => void;
  isGuestMode?: boolean;
  guestUser?: Friend | null;
}

export const RevealView: React.FC<RevealViewProps> = ({ 
  groupData, 
  onReset, 
  isGuestMode = false,
  guestUser = null 
}) => {
  // If guestUser is provided, initialize selectedGiver with it
  const [selectedGiver, setSelectedGiver] = useState<Friend | null>(guestUser);
  const [isRevealed, setIsRevealed] = useState(false);
  const [viewMode, setViewMode] = useState<'INDIVIDUAL' | 'MASTER'>('INDIVIDUAL');
  
  // Sharing State
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Effect to ensure guest user is selected if in guest mode
  useEffect(() => {
    if (isGuestMode && guestUser) {
      setSelectedGiver(guestUser);
    }
  }, [isGuestMode, guestUser]);

  const handleSelectGiver = (friend: Friend) => {
    setSelectedGiver(friend);
    setIsRevealed(false);
  };

  const handleBack = () => {
    // Prevent going back in guest mode
    if (isGuestMode) return;
    setSelectedGiver(null);
    setIsRevealed(false);
  };

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const url = await createShortUrl(groupData);
      setGeneratedUrl(url);
    } catch (err) {
      console.error("Failed to generate link", err);
      alert("Could not generate share link. Please try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedUrl) return;
    
    // Synchronous write works reliably on mobile because it's directly triggered by a click
    navigator.clipboard.writeText(generatedUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Clipboard write failed", err);
        alert("Failed to copy automatically. Please copy the text from the box manually.");
      });
  };

  const handleNativeShare = async () => {
    // Cast to any to avoid TS error TS2774 if definitions imply share is always present
    if (!generatedUrl || !(navigator as any).share) return;
    try {
      await navigator.share({
        title: `Join ${groupData.name} Secret Santa`,
        text: `Click the link to see who you're pairing with for the ${groupData.name} Secret Santa!`,
        url: generatedUrl,
      });
    } catch (err) {
      // User cancelled or share failed
      console.log("Share cancelled or failed", err);
    }
  };

  const receiver = selectedGiver 
    ? getReceiverForGiver(selectedGiver.id, groupData.pairings, groupData.friends) 
    : undefined;

  // Master List View (Organizer Only)
  if (viewMode === 'MASTER' && !isGuestMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
           <h2 className="text-xl font-bold text-slate-800">Master List</h2>
           <Button variant="ghost" size="sm" onClick={() => setViewMode('INDIVIDUAL')}>
             Switch to Privacy Mode
           </Button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-santa-red text-white">
              <tr>
                <th className="p-4 font-semibold">Giver</th>
                <th className="p-4 font-semibold">Receiver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupData.friends.map(friend => {
                const rec = getReceiverForGiver(friend.id, groupData.pairings, groupData.friends);
                return (
                  <tr key={friend.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-700">{friend.name}</td>
                    <td className="p-4 text-santa-green font-semibold">→ {rec?.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-center">
             <Button variant="outline" onClick={onReset}>Start Over</Button>
        </div>
      </div>
    );
  }

  // Individual Reveal View (Card)
  if (selectedGiver && receiver) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in pb-20">
        {!isGuestMode && (
          <button 
            onClick={handleBack} 
            className="mb-6 flex items-center text-slate-500 hover:text-santa-red transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to list
          </button>
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
          {/* Guest Mode Badge */}
          {isGuestMode && (
             <div className="absolute top-4 right-4 bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full border border-slate-200">
               Guest View
             </div>
          )}

          <div className="bg-santa-snow p-8 text-center border-b border-slate-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4 text-3xl">
              🎅
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Hello, {selectedGiver.name}!</h2>
            <p className="text-slate-600 mt-2">Ready to see who you got?</p>
          </div>

          <div className="p-8 text-center">
            {!isRevealed ? (
              <div className="py-12 space-y-6">
                <div className="mx-auto w-24 h-24 bg-santa-red rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                    <Gift className="text-white w-10 h-10" />
                </div>
                <Button size="lg" onClick={() => setIsRevealed(true)} className="w-full">
                  Reveal My Match
                </Button>
                <p className="text-xs text-slate-400 uppercase tracking-widest mt-4">Make sure no one is looking!</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                   <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">You are giving a gift to</p>
                   <h1 className="font-display text-5xl text-santa-red mb-2 drop-shadow-sm">{receiver.name}</h1>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User size={18} />
                    Their Preferences
                  </h4>
                  
                  {receiver.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {receiver.interests.map((int, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 shadow-sm">
                          {int}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic mb-4">No specific interests listed.</p>
                  )}

                  {receiver.notes && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                      <strong>Note:</strong> {receiver.notes}
                    </div>
                  )}
                </div>

                <GiftSuggestions 
                  receiverName={receiver.name} 
                  interests={receiver.interests} 
                  notes={receiver.notes} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Guest: Create your own Group CTA */}
        {isGuestMode && (
          <div className="mt-8 text-center">
             <p className="text-slate-400 text-sm mb-2">Want to run your own Secret Santa?</p>
             <a href="/" className="text-santa-red font-medium hover:underline text-sm">Start a New Group</a>
          </div>
        )}
      </div>
    );
  }

  // Landing Grid (Host View Only)
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <h2 className="font-display text-4xl text-santa-red">{groupData.name}</h2>
        <div className="inline-block bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 text-sm text-slate-600">
          Hosted by <span className="font-semibold text-slate-800">{groupData.organizerName || 'Anonymous'}</span>
        </div>
        <p className="text-lg text-slate-600">Select your name to find out who your Secret Santa match is!</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {groupData.friends.map(friend => (
          <button
            key={friend.id}
            onClick={() => handleSelectGiver(friend)}
            className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:bg-red-50 transition-colors">
              🎅
            </div>
            <span className="font-semibold text-slate-700 group-hover:text-santa-red block truncate">
              {friend.name}
            </span>
          </button>
        ))}
      </div>

      {/* Host Controls */}
      <div className="space-y-6 pt-8 border-t border-slate-200/50">
        
        {/* Share Section */}
        <div className="bg-santa-snow p-6 rounded-2xl border border-slate-100 text-center">
          <h3 className="font-semibold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <LinkIcon size={18} className="text-santa-red" />
            Share with friends
          </h3>
          <p className="text-slate-500 text-sm mb-4">Send this link to the group so everyone can see their match.</p>
          
          {!generatedUrl ? (
            <div className="flex justify-center">
              <Button 
                 onClick={handleGenerateLink} 
                 variant="primary" 
                 className="min-w-[200px] shadow-red-200"
                 isLoading={isGeneratingLink}
               >
                 <LinkIcon size={18} className="mr-2" /> 
                 {isGeneratingLink ? 'Creating Link...' : 'Create Invite Link'}
               </Button>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 max-w-md mx-auto">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedUrl}
                  className="flex-1 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
              
              <div className="flex justify-center gap-3 flex-wrap">
                {/* Manual Copy Button */}
                <Button 
                  onClick={handleCopyLink} 
                  variant={copied ? "secondary" : "primary"}
                  size="sm"
                >
                  {copied ? (
                    <><Check size={16} className="mr-1" /> Copied!</>
                  ) : (
                    <><Copy size={16} className="mr-1" /> Copy Link</>
                  )}
                </Button>

                {/* Native Share (Mobile) */}
                {typeof navigator !== 'undefined' && (navigator as any).share && (
                  <Button 
                    onClick={handleNativeShare} 
                    variant="outline"
                    size="sm"
                  >
                    <Share2 size={16} className="mr-1" /> Share
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={onReset}
            className="text-slate-400 text-sm hover:text-slate-600 flex items-center gap-2"
          >
            <RefreshCw size={14} /> Reset Group
          </button>
          <span className="text-slate-300">|</span>
          <button 
            onClick={() => setViewMode('MASTER')}
            className="text-slate-400 text-sm hover:text-santa-red flex items-center gap-2"
          >
            <Eye size={14} /> View Master List (Organizer Only)
          </button>
        </div>
      </div>
    </div>
  );
};