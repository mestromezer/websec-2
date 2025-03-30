import "./style.css"

import { ConvertStationType } from "../../shared/HelpFunctions"

const StationItemCard = (props) => {
    return <>
        <div className="stations-page__station-card">
            <div className="station-card__left-content">
                <p className="left-content__title">{props.data.title}</p>
                <p className="left-content__direction">Направление в сторону {props.data.direction}</p>
                <p className="left-content__station-type">Тип остановки: {ConvertStationType[props.data.station_type]}</p>
            </div>
            <div className="station-card__right-content">
                <button
                    className="right-content__show-on-map-button"
                    onClick={() => props.showOnMapHandler(props.yandex_code)}>
                    Показать на карте
                </button>
            </div>
        </div>
    </>
}

export default StationItemCard