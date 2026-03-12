import { useState, useEffect } from 'react';
import axios from 'axios';
import { playersData, inningsData, getLeaderboard, getPlayerById, getPlayerInnings } from '../data/staticData';

export function usePlayerData(playerId) {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);
        axios.get(`/api/players/${playerId}`)
            .then(res => { setPlayer(res.data); setError(null); })
            .catch(() => {
                const p = getPlayerById(playerId);
                if (p) { setPlayer(p); setError(null); }
                else setError('Player not found');
            })
            .finally(() => setLoading(false));
    }, [playerId]);

    return { player, loading, error };
}

export function usePlayersList() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('/api/players')
            .then(res => { setPlayers(res.data); setError(null); })
            .catch(() => { setPlayers(playersData); setError(null); })
            .finally(() => setLoading(false));
    }, []);

    return { players, loading, error };
}

export function useLeaderboard(role) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = role && role !== 'ALL' ? `?role=${role}` : '';
        axios.get(`/api/leaderboard${params}`)
            .then(res => { setPlayers(res.data); setError(null); })
            .catch(() => {
                let result = getLeaderboard();
                if (role && role !== 'ALL') result = result.filter(p => p.role === role);
                setPlayers(result);
                setError(null);
            })
            .finally(() => setLoading(false));
    }, [role]);

    return { players, loading, error };
}
