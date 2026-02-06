'use client';

import { useAppContext } from '@/contexts/AppContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { MarketingPage } from '@/components/marketing/MarketingPage';

export default function Home() {
  const {
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
  } = useAppContext();

  return (
    <>
      <MarketingPage
        onSignIn={() => {
          setAuthMode('signin');
          setShowAuthModal(true);
        }}
        onSignUp={() => {
          setAuthMode('signup');
          setShowAuthModal(true);
        }}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
}
