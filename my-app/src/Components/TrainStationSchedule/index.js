import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { StationApi } from '../../shared/Api/OpenApi';
import './styles.css';

function TrainStationSchedule({ station }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (station) {
      const stationApi = new StationApi();

      const fetchSchedule = async () => {
        try {
          setLoading(true);
          const response = await stationApi.getSchedule(station);

          if (response?.schedule?.length) {
            setSchedule(response.schedule);
          } else {
            setError('Нет расписания для этой станции');
          }
        } catch (err) {
          setError('Ошибка при загрузке расписания');
        } finally {
          setLoading(false);
        }
      };

      fetchSchedule();
    }
  }, [station]);

  const filteredSchedule = schedule.filter((train) =>
    train.thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="stations-page__stations-list-container">
      <div className="stations-page__stations-list scrollable-list">
      <h1>Расписание для станции {station.title}</h1>
      <input
        type="text"
        placeholder="Поиск поезда..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
        {filteredSchedule.length > 0 ? (
          filteredSchedule.map((train) => (
            <div key={uuid()} className="station-item-card">
              <strong>Поезд:</strong> {train.thread.title} <br />
              <strong>Номер:</strong> {train.thread.number} <br />
              <strong>Направление:</strong> {train.thread.title} <br />
              <strong>Отправление:</strong>{' '}
              {new Date(train.departure).toLocaleString()} <br />
              <strong>Прибытие:</strong>{' '}
              {new Date(train.arrival).toLocaleString()} <br />
              <strong>Тип:</strong> {train.thread.transport_subtype.title}{' '}
              <br />
              <strong>Платформа:</strong> {train.platform || 'Не указана'}
            </div>
          ))
        ) : (
          <p className="no-results">Поезда не найдены</p>
        )}
      </div>
    </div>
  );
}

export default TrainStationSchedule;
