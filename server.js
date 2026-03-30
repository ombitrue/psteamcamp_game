const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Разрешаем запросы с GitHub Pages
app.use(express.json());

let players = {};

// Это исправит ошибку "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Сервер PSTEAMCAMP работает! 🔥');
});

app.post('/api/sync', (req, res) => {
  const { id, name } = req.body;
  if (!id) return res.status(400).json({ error: "No ID provided" });
  
  if (!players[id]) {
    players[id] = { id, name: name || "Guest", hp: 100, mp: 50, lvl: 1, xp: 0 };
  }
  
  const others = Object.values(players).filter(p => p.id !== id);
  res.json({ user: players[id], others });
});

app.post('/api/action', (req, res) => {
  const { id, type } = req.body;
  if (!players[id]) return res.status(404).send("Player not found");

  if (type === 'wood') {
    players[id].xp += 5;
  }
  
  const others = Object.values(players).filter(p => p.id !== id);
  res.json({ user: players[id], others });
});

// Render сам назначит порт через process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});