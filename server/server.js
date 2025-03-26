import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;
const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
const YANDEX_API_URL = 'https://api.rasp.yandex.net/v3.0';

if (!YANDEX_API_KEY) {
    console.error('YANDEX_API_KEY не указан в .env файле');
    process.exit(1);
}

app.use(express.json());

// Получение списка станций
app.get('/stations', async (req, res) => {
    try {
        const { lang } = req.query;
        const response = await axios.get(`${YANDEX_API_URL}/stations_list/`, {
            params: {
                apikey: YANDEX_API_KEY,
                lang: lang || 'ru_RU'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение расписания на станции
app.get('/schedule', async (req, res) => {
    try {
        const { station, date, transport_types, event } = req.query;
        if (!station) {
            return res.status(400).json({ error: 'Не указан station' });
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
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получение расписания между двумя станциями
app.get('/route', async (req, res) => {
    try {
        const { from, to, date, transport_types } = req.query;
        if (!from || !to) {
            return res.status(400).json({ error: 'Не указаны from и to' });
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
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});