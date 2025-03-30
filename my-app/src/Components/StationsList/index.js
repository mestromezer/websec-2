import { useState } from "react";
import { v4 as uuid } from "uuid";
import "./styles.css";
import StationItemCard from "../StationItemCard";

const StationsList = (props) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStations = props.stations
        ? props.stations.filter(station =>
            station.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className="stations-page__stations-list-container">
            <input
                type="text"
                placeholder="Поиск станции..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />

            <div className="stations-page__stations-list">
                {filteredStations.length > 0 ? (
                    filteredStations.map((stop) => (
                        <StationItemCard
                            key={uuid()}
                            data={stop}
                            yandex_code={stop.codes.yandex_code}
                            showOnMapHandler={props.showOnMapHandler}
                        />
                    ))
                ) : (
                    <p className="no-results">Станции не найдены</p>
                )}
            </div>
        </div>
    );
};

export default StationsList;
