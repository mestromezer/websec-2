import logo from './logo.svg';
import './App.css';
import StationItemCard from './Components/StationItemCard';
import {useEffect, useState} from 'react';
import { StationApi } from './shared/Api/OpenApi';
import StationsList from './Components/StationsList';
import TrainStationsMap from "./Components/TrainStationsMap";


function App() {

  const [stations, setStations] = useState(null);

  useEffect(() => {
      const interval = setInterval(async () => {
        const stationsApi = new StationApi();
        const res = await stationsApi.getAllStations();
        if (res && res.countries) {
          const ruRegions = res.countries.find((elem) => elem.title === 'Россия').regions;
  
          const allStations = ruRegions.reduce((acc, currItem) => {
            return [
              ...acc,
              ...currItem.settlements.reduce((acc, currItem) => {
                return [
                  ...acc,
                  ...currItem.stations
                ]
              }, [])
            ]
          }, []).filter((item) => {
            return item.transport_type === "train"
              && item.codes.esr_code
              && (
                (item.codes.esr_code).startsWith('63')
                || (item.codes.esr_code).startsWith('64')
                || (item.codes.esr_code).startsWith('65')
              )
          });
  
          setStations(allStations);
        }
      }, 1500);
      return () => clearInterval(interval);
    }, [])

    return (
      <div className="app-wrapper">
        <header className="app-header">
          <h1>Я.Прибывалка</h1>
        </header>
    
        <div className="app-container">
          <div className="stations-container">
            <h1>Список станций</h1>
            <StationsList stations={stations ? stations.slice(0, 10) : null} />
          </div>
    
          <div className="map-container">
            <h1>Карта станций</h1>
            <TrainStationsMap stations={stations} />
          </div>
        </div>
      </div>
    );
    
    
}


export default App;
