import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingContextType {
  runTour: boolean;
  startTour: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType>({
  runTour: false,
  startTour: () => {},
  hasCompletedOnboarding: false,
});

const steps: Step[] = [
  {
    target: '[data-tour="dashboard-stats"]',
    content: "Welcome! Here you can see your trading performance at a glance - total profit, win rate, and number of trades.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="account-selector"]',
    content: "Switch between your trading accounts here. You can connect MT4/MT5 accounts or create manual accounts.",
  },
  {
    target: '[data-tour="add-trade"]',
    content: "Add new trades manually or sync them from your connected accounts.",
  },
  {
    target: '[data-tour="reflections"]',
    content: "Journal your thoughts and emotions after each trading session to improve your discipline.",
  },
  {
    target: '[data-tour="trading-plan"]',
    content: "Create and follow your trading plan to stay consistent and disciplined.",
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [runTour, setRunTour] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("user_id", user.id)
        .single();

      if (data && !data.has_completed_onboarding) {
        setHasCompletedOnboarding(false);
        setTimeout(() => setRunTour(true), 1000);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) && user) {
      setRunTour(false);
      await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("user_id", user.id);
      setHasCompletedOnboarding(true);
    }
  }, [user]);

  const startTour = useCallback(() => {
    setRunTour(true);
  }, []);

  return (
    <OnboardingContext.Provider value={{ runTour, startTour, hasCompletedOnboarding }}>
      {children}
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "hsl(var(--primary))",
            zIndex: 10000,
          },
        }}
      />
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
