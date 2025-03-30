import { useEffect, useMemo, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import "ol/ol.css";
import { toMercator } from "@turf/projection";

import trainStationIcon from "../assets/trainStation.svg"; // Иконка ЖД станции

const TrainStationsMap = ({ stations }) => {
  const mapElement = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // Если карта уже есть, не создаём новую

    mapRef.current = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [5584030.684758671, 7021364.820491779], // Центр карты
        zoom: 10,
        maxZoom: 18,
      }),
    });
  }, []);

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

    return () => {
      mapRef.current.removeLayer(vectorLayer);
    };
  }, [stations]);

  return <div ref={mapElement} style={{ width: "100%", height: "100%" }}></div>;
};

export default TrainStationsMap;
