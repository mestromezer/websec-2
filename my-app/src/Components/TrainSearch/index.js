import { useState } from "react";
import { v4 as uuid } from "uuid";
import { StationApi } from "../../shared/Api/OpenApi";
import "./styles.css";

function TrainSearch({ stations }) {
    const [fromStation, setFromStation] = useState("");
    const [toStation, setToStation] = useState("");
    const [trains, setTrains] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!fromStation || !toStation || fromStation === toStation) {
            setError("Выберите две разные станции");
            return;
        }

        setLoading(true);
        setError(null);
        setTrains([]);

        try {
            const api = new StationApi();
            const response = await api.search(fromStation, toStation);

            if (response?.segments?.length) {
                setTrains(response.segments);
            } else {
                setError("Нет поездов между выбранными станциями");
            }
        } catch (err) {
            setError("Ошибка при загрузке данных");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stations-page__stations-list-container">
            <h3>Поиск поездов между станциями</h3>

            <div className="select-container">
                <select
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    className="station-select"
                >
                    <option value="">Откуда</option>
                    {stations.map((station) => (
                        <option key={uuid()} value={station.codes.yandex_code}>
                            {station.title}
                        </option>
                    ))}
                </select>

                <select
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    className="station-select"
                >
                    <option value="">Куда</option>
                    {stations.map((station) => (
                        <option key={uuid()} value={station.codes.yandex_code}>
                            {station.title}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={handleSearch} className="search-button" disabled={loading}>
                {loading ? "Поиск..." : "Найти поезда"}
            </button>

            {error && <p className="error">{error}</p>}

            <div className="stations-page__stations-list scrollable-list">
                {trains.length > 0 ? (
                    trains.map((train) => (
                        <div key={uuid()} className="station-item-card">
                            <strong>Поезд:</strong> {train.thread.title} <br />
                            <strong>Номер:</strong> {train.thread.number} <br />
                            <strong>Отправление:</strong> {new Date(train.departure).toLocaleString()} <br />
                            <strong>Прибытие:</strong> {new Date(train.arrival).toLocaleString()} <br />
                            <strong>В пути:</strong> {train.duration} секунд <br />
                            <strong>Тип:</strong> {train.thread.transport_subtype?.title || "Не указан"}
                        </div>
                    ))
                ) : (
                    <p className="no-results">Выберите станции и нажмите "Найти поезда"</p>
                )}
            </div>
        </div>
    );
}

export default TrainSearch;
