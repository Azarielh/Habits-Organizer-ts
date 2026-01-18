const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/habits', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/habits', (req, res) => {
  const newHabit = req.body;
  if (!newHabit || !newHabit.name) return res.status(400).json({ error: 'Invalid habit' });

  const data = readData();
  // prevent duplicate by name
  const exists = data.find(h => h.name === newHabit.name);
  if (!exists) data.push(Object.assign({ done: false, createdAt: Date.now() }, newHabit));
  writeData(data);
  res.json(data);
});

app.post('/api/toggle-habit', (req, res) => {
  const { name, done } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Missing name' });

  const data = readData();
  const idx = data.findIndex(h => h.name === name);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx].done = !!done;
  writeData(data);
  res.json(data);
});

app.post('/api/delete-habit', (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Missing name' });

  let data = readData();
  data = data.filter(h => h.name !== name);
  writeData(data);
  res.json(data);
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Habits backend listening on ${port}`));
