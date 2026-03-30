import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import LevelSelect from './pages/LevelSelect';
import Game from './pages/Game';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}