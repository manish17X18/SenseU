import { cn } from "@/lib/utils";

interface TimelinePoint {
  time: string;
  value: number;
  event?: string;
}

interface EmotionalTimelineProps {
  data: TimelinePoint[];
  className?: string;
}

const EmotionalTimeline = ({ data, className }: EmotionalTimelineProps) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const getColor = (value: number) => {
    if (value <= 20) return "#00f0ff";
    if (value <= 40) return "#22c55e";
    if (value <= 60) return "#eab308";
    if (value <= 80) return "#f97316";
    return "#ef4444";
  };

  const generatePath = () => {
    const width = 100 / (data.length - 1);
    let path = "";

    data.forEach((point, i) => {
      const x = i * width;
      const y = 100 - ((point.value - minValue) / range) * 80 - 10;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = (i - 1) * width;
        const prevY = 100 - ((data[i - 1].value - minValue) / range) * 80 - 10;
        const cpX1 = prevX + width / 3;
        const cpX2 = x - width / 3;
        path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
    });

    return path;
  };

  const path = generatePath();

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-orbitron uppercase tracking-wider text-muted-foreground">
          Emotional Timeline
        </h4>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>

      {/* 3D Container */}
      <div 
        className="relative h-40 rounded-2xl overflow-hidden border border-primary/20"
        style={{
          background: 'linear-gradient(180deg, hsl(222 47% 8% / 0.9), hsl(222 47% 4% / 0.95))',
          boxShadow: '0 10px 40px hsl(222 47% 4% / 0.5), inset 0 1px 0 hsl(180 100% 50% / 0.1), 0 0 60px hsl(180 100% 50% / 0.05)',
          transform: 'perspective(1000px) rotateX(2deg)',
        }}
      >
        {/* Ambient glow effects */}
        <div className="absolute -top-20 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 right-1/4 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid lines with 3D effect */}
        <div className="absolute inset-0">
          {[0, 25, 50, 75, 100].map((y) => (
            <div
              key={y}
              className="absolute w-full h-px"
              style={{ 
                top: `${y}%`,
                background: `linear-gradient(90deg, transparent, hsl(180 100% 50% / ${y === 50 ? 0.15 : 0.05}), transparent)`
              }}
            />
          ))}
          {/* Vertical grid lines */}
          {data.map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-px"
              style={{ 
                left: `${(i / (data.length - 1)) * 100}%`,
                background: 'linear-gradient(180deg, transparent, hsl(180 100% 50% / 0.08), transparent)'
              }}
            />
          ))}
        </div>

        {/* SVG Wave with 3D effect */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'drop-shadow(0 0 12px hsl(180 100% 50% / 0.4))' }}
        >
          {/* Multiple gradient layers for depth */}
          <defs>
            <linearGradient id="waveGradient3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient3D" x1="0%" y1="0%" x2="100%" y2="0%">
              {data.map((point, i) => (
                <stop
                  key={i}
                  offset={`${(i / (data.length - 1)) * 100}%`}
                  stopColor={getColor(point.value)}
                />
              ))}
            </linearGradient>
            <filter id="glow3D">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background gradient area */}
          <path
            d={`${path} L 100 100 L 0 100 Z`}
            fill="url(#waveGradient3D)"
          />

          {/* Secondary line for depth */}
          <path
            d={path}
            fill="none"
            stroke="url(#lineGradient3D)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity="0.3"
            transform="translate(0, 2)"
          />

          {/* Main line with glow */}
          <path
            d={path}
            fill="none"
            stroke="url(#lineGradient3D)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glow3D)"
          />
        </svg>

        {/* Data points with 3D orb effect */}
        {data.map((point, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 80 - 10;
          const color = getColor(point.value);

          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              {/* Outer glow ring */}
              <div 
                className="absolute inset-0 w-5 h-5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${color}40, transparent 70%)`,
                  left: '50%',
                  top: '50%',
                }}
              />
              {/* Main orb */}
              <div
                className="w-3.5 h-3.5 rounded-full transition-transform group-hover:scale-150"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${color}ee, ${color}99, ${color}66)`,
                  boxShadow: `0 0 10px ${color}, 0 0 20px ${color}80, inset 0 1px 2px rgba(255,255,255,0.3)`,
                }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all pointer-events-none transform group-hover:-translate-y-1">
                <div 
                  className="px-3 py-2 rounded-xl border border-primary/30 whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(180deg, hsl(222 47% 12% / 0.95), hsl(222 47% 8% / 0.95))',
                    boxShadow: '0 4px 20px hsl(222 47% 4% / 0.8), 0 0 1px hsl(180 100% 50% / 0.5)',
                  }}
                >
                  <p className="text-xs font-orbitron text-foreground font-semibold">{point.time}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <p className="text-xs text-muted-foreground">Stress: {point.value}</p>
                  </div>
                  {point.event && (
                    <p className="text-xs text-primary mt-1 font-medium">{point.event}</p>
                  )}
                </div>
                {/* Tooltip arrow */}
                <div 
                  className="w-2 h-2 rotate-45 mx-auto -mt-1"
                  style={{ background: 'hsl(222 47% 10%)' }}
                />
              </div>
            </div>
          );
        })}

        {/* Time labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 pb-2">
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((point, i) => (
            <span 
              key={i} 
              className="text-[10px] font-orbitron text-muted-foreground/70"
              style={{ textShadow: '0 0 10px hsl(180 100% 50% / 0.3)' }}
            >
              {point.time}
            </span>
          ))}
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
      </div>
    </div>
  );
};

export default EmotionalTimeline;
