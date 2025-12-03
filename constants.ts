// Grid settings
export const CELL_SIZE = 20;
export const GRID_WIDTH = 30; // 600px
export const GRID_HEIGHT = 20; // 400px
export const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE;

// Game mechanics
export const INITIAL_SPEED = 150; // ms per frame
export const MIN_SPEED = 50;
export const SPEED_DECREMENT = 5;
export const SPEED_INCREMENT_STEP = 5; // Every 5 apples

// Colors
export const COLOR_BG = '#0f172a'; // slate-900
export const COLOR_GRID = '#1e293b'; // slate-800
export const COLOR_SNAKE_HEAD = '#10b981'; // emerald-500
export const COLOR_SNAKE_BODY = '#34d399'; // emerald-400
export const COLOR_FOOD = '#ef4444'; // red-500
