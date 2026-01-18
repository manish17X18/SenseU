import { memo } from "react";
import { Music, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useMusic } from "@/contexts/MusicContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const HeaderMusicControls = memo(() => {
  const {
    isEnabled,
    isPlaying,
    volume,
    currentTrack,
    tracks,
    toggleEnabled,
    togglePlay,
    setVolume,
    nextTrack,
    prevTrack,
    selectTrack,
  } = useMusic();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "relative p-2 rounded-xl border transition-colors",
            isEnabled && isPlaying 
              ? "bg-primary/20 border-primary/30 hover:bg-primary/30" 
              : "bg-muted/30 border-border/30 hover:bg-muted/50"
          )}
        >
          <Music className={cn(
            "w-5 h-5",
            isEnabled && isPlaying ? "text-primary" : "text-muted-foreground"
          )} />
          {isEnabled && isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-background/95 backdrop-blur-xl border-primary/20" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-orbitron text-sm font-semibold">Background Music</h4>
            <button
              onClick={toggleEnabled}
              className={cn(
                "px-2 py-1 rounded text-xs font-orbitron transition-colors",
                isEnabled 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "bg-muted/30 text-muted-foreground"
              )}
            >
              {isEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {isEnabled && (
            <>
              {/* Current Track */}
              <div className="p-2 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">Now Playing</p>
                <p className="text-sm font-medium truncate">{currentTrack?.name || "No track"}</p>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={prevTrack}
                  className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={nextTrack}
                  className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <Slider
                  value={[volume * 100]}
                  onValueChange={([v]) => setVolume(v / 100)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(volume * 100)}%</span>
              </div>

              {/* Track List */}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                <p className="text-xs text-muted-foreground font-orbitron uppercase">Tracks</p>
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded text-xs transition-colors",
                      currentTrack?.id === track.id
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

HeaderMusicControls.displayName = "HeaderMusicControls";

export default HeaderMusicControls;
