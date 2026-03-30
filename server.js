const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Временная база данных в памяти
let players = {};

// Интервал очистки неактивных (5 минут)
setInterval(() => {
    const now = Date.now();
    Object.keys(players).forEach(id => {
        if (now - players[id].lastSeen > 300000) delete players[id];
    });
}, 60000);

app.post('/api/sync', (req, res) => {
    const { id, name } = req.body;
    if (!id) return res.status(400).json({ error: "No ID" });

    if (!players[id]) {
        players[id] = { id, name, hp: 100, mp: 50, xp: 0, lvl: 1, lastSeen: Date.now() };
    } else {
        players[id].lastSeen = Date.now();
        players[id].name = name; // Обновляем имя если сменил в ТГ
    }

    res.json({
        user: players[id],
        others: Object.values(players).filter(p => p.id !== id)
    });
});

app.post('/api/action', (req, res) => {
    const { id, type } = req.body;
    const p = players[id];
    if (!p) return res.status(404).json({ error: "Join first" });

    if (type === 'wood') {
        p.xp += 20;
        if (p.xp >= p.lvl * 100) { p.lvl++; p.xp = 0; p.hp = 100; }
    } else if (type === 'story' && p.mp >= 10) {
        p.mp -= 10; p.xp += 40;
    } else if (type === 'rest') {
        p.hp = 100; p.mp = 50;
    }

    p.lastSeen = Date.now();
    res.json({ user: p, others: Object.values(players).filter(p => p.id !== id) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));