import { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { LEVELS } from './levels';

const initialState = {
  currentLevelIndex: 0,
  currentPlacementIndex: 0,
  currentFlowIndex: 0,
  currentAnimWaypoint: 0,
  phase: 'drag',
  score: 0,
  totalMoves: 0,
  wrongMoves: 0,
  outputs: [],
  placedBalls: {},
  remainingBalls: [],
  executedBalls: [],
  feedback: null,
  showLevelComplete: false,
  animatingBall: null,
  eventLoopActive: false,
  allPlaced: false,
  scheduledBalls: [],
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
        currentPlacementIndex: 0,
        currentFlowIndex: 0,
        currentAnimWaypoint: 0,
        phase: 'drag',
        outputs: [],
        placedBalls: {},
        remainingBalls: lvl.balls.map(b => b.id),
        executedBalls: [],
        feedback: null,
        showLevelComplete: false,
        wrongMoves: 0,
        totalMoves: 0,
        animatingBall: null,
        eventLoopActive: false,
        allPlaced: false,
        scheduledBalls: [],
      };
    }

    case 'PLACE_BALL': {
      const { ballId, componentId } = action;
      const expectedBallId = level.placementOrder[state.currentPlacementIndex];
      const expectedBall = level.balls.find(b => b.id === expectedBallId);

      if (!expectedBall) return state;

      if (ballId === expectedBallId && componentId === expectedBall.target) {
        const newPlaced = { ...state.placedBalls };
        if (!newPlaced[componentId]) newPlaced[componentId] = [];
        newPlaced[componentId] = [...newPlaced[componentId], ballId];

        const nextPlacementIndex = state.currentPlacementIndex + 1;
        const allPlaced = nextPlacementIndex >= level.placementOrder.length;

        return {
          ...state,
          currentPlacementIndex: nextPlacementIndex,
          placedBalls: newPlaced,
          remainingBalls: state.remainingBalls.filter(id => id !== ballId),
          feedback: { type: 'success', ballId, message: 'Correct!' },
          totalMoves: state.totalMoves + 1,
          allPlaced,
          phase: allPlaced ? 'ready' : 'drag',
        };
      } else {
        let message = 'Try again!';
        if (ballId !== expectedBallId) {
          const expectedLabel = expectedBall.label;
          message = `Place ${expectedLabel} first!`;
        } else {
          message = `Wrong component!`;
        }
        return {
          ...state,
          feedback: { type: 'error', ballId, message },
          wrongMoves: state.wrongMoves + 1,
          totalMoves: state.totalMoves + 1,
        };
      }
    }

    case 'START_EXECUTION': {
      if (!state.allPlaced) return state;
      const firstStep = level.flow[0];
      if (!firstStep) return state;

      return {
        ...state,
        phase: 'animating',
        currentFlowIndex: 0,
        currentAnimWaypoint: firstStep.animationPath.length > 1 ? 1 : 0,
        animatingBall: {
          ballId: firstStep.ballId,
          path: firstStep.animationPath,
          waypointIndex: firstStep.animationPath.length > 1 ? 1 : 0,
          from: firstStep.animationPath[0],
          to: firstStep.animationPath.length > 1 ? firstStep.animationPath[1] : firstStep.animationPath[0],
        },
        eventLoopActive: false,
      };
    }

    case 'ADVANCE_WAYPOINT': {
      const currentStep = level.flow[state.currentFlowIndex];
      if (!currentStep) return state;

      const path = currentStep.animationPath;
      const nextWaypoint = state.currentAnimWaypoint + 1;

      if (nextWaypoint >= path.length) {
        return state;
      }

      const isQueueToCallstack = (
        (path[nextWaypoint - 1] === 'microtask' || path[nextWaypoint - 1] === 'macrotask') &&
        path[nextWaypoint] === 'callstack'
      );

      return {
        ...state,
        currentAnimWaypoint: nextWaypoint,
        animatingBall: {
          ballId: currentStep.ballId,
          path: path,
          waypointIndex: nextWaypoint,
          from: path[nextWaypoint - 1],
          to: path[nextWaypoint],
        },
        eventLoopActive: isQueueToCallstack,
      };
    }

    case 'FINISH_FLOW_STEP': {
      const currentStep = level.flow[state.currentFlowIndex];
      if (!currentStep) return state;

      const newPlaced = { ...state.placedBalls };
      let newlyScheduled = [...state.scheduledBalls];
      let newOutputs = [...state.outputs];
      let newExecuted = [...state.executedBalls];
      let scoreAdd = 0;

      if (currentStep.type === 'schedule') {
        newlyScheduled.push(currentStep.ballId);
      } else {
        // execute
        Object.keys(newPlaced).forEach(key => {
          newPlaced[key] = newPlaced[key].filter(id => id !== currentStep.ballId);
        });
        newlyScheduled = newlyScheduled.filter(id => id !== currentStep.ballId);
        
        if (currentStep.output) {
          newOutputs.push(currentStep.output);
        }
        newExecuted.push(currentStep.ballId);
        
        const baseScore = 100;
        const penalty = state.wrongMoves * 10;
        scoreAdd = Math.max(baseScore - penalty, 10);
      }

      const nextFlowIndex = state.currentFlowIndex + 1;
      const isLastStep = nextFlowIndex >= level.flow.length;

      if (isLastStep) {
        return {
          ...state,
          currentFlowIndex: nextFlowIndex,
          outputs: newOutputs,
          executedBalls: newExecuted,
          placedBalls: newPlaced,
          scheduledBalls: newlyScheduled,
          score: state.score + scoreAdd,
          phase: 'complete',
          showLevelComplete: true,
          animatingBall: null,
          eventLoopActive: false,
          feedback: null,
        };
      }

      const nextStep = level.flow[nextFlowIndex];
      return {
        ...state,
        currentFlowIndex: nextFlowIndex,
        currentAnimWaypoint: nextStep.animationPath.length > 1 ? 1 : 0,
        outputs: newOutputs,
        executedBalls: newExecuted,
        placedBalls: newPlaced,
        scheduledBalls: newlyScheduled,
        score: state.score + scoreAdd,
        phase: 'animating',
        animatingBall: {
          ballId: nextStep.ballId,
          path: nextStep.animationPath,
          waypointIndex: nextStep.animationPath.length > 1 ? 1 : 0,
          from: nextStep.animationPath[0],
          to: nextStep.animationPath.length > 1 ? nextStep.animationPath[1] : nextStep.animationPath[0],
        },
        eventLoopActive: false,
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
        currentPlacementIndex: 0,
        currentFlowIndex: 0,
        currentAnimWaypoint: 0,
        phase: 'drag',
        outputs: [],
        placedBalls: {},
        remainingBalls: nextLvl.balls.map(b => b.id),
        executedBalls: [],
        feedback: null,
        showLevelComplete: false,
        wrongMoves: 0,
        totalMoves: 0,
        animatingBall: null,
        eventLoopActive: false,
        allPlaced: false,
        scheduledBalls: [],
      };
    }

    case 'RESET_LEVEL': {
      const lvl = LEVELS[state.currentLevelIndex];
      return {
        ...state,
        currentPlacementIndex: 0,
        currentFlowIndex: 0,
        currentAnimWaypoint: 0,
        phase: 'drag',
        outputs: [],
        placedBalls: {},
        remainingBalls: lvl.balls.map(b => b.id),
        executedBalls: [],
        feedback: null,
        showLevelComplete: false,
        wrongMoves: 0,
        totalMoves: 0,
        animatingBall: null,
        eventLoopActive: false,
        allPlaced: false,
        scheduledBalls: [],
      };
    }

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    remainingBalls: LEVELS[0].balls.map(b => b.id),
  });

  const componentRefs = useRef({});

  const registerComponentRef = useCallback((id, element) => {
    componentRefs.current[id] = element;
  }, []);

  const getComponentRect = useCallback((id) => {
    const el = componentRefs.current[id];
    if (el) return el.getBoundingClientRect();
    return null;
  }, []);

  const initLevel = useCallback((levelIndex) => {
    dispatch({ type: 'INIT_LEVEL', levelIndex });
  }, []);

  const placeBall = useCallback((ballId, componentId) => {
    dispatch({ type: 'PLACE_BALL', ballId, componentId });
  }, []);

  const startExecution = useCallback(() => {
    dispatch({ type: 'START_EXECUTION' });
  }, []);

  const advanceWaypoint = useCallback(() => {
    dispatch({ type: 'ADVANCE_WAYPOINT' });
  }, []);

  const finishFlowStep = useCallback(() => {
    dispatch({ type: 'FINISH_FLOW_STEP' });
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
    componentRefs,
    registerComponentRef,
    getComponentRect,
    actions: {
      initLevel,
      placeBall,
      startExecution,
      advanceWaypoint,
      finishFlowStep,
      clearFeedback,
      nextLevel,
      resetLevel,
      setPhase,
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
