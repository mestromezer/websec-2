class BaseApi {

    basePath = `http://localhost:${process.env.REACT_APP_SERVER_PORT ?? 7777}/`;

    constructor(basePath) {
        if (basePath) this.basePath = basePath
    }

    sendRequest(method, url, data) {
        const requestBody = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        }



        if (url.startsWith('/')) url = url.slice(1);

        const requestUrl = new URLSearchParams();

        if (data) {
            Object.keys(data).forEach(key => {
                requestUrl.append(key, data[key]);
            })
        }

        return fetch(this.basePath + url + requestUrl.toString(), requestBody)
            .then(r => { return r; })
    }
}

export class StationApi extends BaseApi {

    getAllStations() {
        return this.sendRequest('GET', "stations?", { format: 'json', lang: "ru_RU" })
            .then(response => {
                return response.json().then((r) => { return r; })
            })
    }


    getSchedule(station) {
        const today = (new Date()).toISOString().split('T')[0]
        return this.sendRequest('GET', "schedule?", { station: station.codes.yandex_code, format: 'json', lang: "ru_RU", date: today })
            .then(response => {
                return response.json().then((r) => { return r; })
            })
    }
      

    search(from, to) {
        //const today = (new Date()).toISOString().split('T')[0]
        return this.sendRequest('GET', "search?", { from: from, to: to, format: 'json', lang: "ru_RU", transport_types: "train" })
            .then(response => {
                return response.json().then((r) => {
                    if (r.error)
                        throw r;
                    return r;
                });
            })
    }

}