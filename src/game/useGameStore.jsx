import { createContext, useContext, useReducer, useCallback } from 'react';
import { LEVELS } from './levels';

/**
 * Game State Management (Context + useReducer)
 * Handles: level progression, ball placement, execution flow, scoring
 */

const initialState = {
  currentLevelIndex: 0,
  currentStepIndex: 0,
  phase: 'drag',        // 'drag' | 'execute' | 'animating' | 'complete'
  score: 0,
  totalMoves: 0,
  wrongMoves: 0,
  outputs: [],           // strings that appear in terminal
  placedBalls: {},        // { componentId: [ballId, ...] }
  remainingBalls: [],     // balls still in the tray
  executedBalls: [],      // balls that have been executed
  feedback: null,         // { type: 'success'|'error', ballId, message } or null
  showLevelComplete: false,
};

function getLevel(state) {
  return LEVELS[state.currentLevelIndex];
}

function gameReducer(state, action) {
  const level = getLevel(state);

  switch (action.type) {
    case 'INIT_LEVEL': {
      const lvl = LEVELS[action.levelIndex ?? state.currentLevelIndex];
      return {
        ...state,
        currentLevelIndex: action.levelIndex ?? state.currentLevelIndex,
        currentStepIndex: 0,
        phase: 'drag',
        outputs: [],
        placedBalls: {},
        remainingBalls: lvl.balls.map(b => b.id),
        executedBalls: [],
        feedback: null,
        showLevelComplete: false,
        wrongMoves: 0,
        totalMoves: 0,
      };
    }

    case 'PLACE_BALL': {
      const { ballId, componentId } = action;
      const expectedStep = level.flow[state.currentStepIndex];

      // Validate: is this the correct ball in the correct component?
      if (expectedStep && expectedStep.ballId === ballId && expectedStep.component === componentId) {
        // Correct placement!
        const newPlaced = { ...state.placedBalls };
        if (!newPlaced[componentId]) newPlaced[componentId] = [];
        newPlaced[componentId] = [...newPlaced[componentId], ballId];

        return {
          ...state,
          placedBalls: newPlaced,
          remainingBalls: state.remainingBalls.filter(id => id !== ballId),
          feedback: { type: 'success', ballId, message: 'Correct! 🎉' },
          totalMoves: state.totalMoves + 1,
          phase: 'execute', // ready to execute this step
        };
      } else {
        // Wrong placement
        return {
          ...state,
          feedback: { type: 'error', ballId, message: 'Try again! 🤔' },
          wrongMoves: state.wrongMoves + 1,
          totalMoves: state.totalMoves + 1,
        };
      }
    }

    case 'EXECUTE_STEP': {
      const expectedStep = level.flow[state.currentStepIndex];
      if (!expectedStep) return state;

      const nextStepIndex = state.currentStepIndex + 1;
      const isLastStep = nextStepIndex >= level.flow.length;

      // Remove ball from placed, add to executed, add output
      const newPlaced = { ...state.placedBalls };
      const comp = expectedStep.component;
      if (newPlaced[comp]) {
        newPlaced[comp] = newPlaced[comp].filter(id => id !== expectedStep.ballId);
      }

      const baseScore = 100;
      const penalty = state.wrongMoves * 10;
      const stepScore = Math.max(baseScore - penalty, 10);

      return {
        ...state,
        currentStepIndex: nextStepIndex,
        outputs: [...state.outputs, expectedStep.output],
        executedBalls: [...state.executedBalls, expectedStep.ballId],
        placedBalls: newPlaced,
        score: state.score + stepScore,
        phase: isLastStep ? 'complete' : 'drag',
        showLevelComplete: isLastStep,
        feedback: null,
      };
    }

    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'CLEAR_FEEDBACK':
      return { ...state, feedback: null };

    case 'NEXT_LEVEL': {
      const nextIndex = Math.min(state.currentLevelIndex + 1, LEVELS.length - 1);
      const nextLvl = LEVELS[nextIndex];
      return {
        ...state,
        currentLevelIndex: nextIndex,
        currentStepIndex: 0,
        phase: 'drag',
        outputs: [],
        placedBalls: {},
        remainingBalls: nextLvl.balls.map(b => b.id),
        executedBalls: [],
        feedback: null,
        showLevelComplete: false,
        wrongMoves: 0,
        totalMoves: 0,
      };
    }

    case 'RESET_LEVEL': {
      const lvl = LEVELS[state.currentLevelIndex];
      return {
        ...state,
        currentStepIndex: 0,
        phase: 'drag',
        outputs: [],
        placedBalls: {},
        remainingBalls: lvl.balls.map(b => b.id),
        executedBalls: [],
        feedback: null,
        showLevelComplete: false,
        wrongMoves: 0,
        totalMoves: 0,
      };
    }

    default:
      return state;
  }
}

// Create Context
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    remainingBalls: LEVELS[0].balls.map(b => b.id),
  });

  // Memoized dispatch wrappers
  const initLevel = useCallback((levelIndex) => {
    dispatch({ type: 'INIT_LEVEL', levelIndex });
  }, []);

  const placeBall = useCallback((ballId, componentId) => {
    dispatch({ type: 'PLACE_BALL', ballId, componentId });
  }, []);

  const executeStep = useCallback(() => {
    dispatch({ type: 'EXECUTE_STEP' });
  }, []);

  const clearFeedback = useCallback(() => {
    dispatch({ type: 'CLEAR_FEEDBACK' });
  }, []);

  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
  }, []);

  const resetLevel = useCallback(() => {
    dispatch({ type: 'RESET_LEVEL' });
  }, []);

  const setPhase = useCallback((phase) => {
    dispatch({ type: 'SET_PHASE', phase });
  }, []);

  const value = {
    ...state,
    level: LEVELS[state.currentLevelIndex],
    actions: { initLevel, placeBall, executeStep, clearFeedback, nextLevel, resetLevel, setPhase },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
