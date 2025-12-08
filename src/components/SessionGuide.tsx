import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import NeonButton from "./NeonButton";

interface SessionGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionType: "breathe" | "focus" | "rest";
  title: string;
  duration: number; // in seconds
}

export default function SessionGuide({ 
  open, 
  onOpenChange, 
  sessionType, 
  title, 
  duration 
}: SessionGuideProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const breathingSteps = [
    { instruction: "Breathe In", duration: 4, color: "from-cyan-500 to-blue-500" },
    { instruction: "Hold", duration: 4, color: "from-blue-500 to-violet-500" },
    { instruction: "Breathe Out", duration: 6, color: "from-violet-500 to-purple-500" },
    { instruction: "Rest", duration: 2, color: "from-purple-500 to-cyan-500" },
  ];

  const focusSteps = [
    { instruction: "Clear Your Mind", duration: 10, color: "from-violet-500 to-purple-500" },
    { instruction: "Set Your Intention", duration: 10, color: "from-purple-500 to-pink-500" },
    { instruction: "Focus Mode Active", duration: duration - 20, color: "from-cyan-500 to-blue-500" },
  ];

  const restSteps = [
    { instruction: "Close Your Eyes", duration: 5, color: "from-indigo-500 to-violet-500" },
    { instruction: "Relax Your Body", duration: 10, color: "from-violet-500 to-purple-500" },
    { instruction: "Deep Rest Mode", duration: duration - 15, color: "from-purple-500 to-indigo-500" },
  ];

  const steps = sessionType === "breathe" ? breathingSteps : sessionType === "focus" ? focusSteps : restSteps;

  useEffect(() => {
    if (!open) {
      setTimeLeft(duration);
      setIsRunning(false);
      setCurrentStep(0);
    }
  }, [open, duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Cycle through breathing steps
  useEffect(() => {
    if (sessionType === "breathe" && isRunning) {
      const totalCycle = breathingSteps.reduce((sum, s) => sum + s.duration, 0);
      const elapsed = duration - timeLeft;
      const cyclePosition = elapsed % totalCycle;
      
      let accumulated = 0;
      for (let i = 0; i < breathingSteps.length; i++) {
        accumulated += breathingSteps[i].duration;
        if (cyclePosition < accumulated) {
          setCurrentStep(i);
          break;
        }
      }
    }
  }, [timeLeft, isRunning, sessionType, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const currentStepData = steps[currentStep] || steps[0];

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-xl border border-primary/20 max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h2 className="font-orbitron text-xl text-gradient">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 flex flex-col items-center">
          {/* Animated Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer ring progress */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="hsl(var(--muted)/0.3)"
                strokeWidth="4"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner breathing circle */}
            <div
              className={cn(
                "w-48 h-48 rounded-full flex flex-col items-center justify-center",
                "bg-gradient-to-br transition-all duration-1000",
                isRunning && sessionType === "breathe" && "animate-pulse",
                currentStepData.color
              )}
              style={{
                transform: sessionType === "breathe" && isRunning 
                  ? currentStep === 0 ? "scale(1.1)" : currentStep === 2 ? "scale(0.9)" : "scale(1)"
                  : "scale(1)",
              }}
            >
              <span className="font-orbitron text-4xl font-bold text-white drop-shadow-lg">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-white/80 mt-2 font-medium">
                {currentStepData.instruction}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {sessionType === "breathe" && "Follow the rhythm. Breathe deeply and calmly."}
              {sessionType === "focus" && "Block out distractions. Stay present."}
              {sessionType === "rest" && "Let go of tension. Allow yourself to relax."}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleReset}
              className="p-3 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </button>
            <NeonButton
              onClick={() => setIsRunning(!isRunning)}
              size="lg"
              className="px-8"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  {timeLeft === duration ? "Start" : "Resume"}
                </>
              )}
            </NeonButton>
          </div>

          {/* Step indicators for breathing */}
          {sessionType === "breathe" && (
            <div className="flex items-center gap-2 mt-6">
              {breathingSteps.map((step, index) => (
                <div
                  key={step.instruction}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentStep
                      ? "w-8 bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
