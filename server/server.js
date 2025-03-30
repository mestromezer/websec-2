import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "optionsSuccessStatus": 200
}

const PORT = process.env.PORT || 7777;
const YANDEX_API_KEY = 'd67aac14-fddc-4533-8b6b-a89a21584ad4';//process.env.YANDEX_API_KEY;
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

app.get('/stations',  async (req, res) => {
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

app.get("/schedule", async (req, res) => {
    try {
        req.query.apikey = YANDEX_API_KEY;
        const requestUrl = new URLSearchParams(req.query);
        const response = await fetch(`${YANDEX_API_URL}/schedule/?` + requestUrl.toString());
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error("Ошибка запроса к API:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get('/search',  async (req, res) => {
  try {
    req.query.apikey = YANDEX_API_KEY;
    const requestUrl = new URLSearchParams(req.query);
    const response = await fetch(`${YANDEX_API_URL}/search/?` + requestUrl.toString());
    const data = await response.json();
    return res.json(data);
} catch (error) {
    console.error("Ошибка запроса к API:", error);
    res.status(500).json({ error: "Ошибка сервера" });
}
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
