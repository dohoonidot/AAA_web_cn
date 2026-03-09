import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const useLoginPageState = () => {
  const navigate = useNavigate();
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const checkPrivacyAgreement = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && !currentUser.privacyAgreed) {
        setPendingUserId(currentUser.userId);
        setPrivacyDialogOpen(true);
      }
    };

    checkPrivacyAgreement();
  }, []);

  const handleLoginSuccess = () => {
    navigate('/chat');
  };

  const handlePrivacyAgreed = () => {
    setPrivacyDialogOpen(false);
    setPendingUserId('');
    navigate('/chat');
  };

  const handlePrivacyDisagreed = async () => {
    setPrivacyDialogOpen(false);
    setPendingUserId('');
    sessionStorage.setItem('privacy_disagree_dismissed', '1');
    navigate('/chat');
  };

  return {
    state: {
      privacyDialogOpen,
      pendingUserId,
      loginLoading,
    },
    actions: {
      setPrivacyDialogOpen,
      setPendingUserId,
      setLoginLoading,
      handleLoginSuccess,
      handlePrivacyAgreed,
      handlePrivacyDisagreed,
    },
  };
};

export type LoginPageStateHook = ReturnType<typeof useLoginPageState>;
