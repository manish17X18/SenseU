import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Brain, Target, Moon, Wind, Settings, User, Bell, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  title: string;
  description: string;
  action: () => void;
  icon: React.ElementType;
  category: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onStartSession: (type: "breathe" | "focus" | "rest", title: string, duration: number) => void;
  onImprove: (type: "stress" | "focus" | "energy" | "sleep" | "mood") => void;
}

export default function SearchDialog({
  open,
  onOpenChange,
  onOpenProfile,
  onOpenSettings,
  onOpenNotifications,
  onStartSession,
  onImprove,
}: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const allItems: SearchResult[] = [
    { title: "Profile", description: "View and edit your profile", action: onOpenProfile, icon: User, category: "Settings" },
    { title: "Settings", description: "Customize app settings", action: onOpenSettings, icon: Settings, category: "Settings" },
    { title: "Notifications", description: "View your notifications", action: onOpenNotifications, icon: Bell, category: "Settings" },
    { title: "Breathing Exercise", description: "Start a calming breath session", action: () => onStartSession("breathe", "Breathing Session", 60), icon: Wind, category: "Sessions" },
    { title: "Focus Session", description: "Start a deep focus timer", action: () => onStartSession("focus", "Focus Session", 1500), icon: Target, category: "Sessions" },
    { title: "Rest Session", description: "Take a guided rest break", action: () => onStartSession("rest", "Rest Session", 300), icon: Moon, category: "Sessions" },
    { title: "Improve Stress", description: "Tasks to reduce stress", action: () => onImprove("stress"), icon: Brain, category: "Vitals" },
    { title: "Improve Focus", description: "Tasks to boost focus", action: () => onImprove("focus"), icon: Target, category: "Vitals" },
    { title: "Improve Energy", description: "Tasks to increase energy", action: () => onImprove("energy"), icon: Zap, category: "Vitals" },
    { title: "Improve Sleep", description: "Tips for better sleep", action: () => onImprove("sleep"), icon: Moon, category: "Vitals" },
    { title: "Dashboard", description: "Go to main dashboard", action: () => navigate("/dashboard"), icon: Brain, category: "Navigation" },
    { title: "Home", description: "Go to homepage", action: () => navigate("/"), icon: Brain, category: "Navigation" },
    { title: "Assessment", description: "Take wellness assessment", action: () => navigate("/assessment"), icon: Brain, category: "Features" },
  ];

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults(allItems.slice(0, 6));
      return;
    }

    const lower = q.toLowerCase();
    const filtered = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
    setResults(filtered);
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(allItems.slice(0, 6));
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    result.action();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-gradient">Search NeuroAura</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, settings, sessions..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 bg-muted/30 rounded-xl text-sm outline-none border border-border/30 focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No results found for "{query}"
            </p>
          ) : (
            results.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <result.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{result.title}</p>
                  <p className="text-xs text-muted-foreground">{result.description}</p>
                </div>
                <span className="text-xs text-muted-foreground/60 px-2 py-1 rounded-md bg-muted/20">
                  {result.category}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
