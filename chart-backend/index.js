// index.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS so Angular can access this API
app.use(cors());

// Sample chart data (you can replace this with DB or file read later)
const chartData = [
  { country: 'USA', value: 2025 },
  { country: 'India', value: 1000 },
  { country: 'China', value: 1882 },
  { country: 'Germany', value: 1322 },
  { country: 'UK', value: 1122 },
  { country: 'France', value: 1114 }
];

// GET route to serve data
app.get('/data', (req, res) => {
  res.json(chartData);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
