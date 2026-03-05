import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PlayerProfile from './pages/PlayerProfile';
import Leaderboard from './pages/Leaderboard';
import HeadToHead from './pages/HeadToHead';
import Methodology from './pages/Methodology';
import LiveImpact from './pages/LiveImpact';

export default function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-bg-primary font-body">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/players/:id" element={<PlayerProfile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/compare" element={<HeadToHead />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/live" element={<LiveImpact />} />
                </Routes>
                <Toaster position="bottom-right" />
            </div>
        </BrowserRouter>
    );
}
