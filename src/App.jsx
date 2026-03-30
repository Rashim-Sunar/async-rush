import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Game from './pages/Game';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<GameWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

function GameWrapper() {
  return (
    <GameProvider>
      <GameBoard />
    </GameProvider>
  );
}