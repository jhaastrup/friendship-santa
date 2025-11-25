import React, { useState, useEffect } from 'react';
import { GroupData, AppStep, Friend } from './types';
import { SetupForm } from './components/SetupForm';
import { RevealView } from './components/RevealView';
import { GuestLogin } from './components/GuestLogin';
import { resolveGroupDataFromUrl } from './services/shareService';
import { Gift, Heart } from 'lucide-react';

const STORAGE_KEY = 'friendship_santa_data';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestUser, setGuestUser] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Check for URL data (Guest Mode) - Async now to support Remote IDs
        const sharedData = await resolveGroupDataFromUrl();
        if (sharedData) {
          setGroupData(sharedData);
          setIsGuest(true);
          setStep(AppStep.REVEAL);
          setIsLoading(false);
          return;
        }

        // 2. Check for Local Storage (Host Mode / Previous Session)
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setGroupData(parsed);
            setStep(AppStep.REVEAL);
          } catch (e) {
            console.error("Failed to load saved state", e);
          }
        }
      } catch (error) {
        console.error("Initialization error", error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handleGroupCreated = (data: GroupData) => {
    setGroupData(data);
    setStep(AppStep.REVEAL);
    setIsGuest(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to delete this group and start over?")) {
      setGroupData(null);
      setStep(AppStep.SETUP);
      setIsGuest(false);
      setGuestUser(null);
      localStorage.removeItem(STORAGE_KEY);
      // Clean URL if it exists
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleGuestLogin = (friend: Friend) => {
    setGuestUser(friend);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-santa-snow">
        <div className="text-center space-y-4">
          <Gift className="w-12 h-12 text-santa-red animate-bounce mx-auto" />
          <p className="text-slate-600 font-medium animate-pulse">Loading Santa's List...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-santa-snow to-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #D42426 25%, transparent 25%, transparent 50%, #D42426 50%, #D42426 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}></div>
      
      {/* Header */}
      <header className="py-6 px-4 md:px-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
           <Gift className="text-santa-red w-8 h-8" />
           <h1 className="font-display text-4xl font-bold text-santa-red">Friendship Santa</h1>
        </div>
        {!isGuest && (
          <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Gift Exchange Generator</p>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-4 pb-12 relative z-10">
        
        {step === AppStep.SETUP && (
          <SetupForm onComplete={handleGroupCreated} />
        )}

        {step === AppStep.REVEAL && groupData && (
          <>
            {isGuest && !guestUser ? (
              <GuestLogin groupData={groupData} onLogin={handleGuestLogin} />
            ) : (
              <RevealView 
                groupData={groupData} 
                onReset={handleReset} 
                isGuestMode={isGuest}
                guestUser={guestUser}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm relative z-10">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart size={14} className="text-santa-red fill-current" /> for the holidays
        </p>
      </footer>
    </div>
  );
};

export default App;