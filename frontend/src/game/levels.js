export const LEVELS = [
  {
    id: 1,
    title: "Hello, Sync World!",
    description: "Learn how synchronous code runs on the Call Stack",
    hint: "Synchronous code runs line by line, top to bottom!",
    code: [
      { text: 'console.log("Hello");', type: 'sync', color: '#4ade80' },
      { text: 'console.log("World");', type: 'sync', color: '#4ade80' },
      { text: 'console.log("!");', type: 'sync', color: '#4ade80' },
    ],
    balls: [
      { id: 'b1', label: '"Hello"', type: 'sync', target: 'callstack' },
      { id: 'b2', label: '"World"', type: 'sync', target: 'callstack' },
      { id: 'b3', label: '"!"', type: 'sync', target: 'callstack' },
    ],
    placementOrder: ['b1', 'b2', 'b3'],
    flow: [
      { ballId: 'b1', type: 'execute', component: 'callstack', output: 'Hello', animationPath: ['callstack'] },
      { ballId: 'b2', type: 'execute', component: 'callstack', output: 'World', animationPath: ['callstack'] },
      { ballId: 'b3', type: 'execute', component: 'callstack', output: '!', animationPath: ['callstack'] },
    ],
  },

  {
    id: 2,
    title: "Promise Me This",
    description: "Promises create microtasks that run after sync code",
    hint: "Microtasks (Promises) run AFTER all synchronous code, but BEFORE macrotasks!",
    code: [
      { text: 'console.log("Start");', type: 'sync', color: '#4ade80' },
      { text: 'Promise.resolve().then(() =>', type: 'promise', color: '#c084fc' },
      { text: '  console.log("Promise")', type: 'promise', color: '#c084fc' },
      { text: ');', type: 'promise', color: '#c084fc' },
      { text: 'console.log("End");', type: 'sync', color: '#4ade80' },
    ],
    balls: [
      { id: 'b1', label: '"Start"', type: 'sync', target: 'callstack' },
      { id: 'b2', label: '"Promise"', type: 'promise', target: 'microtask' },
      { id: 'b3', label: '"End"', type: 'sync', target: 'callstack' },
    ],
    placementOrder: ['b1', 'b2', 'b3'],
    flow: [
      { ballId: 'b1', type: 'execute', component: 'callstack', output: 'Start', animationPath: ['callstack'] },
      { ballId: 'b2', type: 'schedule', component: 'microtask', output: null, animationPath: ['callstack', 'microtask'] },
      { ballId: 'b3', type: 'execute', component: 'callstack', output: 'End', animationPath: ['callstack'] },
      { ballId: 'b2', type: 'execute', component: 'callstack', output: 'Promise', animationPath: ['microtask', 'callstack'] },
    ],
  },

  {
    id: 3,
    title: "Timeout Trickery",
    description: "setTimeout creates macrotasks via the Web API",
    hint: "setTimeout goes to Web API first, then to the Macrotask Queue!",
    code: [
      { text: 'console.log("First");', type: 'sync', color: '#4ade80' },
      { text: 'setTimeout(() => {', type: 'timeout', color: '#60a5fa' },
      { text: '  console.log("Timeout")', type: 'timeout', color: '#60a5fa' },
      { text: '}, 0);', type: 'timeout', color: '#60a5fa' },
      { text: 'console.log("Last");', type: 'sync', color: '#4ade80' },
    ],
    balls: [
      { id: 'b1', label: '"First"', type: 'sync', target: 'callstack' },
      { id: 'b2', label: '"Timeout"', type: 'timeout', target: 'macrotask' },
      { id: 'b3', label: '"Last"', type: 'sync', target: 'callstack' },
    ],
    placementOrder: ['b1', 'b2', 'b3'],
    flow: [
      { ballId: 'b1', type: 'execute', component: 'callstack', output: 'First', animationPath: ['callstack'] },
      { ballId: 'b2', type: 'schedule', component: 'macrotask', output: null, animationPath: ['callstack', 'webapi', 'macrotask'] },
      { ballId: 'b3', type: 'execute', component: 'callstack', output: 'Last', animationPath: ['callstack'] },
      { ballId: 'b2', type: 'execute', component: 'callstack', output: 'Timeout', animationPath: ['macrotask', 'callstack'] },
    ],
  },

  {
    id: 4,
    title: "The Grand Finale",
    description: "Combine sync, Promises, and setTimeout!",
    hint: "Order: Sync first, then Microtasks (Promise), then Macrotasks (setTimeout)",
    code: [
      { text: 'console.log("Start");', type: 'sync', color: '#4ade80' },
      { text: 'setTimeout(() =>', type: 'timeout', color: '#60a5fa' },
      { text: '  console.log("Timeout"), 0);', type: 'timeout', color: '#60a5fa' },
      { text: 'Promise.resolve().then(() =>', type: 'promise', color: '#c084fc' },
      { text: '  console.log("Promise"));', type: 'promise', color: '#c084fc' },
      { text: 'console.log("End");', type: 'sync', color: '#4ade80' },
    ],
    balls: [
      { id: 'b1', label: '"Start"', type: 'sync', target: 'callstack' },
      { id: 'b2', label: '"Timeout"', type: 'timeout', target: 'macrotask' },
      { id: 'b3', label: '"Promise"', type: 'promise', target: 'microtask' },
      { id: 'b4', label: '"End"', type: 'sync', target: 'callstack' },
    ],
    placementOrder: ['b1', 'b2', 'b3', 'b4'],
    flow: [
      { ballId: 'b1', type: 'execute', component: 'callstack', output: 'Start', animationPath: ['callstack'] },
      { ballId: 'b2', type: 'schedule', component: 'macrotask', output: null, animationPath: ['callstack', 'webapi', 'macrotask'] },
      { ballId: 'b3', type: 'schedule', component: 'microtask', output: null, animationPath: ['callstack', 'microtask'] },
      { ballId: 'b4', type: 'execute', component: 'callstack', output: 'End', animationPath: ['callstack'] },
      { ballId: 'b3', type: 'execute', component: 'callstack', output: 'Promise', animationPath: ['microtask', 'callstack'] },
      { ballId: 'b2', type: 'execute', component: 'callstack', output: 'Timeout', animationPath: ['macrotask', 'callstack'] },
    ],
  },
];

export const TYPE_COLORS = {
  sync: { bg: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', dark: '#052e16' },
  promise: { bg: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)', dark: '#3b0764' },
  timeout: { bg: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', dark: '#1e3a5f' },
};

export const TASK_COLOR_POOL = [
  { bg: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)', dark: '#052e16' },
  { bg: '#c084fc', glow: 'rgba(192, 132, 252, 0.5)', dark: '#3b0764' },
  { bg: '#60a5fa', glow: 'rgba(96, 165, 250, 0.5)', dark: '#1e3a5f' },
  { bg: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)', dark: '#831843' },
  { bg: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', dark: '#451a03' },
  { bg: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.5)', dark: '#042f2e' },
];

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createRandomBallColorMap(level) {
  const shuffledPool = shuffleArray(TASK_COLOR_POOL);

  return level.balls.reduce((acc, ball, index) => {
    acc[ball.id] = shuffledPool[index % shuffledPool.length];
    return acc;
  }, {});
}

export function applyBallColorsToLevel(level, ballColors) {
  const findBallColorForLine = (lineText) => {
    const loweredLine = lineText.toLowerCase();
    const matchedBall = level.balls.find((ball) => {
      const cleanLabel = ball.label.replace(/"/g, '').toLowerCase();
      return cleanLabel && loweredLine.includes(cleanLabel);
    });

    if (matchedBall) {
      return ballColors[matchedBall.id];
    }

    const randomIndex = Math.floor(Math.random() * TASK_COLOR_POOL.length);
    return TASK_COLOR_POOL[randomIndex];
  };

  return {
    ...level,
    code: level.code.map((line) => ({
      ...line,
      color: findBallColorForLine(line.text).bg,
    })),
    balls: level.balls.map((ball) => ({
      ...ball,
      colorStyle: ballColors[ball.id] || TYPE_COLORS[ball.type],
    })),
  };
}

export const ENGINE_COMPONENTS = [
  { id: 'callstack', label: 'Call Stack', color: '#2dd4bf', borderColor: 'rgba(45, 212, 191, 0.4)', bgColor: 'rgba(45, 212, 191, 0.08)' },
  { id: 'webapi', label: 'Web API', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', bgColor: 'rgba(251, 191, 36, 0.08)' },
  { id: 'microtask', label: 'Microtask Queue', color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.4)', bgColor: 'rgba(251, 113, 133, 0.08)' },
  { id: 'macrotask', label: 'Macrotask Queue', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', bgColor: 'rgba(56, 189, 248, 0.08)' },
];
