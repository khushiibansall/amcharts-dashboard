const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // 👈 to parse JSON bodies

// Show a message at root
app.get('/', (req, res) => {
  res.send('🎉 Welcome to the Chart Backend!');
});

// GET: Send chart data
app.get('/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Could not read data.json' });
  }
});

// ✅ POST: Receive new chart data from Angular
app.post('/data', (req, res) => {
  const newData = req.body;
  try {
    fs.writeFileSync('data.json', JSON.stringify(newData, null, 2));
    res.status(200).json({ message: 'Data saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write to data.json' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
