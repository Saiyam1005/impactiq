import { useState, useEffect } from 'react';
import axios from 'axios';

export function usePlayerData(playerId) {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!playerId) return;
        setLoading(true);
        axios.get(`/api/players/${playerId}`)
            .then(res => { setPlayer(res.data); setError(null); })
            .catch(err => setError(err.message))
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
            .catch(err => setError(err.message))
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
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [role]);

    return { players, loading, error };
}
