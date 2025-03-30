import { useContext, useEffect, useReducer, useState } from "react";
import { v4 as uuid } from 'uuid';
import "./styles.css"
import StationItemCard from "../StationItemCard";

const StationsList = (props) => {
    return <>
        <div className="stations-page__stations-list">
            {props.stations && props.stations?.map((stop) => {
                return <StationItemCard
                    key={uuid()}
                    data={stop}
                    yandex_code={stop.codes.yandex_code}
                    showOnMapHandler={(yandex_code) => props.showOnMapHandler(yandex_code)}
                />
            })}
        </div>
    </>
}

export default StationsList;