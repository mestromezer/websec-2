import './App.css';
import { StationApi } from './shared/Api/OpenApi';
import StationsList from './Components/StationsList';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Feature, Map, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import 'ol/ol.css';
import { toMercator } from '@turf/projection';

import trainStationIcon from './Components/assets/trainStation.svg';

function App() {
  const [stations, setStations] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const stationsApi = new StationApi();
      const res = await stationsApi.getAllStations();
      if (res && res.countries) {
        const ruRegions = res.countries.find(
          (elem) => elem.title === 'Россия'
        ).regions;

        const allStations = ruRegions
          .reduce((acc, currItem) => {
            return [
              ...acc,
              ...currItem.settlements.reduce((acc, currItem) => {
                return [...acc, ...currItem.stations];
              }, []),
            ];
          }, [])
          .filter((item) => {
            return (
              item.transport_type === 'train' &&
              item.codes.esr_code &&
              (item.codes.esr_code.startsWith('63') ||
                item.codes.esr_code.startsWith('64') ||
                item.codes.esr_code.startsWith('65'))
            );
          });

        setStations(allStations);
      }
    }, 1500);

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

    return () => clearInterval(interval);
  }, []);

  function showOnMapHandler(evtOrStationName) {
    if (evtOrStationName && evtOrStationName.pixel) {
      const feature = mapRef.current
        .getFeaturesAtPixel(evtOrStationName.pixel)
        .find((f) => f.get('stationInfo'));
  
      if (feature) {
        const station = feature.get('stationInfo');
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
  
        document.getElementById('popup').style.display = 'block';
      } else {
        popupRef.current.setPosition(undefined);
        document.getElementById('popup').style.display = 'none';
      }
    } 
    else if (typeof evtOrStationName === 'string') {
      const station = stations.find(
        (s) => s.title.toLowerCase() === evtOrStationName.toLowerCase()
      );
  
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
  
        // Центрируем карту на найденной станции
        mapRef.current.getView().setCenter(coords);
  
        document.getElementById('popup').style.display = 'block';
      }
    }
  }
  

  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState('');

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
      </header>

      <div className="app-container">
        <div className="stations-container">
          <h1>Список станций</h1>
          <StationsList
            stations={stations ? stations.slice(0, 10) : []}
            showOnMapHandler={showOnMapHandler}
          />

        </div>

        <div className="map-container">
          <h1>Карта станций</h1>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
              id="popup"
              className="ol-popup"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                padding: '10px',
                position: 'absolute',
                display: 'none',
                maxWidth: '200px',
                zIndex: 1000,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: popupContent }} />
            </div>
            <div
              ref={mapElement}
              style={{ width: '100%', height: '100%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
