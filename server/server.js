import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 7777;
const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
const YANDEX_API_URL = 'https://api.rasp.yandex.net/v3.0';

const cache = {
  stations: null,
  schedule: {},
  route: {}
};

if (!YANDEX_API_KEY) {
  console.error('YANDEX_API_KEY не указан в .env файле');
  process.exit(1);
}

app.get('/stations', async (req, res) => {
  try {
    const { lang } = req.query;

    if (cache.stations) {
      console.log('Ответ из кеша (stations)');
      return res.json(cache.stations);
    }

    const response = await axios.get(`${YANDEX_API_URL}/stations_list/`, {
      params: {
        apikey: YANDEX_API_KEY,
        lang: lang || 'ru_RU'
      }
    });

    cache.stations = response.data;

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/schedule', async (req, res) => {
  try {
    const { station, date, transport_types, event } = req.query;
    if (!station) {
      return res.status(400).json({ error: 'Не указан station' });
    }

    const cacheKey = `${station}-${date || new Date().toISOString().split('T')[0]}`;
    if (cache.schedule[cacheKey]) {
      console.log('Ответ из кеша (schedule)');
      return res.json(cache.schedule[cacheKey]);
    }

    const response = await axios.get(`${YANDEX_API_URL}/schedule/`, {
      params: {
        apikey: YANDEX_API_KEY,
        station,
        date: date || new Date().toISOString().split('T')[0],
        transport_types,
        event
      }
    });

    cache.schedule[cacheKey] = response.data;

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/route', async (req, res) => {
  try {
    const { from, to, date, transport_types } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Не указаны from и to' });
    }

    const cacheKey = `${from}-${to}-${date || new Date().toISOString().split('T')[0]}`;
    if (cache.route[cacheKey]) {
      console.log('Ответ из кеша (route)');
      return res.json(cache.route[cacheKey]);
    }

    const response = await axios.get(`${YANDEX_API_URL}/search/`, {
      params: {
        apikey: YANDEX_API_KEY,
        from,
        to,
        date: date || new Date().toISOString().split('T')[0],
        transport_types
      }
    });

    cache.route[cacheKey] = response.data;

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
