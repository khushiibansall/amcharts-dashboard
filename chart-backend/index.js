// index.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

// Optional root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send('🎉 Welcome to the Chart Backend! Visit /data to see the chart data.');
});

// GET route that reads from data.json file
app.get('/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data.json' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
