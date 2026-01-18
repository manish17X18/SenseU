import { useState, useEffect, useCallback, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Star, Trophy, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface SnakeGameProps {
  className?: string;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_SIZE = 12;
const INITIAL_SPEED = 200;

const SnakeGame = memo(({ className }: SnakeGameProps) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 6, y: 6 }]);
  const [food, setFood] = useState<Position>({ x: 3, y: 3 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("neuroaura_snake_highscore") || "0");
  });
  const [gameOver, setGameOver] = useState(false);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 6, y: 6 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
  }, [generateFood]);

  const startGame = useCallback(() => {
    resetGame();
    setIsPlaying(true);
  }, [resetGame]);

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const currentDirection = directionRef.current;
      
      let newHead: Position;
      switch (currentDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
        default:
          return prevSnake;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setIsPlaying(false);
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem("neuroaura_snake_highscore", score.toString());
        }
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setIsPlaying(false);
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem("neuroaura_snake_highscore", score.toString());
        }
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
        return newSnake;
      }

      // Remove tail
      newSnake.pop();
      return newSnake;
    });
  }, [food, generateFood, score, highScore]);

  // Game loop
  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED - Math.min(score, 100));
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, moveSnake, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      const currentDir = directionRef.current;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir !== "DOWN") {
            directionRef.current = "UP";
            setDirection("UP");
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir !== "UP") {
            directionRef.current = "DOWN";
            setDirection("DOWN");
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir !== "RIGHT") {
            directionRef.current = "LEFT";
            setDirection("LEFT");
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir !== "LEFT") {
            directionRef.current = "RIGHT";
            setDirection("RIGHT");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const handleDirectionButton = (newDir: Direction) => {
    if (!isPlaying) return;
    const currentDir = directionRef.current;
    
    if (
      (newDir === "UP" && currentDir !== "DOWN") ||
      (newDir === "DOWN" && currentDir !== "UP") ||
      (newDir === "LEFT" && currentDir !== "RIGHT") ||
      (newDir === "RIGHT" && currentDir !== "LEFT")
    ) {
      directionRef.current = newDir;
      setDirection(newDir);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-orbitron uppercase tracking-wider text-muted-foreground">
            Snake
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-orbitron text-amber-400">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-primary" />
            <span className="text-xs font-orbitron text-primary">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className="relative mx-auto rounded-lg overflow-hidden border border-border/30 bg-muted/20"
        style={{ 
          width: GRID_SIZE * 12 + 4,
          height: GRID_SIZE * 12 + 4,
        }}
      >
        {/* Grid cells */}
        <div 
          className="grid gap-px p-0.5"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some(seg => seg.x === x && seg.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={cn(
                  "w-[10px] h-[10px] rounded-sm transition-all duration-100",
                  isHead && "bg-primary shadow-[0_0_6px_rgba(0,240,255,0.8)]",
                  isSnake && !isHead && "bg-primary/70",
                  isFood && "bg-secondary shadow-[0_0_8px_rgba(138,43,226,0.8)] animate-pulse",
                  !isSnake && !isFood && "bg-muted/30"
                )}
              />
            );
          })}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs font-orbitron text-destructive mb-1">Game Over</p>
              <p className="text-[10px] text-muted-foreground">Score: {score}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-3 flex flex-col items-center gap-1">
        {isPlaying ? (
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onClick={() => handleDirectionButton("UP")}
              className="p-1 rounded bg-muted/30 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <div />
            <button
              onClick={() => handleDirectionButton("LEFT")}
              className="p-1 rounded bg-muted/30 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDirectionButton("DOWN")}
              className="p-1 rounded bg-muted/30 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDirectionButton("RIGHT")}
              className="p-1 rounded bg-muted/30 border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-orbitron hover:bg-primary/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {gameOver ? "Play Again" : "Start Game"}
          </button>
        )}
      </div>
      
      {isPlaying && (
        <p className="text-[9px] text-center text-muted-foreground mt-1 font-orbitron">
          Use arrow keys or WASD
        </p>
      )}
    </div>
  );
});

SnakeGame.displayName = "SnakeGame";

export default SnakeGame;
