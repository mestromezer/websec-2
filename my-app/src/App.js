import logo from './logo.svg';
import './App.css';
import StationItemCard from './Components/StationItemCard';
import {useEffect, useState} from 'react';
import { StationApi } from './shared/Api/OpenApi';
import StationsList from './Components/StationsList';


function App() {

  const [stations, setStations] = useState(null);
  // const [filter, setFilter] = useState("");

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
    <div className="min-h-screen flex items-center justify-center">

      <div >
        <StationsList stations={stations ? stations.slice(0,10) : null}/>
      </div>
      
      {/* 
      <div id="map" ref={mapElement}>
        <div id="popup" className="ol-popup rubik-400">
          <div id="popup-content"></div>
        </div>
      </div> 
      */}

    </div>
  );
}


export default App;
