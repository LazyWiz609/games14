import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Games from './pages/Games.jsx';
import Game1 from './pages/Games/1.jsx';
import Game2 from './pages/games/2.jsx';
import Game3 from './pages/games/3.jsx';
import Game4 from './pages/games/4.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BalloonGame from './pages/Games/1/Balloon.jsx';
import RewardGame from './pages/Games/1/Reward.jsx';
import GamblingGame from './pages/Games/1/Gambling.jsx';
import Register from './pages/Register.jsx';
function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
                <Route path="/games/1" element={<ProtectedRoute><Game1 /></ProtectedRoute>} />
                <Route path="/games/2" element={<ProtectedRoute><Game2 /></ProtectedRoute>} />
                <Route path="/games/3" element={<ProtectedRoute><Game3 /></ProtectedRoute>} />
                <Route path="/games/4" element={<ProtectedRoute><Game4 /></ProtectedRoute>} />
                <Route path="/games/1/balloon" element={<ProtectedRoute><BalloonGame /></ProtectedRoute>} />
                <Route path="/games/1/reward" element={<ProtectedRoute><RewardGame /></ProtectedRoute>} />
                <Route path="/games/1/gambling" element={<ProtectedRoute><GamblingGame /></ProtectedRoute>} />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
