import './App.css';
import { StationApi } from './shared/Api/OpenApi';
import StationsList from './Components/StationsList';
import MapPopup from './Components/MapPopup';
import TrainStationSchedule from './Components/TrainStationSchedule';
import TrainSearch from "./Components/TrainSearch";

import { useEffect, useRef, useState, useMemo } from 'react';
import { Map, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import 'ol/ol.css';
import { toMercator } from '@turf/projection';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import trainStationIcon from './/Components/assets/trainStation.svg'; // Иконка станции

function App() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [popupContent, setPopupContent] = useState('');
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [viewMode, setViewMode] = useState("stations");

  const fetchStations = async () => {
    const stationsApi = new StationApi();
    const res = await stationsApi.getAllStations();
    if (res && res.countries) {
      const ruRegions = res.countries.find(
        (elem) => elem.title === 'Россия'
      ).regions;
      const allStations = ruRegions
        .reduce(
          (acc, currItem) => [
            ...acc,
            ...currItem.settlements.reduce(
              (acc, currItem) => [...acc, ...currItem.stations],
              []
            ),
          ],
          []
        )
        .filter(
          (item) =>
            item.transport_type === 'train' &&
            item.codes.esr_code &&
            (item.codes.esr_code.startsWith('63') ||
              item.codes.esr_code.startsWith('64') ||
              item.codes.esr_code.startsWith('65'))
        );

      setStations(allStations);
    }
  };

  useEffect(() => {
    fetchStations();

    if (mapRef.current) return;

    mapRef.current = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [5584030.684758671, 7021364.820491779],
        zoom: 10,
        maxZoom: 18,
      }),
    });

    popupRef.current = new Overlay({
      element: document.getElementById('popup'),
      positioning: 'bottom-center',
      stopEvent: false,
    });
    mapRef.current.addOverlay(popupRef.current);
  }, []);

  const showOnMapHandler = (evtOrStationName) => {
    if (evtOrStationName && evtOrStationName.pixel) {
      const feature = mapRef.current
        .getFeaturesAtPixel(evtOrStationName.pixel)
        .find((f) => f.get('stationInfo'));

      if (feature) {
        const station = feature.get('stationInfo');
        setSelectedStation(station);
        const content = `
          <div>
            <h4>${station.title}</h4>
            <p>Направление: ${station.direction}</p>
            <p>Код Яндекс: ${station.codes.yandex_code}</p>
          </div>
        `;
        setPopupContent(content);
        const coordinate = feature.getGeometry().getCoordinates();
        popupRef.current.setPosition(coordinate);
        mapRef.current.getView().setCenter(coordinate);
      } else {
        popupRef.current.setPosition(undefined);
        setPopupContent('');
      }
    } else if (typeof evtOrStationName === 'string') {
      const station = stations.find(
        (s) => s.title.toLowerCase() === evtOrStationName.toLowerCase()
      );
      setSelectedStation(station);

      if (station) {
        const content = `
          <div>
            <h4>${station.title}</h4>
            <p>Направление: ${station.direction}</p>
            <p>Код Яндекс: ${station.codes.yandex_code}</p>
          </div>
        `;
        setPopupContent(content);
        const coords = toMercator([station.longitude, station.latitude]);
        popupRef.current.setPosition(coords);
        mapRef.current.getView().setCenter(coords);
      }
    }
  };

  useMemo(() => {
    if (!mapRef.current || !stations.length) return;

    const stationStyle = new Style({
      image: new Icon({
        src: trainStationIcon,
        scale: 0.05,
      }),
    });

    const features = stations.map((station) => {
      const coords = toMercator([station.longitude, station.latitude]);
      const feature = new Feature({
        geometry: new Point(coords),
        stationInfo: station,
      });
      feature.setStyle(stationStyle);
      return feature;
    });

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
    });

    mapRef.current.addLayer(vectorLayer);

    mapRef.current.on('click', (evt) => showOnMapHandler(evt));

    return () => {
      mapRef.current.removeLayer(vectorLayer);
    };
  });

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>Я.Прибывалка</h1>
        <div className="toggle-buttons">
          <button
            className={`toggle-button ${viewMode === "stations" ? "active" : ""}`}
            onClick={() => setViewMode("stations")}
          >
            Список станций
          </button>
          <button
            className={`toggle-button ${viewMode === "trains" ? "active" : ""}`}
            onClick={() => setViewMode("trains")}
          >
            Поиск поездов
          </button>
        </div>
      </header>

      <div className="app-container">

        <div className="stations-container">
          {viewMode === "stations" ? (
            <StationsList stations={stations} showOnMapHandler={showOnMapHandler} />
          ) : (
            <TrainSearch stations={stations} />
          )}
        </div>

        {selectedStation && <TrainStationSchedule station={selectedStation} />}

        <div className="map-container">
          <h1>Карта станций</h1>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <MapPopup content={popupContent} />
            <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
