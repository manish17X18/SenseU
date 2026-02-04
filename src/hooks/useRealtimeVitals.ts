import { useState, useEffect, useCallback, useRef } from "react";

interface Vitals {
  stress: number;
  focus: number;
  energy: number;
}

interface UseRealtimeVitalsOptions {
  baseStress?: number;
  baseFocus?: number;
  baseEnergy?: number;
}

// Get user-specific localStorage key
const getUserKey = (key: string) => {
  const userId = localStorage.getItem("neuroaura_user_id");
  return userId ? `${key}:${userId}` : key;
};

export function useRealtimeVitals(options: UseRealtimeVitalsOptions = {}) {
  const {
    baseStress = 35,
    baseFocus = 75,
    baseEnergy = 65,
  } = options;

  // Load the exact stress score from assessment - NO random variation
  const getInitialStress = () => {
    const storedStress = localStorage.getItem(getUserKey("neuroaura_stress_score"));
    return storedStress ? parseInt(storedStress) : baseStress;
  };

  const [vitals, setVitals] = useState<Vitals>({
    stress: getInitialStress(),
    focus: baseFocus,
    energy: baseEnergy,
  });

  const lastDecayRef = useRef(Date.now());
  const isVisibleRef = useRef(true);

  // Reduce stress when snake game is played (called externally)
  const reduceStressFromGame = useCallback((amount: number = 5) => {
    setVitals((prev) => {
      const newStress = Math.max(1, prev.stress - amount); // Never go below 1
      // Save to localStorage
      localStorage.setItem(getUserKey("neuroaura_stress_score"), newStress.toString());
      return {
        ...prev,
        stress: newStress,
        focus: Math.min(100, prev.focus + 2),
        energy: Math.min(100, prev.energy + 1),
      };
    });
  }, []);

  // Reduce stress when session is completed (called externally)
  const reduceStressFromSession = useCallback((amount: number = 10) => {
    setVitals((prev) => {
      const newStress = Math.max(1, prev.stress - amount); // Never go below 1
      // Save to localStorage
      localStorage.setItem(getUserKey("neuroaura_stress_score"), newStress.toString());
      return {
        ...prev,
        stress: newStress,
        focus: Math.min(100, prev.focus + 5),
        energy: Math.min(100, prev.energy + 3),
      };
    });
  }, []);

  // Passive decay: 1% every 5 minutes if user is idle
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastDecayRef.current = Date.now(); // Reset decay timer when returning
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Check every minute for 5-minute decay
    const decayInterval = setInterval(() => {
      if (!isVisibleRef.current) return;

      const now = Date.now();
      const timeSinceLastDecay = now - lastDecayRef.current;
      
      // 5 minutes = 300000ms
      if (timeSinceLastDecay >= 300000) {
        setVitals((prev) => {
          const newStress = Math.max(1, prev.stress - 1); // Decrease by 1%, never below 1
          localStorage.setItem(getUserKey("neuroaura_stress_score"), newStress.toString());
          return {
            ...prev,
            stress: newStress,
          };
        });
        lastDecayRef.current = now;
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(decayInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Sync with localStorage on mount (in case it changed elsewhere)
  useEffect(() => {
    const storedStress = localStorage.getItem(getUserKey("neuroaura_stress_score"));
    if (storedStress) {
      const parsedStress = parseInt(storedStress);
      setVitals((prev) => ({
        ...prev,
        stress: parsedStress,
      }));
    }
  }, []);

  return {
    vitals,
    reduceStressFromGame,
    reduceStressFromSession,
  };
}
