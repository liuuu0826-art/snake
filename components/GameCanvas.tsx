import React, { useEffect, useRef, useCallback } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  COLOR_BG,
  COLOR_FOOD,
  COLOR_GRID,
  COLOR_SNAKE_BODY,
  COLOR_SNAKE_HEAD,
  GRID_HEIGHT,
  GRID_WIDTH,
  INITIAL_SPEED,
  MIN_SPEED,
  SPEED_DECREMENT,
  SPEED_INCREMENT_STEP,
} from '../constants';
import { Direction, GameState, GameStatus, Point } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game logic state (Mutable Refs for performance to avoid React re-renders on every frame)
  const snake = useRef<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const food = useRef<Point>({ x: 15, y: 5 });
  const direction = useRef<Direction>('UP');
  const nextDirection = useRef<Direction>('UP');
  const lastTime = useRef<number>(0);
  const accumulator = useRef<number>(0);
  const frameId = useRef<number>(0);

  // Sound effects (Simulated with logging for now, or AudioContext could be added)
  const playEatSound = () => {
    // Optional: Add audio logic here
  };

  const getRandomPosition = (): Point => {
    // Simple random position
    let newPos: Point;
    let isColliding;
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      };
      // eslint-disable-next-line no-loop-func
      isColliding = snake.current.some(segment => segment.x === newPos.x && segment.y === newPos.y);
    } while (isColliding);
    return newPos;
  };

  const resetGame = useCallback(() => {
    snake.current = [{ x: 10, y: 15 }, { x: 10, y: 16 }, { x: 10, y: 17 }];
    direction.current = 'UP';
    nextDirection.current = 'UP';
    food.current = getRandomPosition();
    lastTime.current = 0;
    accumulator.current = 0;
  }, []);

  // Initialize game when status changes to PLAYING from IDLE
  useEffect(() => {
    if (gameState.status === GameStatus.PLAYING && snake.current.length === 0) {
       resetGame();
    }
  }, [gameState.status, resetGame]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== GameStatus.PLAYING) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.current !== 'DOWN') nextDirection.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.current !== 'UP') nextDirection.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.current !== 'RIGHT') nextDirection.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.current !== 'LEFT') nextDirection.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status]);

  // Main Game Loop
  useEffect(() => {
    const render = (time: number) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const deltaTime = time - lastTime.current;
      lastTime.current = time;

      // Handle pause/idle/gameover by just drawing the last state, but not updating logic
      if (gameState.status !== GameStatus.PLAYING) {
        draw(ctx);
        frameId.current = requestAnimationFrame(render);
        return;
      }

      accumulator.current += deltaTime;

      // Update Logic at fixed time step defined by current speed
      if (accumulator.current >= gameState.speed) {
        update();
        accumulator.current = 0; // Reset or subtract (simple reset prevents spiral of death on lag)
      }

      draw(ctx);
      frameId.current = requestAnimationFrame(render);
    };

    const update = () => {
      // 1. Update Direction
      direction.current = nextDirection.current;

      // 2. Calculate New Head
      const head = { ...snake.current[0] };
      switch (direction.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // 3. Collision Detection (Walls)
      if (
        head.x < 0 ||
        head.x >= GRID_WIDTH ||
        head.y < 0 ||
        head.y >= GRID_HEIGHT
      ) {
        gameOver();
        return;
      }

      // 4. Collision Detection (Self)
      if (snake.current.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
      }

      // 5. Move Snake
      snake.current.unshift(head); // Add new head

      // 6. Check Food
      if (head.x === food.current.x && head.y === food.current.y) {
        playEatSound();
        const newScore = gameState.score + 10;
        const speedIncrease = (newScore / 10) % 5 === 0;
        
        // Update high score immediately in local storage if beaten
        const newHighScore = Math.max(newScore, gameState.highScore);
        if (newHighScore > gameState.highScore) {
          localStorage.setItem('snakeHighScore', newHighScore.toString());
        }

        setGameState(prev => ({
          ...prev,
          score: newScore,
          highScore: newHighScore,
          speed: speedIncrease ? Math.max(MIN_SPEED, prev.speed - SPEED_DECREMENT) : prev.speed
        }));

        food.current = getRandomPosition();
      } else {
        snake.current.pop(); // Remove tail if not eating
      }
    };

    const gameOver = () => {
      setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Clear background
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Grid (Optional, for retro feel)
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= CANVAS_WIDTH; x += CELL_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += CELL_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
      }
      ctx.stroke();

      // Draw Food
      const fx = food.current.x * CELL_SIZE + CELL_SIZE / 2;
      const fy = food.current.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Food Glow
      ctx.shadowColor = COLOR_FOOD;
      ctx.shadowBlur = 15;
      ctx.fillStyle = COLOR_FOOD;
      ctx.beginPath();
      ctx.arc(fx, fy, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow for snake

      // Draw Snake
      snake.current.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        const isHead = index === 0;

        ctx.fillStyle = isHead ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY;
        
        // Rounded rectangles for snake segments
        const radius = isHead ? 6 : 4;
        
        // Custom rounded rect implementation for clearer control
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, radius);
        ctx.fill();

        // Eyes for head
        if (isHead) {
           ctx.fillStyle = '#fff';
           const eyeOffset = 5;
           const eyeSize = 3;
           
           // Simple eye logic based on direction would go here, 
           // for now just centering them relative to movement is complex without extra state,
           // so we draw generic 'eyes' that look okay-ish or just keep it minimal.
           // Let's keep it minimal neon blocks as per design request.
        }
      });
    };

    // Start loop
    frameId.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId.current);
    };
  }, [gameState.speed, gameState.status, gameState.score, gameState.highScore, setGameState, resetGame]); // Added dependencies to satisfy linter, though refs are stable

  // Listen for reset trigger from parent
  useEffect(() => {
    if (gameState.status === GameStatus.IDLE) {
      resetGame();
    }
  }, [gameState.status, resetGame]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block rounded-lg shadow-2xl shadow-emerald-900/20 cursor-none"
      style={{
        maxWidth: '100%',
        maxHeight: '80vh',
        aspectRatio: `${GRID_WIDTH}/${GRID_HEIGHT}`
      }}
    />
  );
};
