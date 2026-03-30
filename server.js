const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// База данных в памяти (МУЛЬТИПЛЕЕР)
let players = {};

// Главная страница
app.get('/', (req, res) => {
  res.send('Сервер PSTEAMCAMP работает! 🔥');
});

// Синхронизация данных
app.post('/api/sync', (req, res) => {
  const { id, name } = req.body;
  if (!id) return res.status(400).json({ error: "No ID provided" });
  
  // Создаем игрока, если его нет
  if (!players[id]) {
    players[id] = { id, name: name || "Guest", hp: 100, mp: 50, lvl: 1, xp: 0, wood: 5 }; // Начинаем с 5 дров
  } else {
    players[id].name = name; // Обновляем имя
  }
  
  const others = Object.values(players).filter(p => p.id !== id);
  res.json({ user: players[id], others });
});

// Действие
app.post('/api/action', (req, res) => {
  const { id, type } = req.body;
  if (!players[id]) return res.status(404).send("Player not found");

  const player = players[id];

  if (type === 'wood') {
    // Подкинуть дров
    if (player.wood > 0) {
      player.wood -= 1;
      player.xp += 10;
      if (player.hp < 100) player.hp = Math.min(100, player.hp + 5); // Подкидывание немного лечит
    } else {
      return res.status(400).json({ error: "No wood left!" });
    }
  } else if (type === 'gather') {
    // Сбор хвороста
    if (player.hp >= 10) {
      player.hp -= 10;
      player.wood += 3;
      player.xp += 5;
    } else {
      return res.status(400).json({ error: "Too tired to gather!" });
    }
  }
  
  const others = Object.values(players).filter(p => p.id !== id);
  res.json({ user: player, others });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});