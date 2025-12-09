import { useState, useEffect, useCallback } from "react";

interface Vitals {
  stress: number;
  focus: number;
  energy: number;
}

interface UseRealtimeVitalsOptions {
  baseStress?: number;
  baseFocus?: number;
  baseEnergy?: number;
  updateInterval?: number;
}

export function useRealtimeVitals(options: UseRealtimeVitalsOptions = {}) {
  const {
    baseStress = 35,
    baseFocus = 75,
    baseEnergy = 65,
    updateInterval = 3000,
  } = options;

  const [vitals, setVitals] = useState<Vitals>({
    stress: baseStress,
    focus: baseFocus,
    energy: baseEnergy,
  });

  const [typingSpeed, setTypingSpeed] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user typing activity
  const trackTyping = useCallback((wpm: number) => {
    setTypingSpeed(wpm);
    setLastActivity(Date.now());
  }, []);

  // Track user clicks/activity
  const trackActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = (now - lastActivity) / 1000; // seconds
      
      setVitals((prev) => {
        // Calculate stress based on typing speed and activity
        let stressChange = 0;
        let focusChange = 0;
        let energyChange = 0;

        // Fast typing increases stress slightly
        if (typingSpeed > 60) {
          stressChange += 2;
          focusChange += 3;
        } else if (typingSpeed > 40) {
          stressChange += 1;
          focusChange += 2;
        } else if (typingSpeed > 0) {
          focusChange += 1;
        }

        // Long idle time suggests rest or distraction
        if (idleTime > 30) {
          stressChange -= 2;
          focusChange -= 3;
          energyChange -= 1;
        } else if (idleTime > 10) {
          stressChange -= 1;
          focusChange -= 1;
        }

        // Add some natural variation
        const variation = (Math.random() - 0.5) * 4;

        const newStress = Math.min(100, Math.max(0, prev.stress + stressChange + variation * 0.5));
        const newFocus = Math.min(100, Math.max(0, prev.focus + focusChange + variation * 0.3));
        const newEnergy = Math.min(100, Math.max(0, prev.energy + energyChange + variation * 0.2));

        return {
          stress: Math.round(newStress),
          focus: Math.round(newFocus),
          energy: Math.round(newEnergy),
        };
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [typingSpeed, lastActivity, updateInterval]);

  // Add global activity listeners
  useEffect(() => {
    const handleActivity = () => trackActivity();
    
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [trackActivity]);

  return {
    vitals,
    trackTyping,
    trackActivity,
  };
}
