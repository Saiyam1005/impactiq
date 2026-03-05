import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/compare', label: 'Compare' },
    { to: '/live', label: 'Live Impact' },
    { to: '/methodology', label: 'Methodology' },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/leaderboard?search=${encodeURIComponent(search.trim())}`);
            setSearch('');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-primary/95 backdrop-blur-md border-b border-border-subtle">
            <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-cyan text-2xl">⚡</span>
                    <span className="font-display text-2xl text-text-primary tracking-wide group-hover:text-cyan transition-colors">
                        ImpactIQ
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(l => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            className={({ isActive }) =>
                                `px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? 'text-cyan border-b-2 border-cyan'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                                }`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </div>

                {/* Right section */}
                <div className="hidden md:flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search players..."
                            className="bg-bg-card border border-border-subtle rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder-text-muted w-44 focus:w-56 focus:border-cyan focus:outline-none transition-all duration-300"
                        />
                    </form>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red rounded-full pulse-dot"></span>
                        <span className="text-red text-xs font-semibold">LIVE</span>
                    </div>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden text-text-primary p-2"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {menuOpen ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-bg-primary border-b border-border-subtle overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map(l => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-cyan bg-bg-card' : 'text-text-secondary hover:text-text-primary'
                                        }`
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                            <form onSubmit={handleSearch} className="pt-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search players..."
                                    className="w-full bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-cyan focus:outline-none"
                                />
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
