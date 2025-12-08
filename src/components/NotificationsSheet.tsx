import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bell, Brain, Heart, Moon, Target, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "stress" | "achievement" | "reminder" | "tip" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationsSheet({ open, onOpenChange }: NotificationsSheetProps) {
  const notifications: Notification[] = [
    {
      id: "1",
      type: "stress",
      title: "Stress Level Rising",
      message: "Your stress has increased by 15% in the last hour. Consider a quick breathing exercise.",
      time: "5 min ago",
      read: false,
    },
    {
      id: "2",
      type: "achievement",
      title: "Streak Achievement!",
      message: "You've completed 7 consecutive days of morning check-ins. Keep it up!",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      type: "reminder",
      title: "Sleep Reminder",
      message: "It's almost your bedtime. Start winding down for optimal rest.",
      time: "2 hours ago",
      read: true,
    },
    {
      id: "4",
      type: "tip",
      title: "Focus Tip",
      message: "Studies show 25-minute focus sessions improve productivity. Try a Pomodoro today!",
      time: "3 hours ago",
      read: true,
    },
    {
      id: "5",
      type: "alert",
      title: "High Stress Alert",
      message: "Your stress level reached 78% during your exam prep. Recovery session recommended.",
      time: "Yesterday",
      read: true,
    },
    {
      id: "6",
      type: "achievement",
      title: "Goal Reached",
      message: "You've maintained calm stress levels for 3 consecutive days!",
      time: "2 days ago",
      read: true,
    },
  ];

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "stress":
        return Brain;
      case "achievement":
        return CheckCircle;
      case "reminder":
        return Clock;
      case "tip":
        return Target;
      case "alert":
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "stress":
        return "bg-violet-500/20 border-violet-500/40 text-violet-400";
      case "achievement":
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
      case "reminder":
        return "bg-cyan-500/20 border-cyan-500/40 text-cyan-400";
      case "tip":
        return "bg-amber-500/20 border-amber-500/40 text-amber-400";
      case "alert":
        return "bg-red-500/20 border-red-500/40 text-red-400";
      default:
        return "bg-muted/20 border-border/40 text-muted-foreground";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-background/95 backdrop-blur-xl border-l border-primary/20 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="font-orbitron text-xl text-gradient flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-orbitron">
                {unreadCount} new
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-3 mt-6">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  notification.read 
                    ? "bg-muted/10 border-border/30 opacity-70" 
                    : "bg-muted/20 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.1)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg border", getTypeStyles(notification.type))}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
