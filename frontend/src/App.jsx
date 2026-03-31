import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import LevelSelect from './pages/LevelSelect';
import Game from './pages/Game';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/levels"
          element={(
            <ProtectedRoute>
              <LevelSelect />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/game"
          element={(
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}