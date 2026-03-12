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
    content: "Welcome to TradeCircle! This is your Dashboard — track your overall trading performance, profit, win rate, and more at a glance.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="account-selector"]',
    content: "Manage your trading accounts here. Connect MT4/MT5, Myfxbook, or create manual accounts to start tracking.",
  },
  {
    target: '[data-tour="add-trade"]',
    content: "Add new trades manually with full details — pair, entry/exit, lot size, and number of positions.",
  },
  {
    target: '[href="/journal"]',
    content: "Your Trade Journal logs every trade. Review past entries, filter by pair or date, and spot patterns.",
  },
  {
    target: '[href="/market-review"]',
    content: "Market Review lets you analyze upcoming setups, document entry ideas, key levels, and track if setups worked.",
  },
  {
    target: '[href="/backtesting"]',
    content: "Use Backtesting to test strategies on historical data and access learning resources.",
  },
  {
    target: '[href="/news"]',
    content: "Stay updated with real-time Trading News and the Economic Calendar for market-moving events.",
  },
  {
    target: '[href="/settings"]',
    content: "Customize your profile, generate trading statements, and manage your account in Settings.",
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
        setTimeout(() => setRunTour(true), 1500);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status } = data;
    
    if ((status === STATUS.FINISHED || status === STATUS.SKIPPED) && user) {
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
        scrollToFirstStep
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "hsl(var(--primary))",
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip Tour",
        }}
      />
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
