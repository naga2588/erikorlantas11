const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('SERVER ERI KORLANTAS AKTIF 🚀');
});

// API proxy
app.get('/api', async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).send('Parameter q wajib diisi!');
    }

    console.log('Request masuk:', q);

    const response = await axios.get(
      `http://76.13.193.106/tnkb_apis_final.php?q=${encodeURIComponent(q)}`
    );

    res.send(response.data);

  } catch (error) {
    console.log('ERROR API:', error.message);
    res.status(500).send('API ERROR');
  }
});

// WAJIB ADA INI
app.listen(3000, '0.0.0.0', () => {
  console.log('Server jalan di http://0.0.0.0:3000');
});
