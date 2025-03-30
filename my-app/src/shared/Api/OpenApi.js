class BaseApi {

    basePath = `http://localhost:${process.env.REACT_APP_SERVER_PORT ?? 7777}/`;
    apiKey = process.env.REACT_APP_API_KEY;

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

        this.apiKey && requestUrl.append('apikey', this.apiKey);

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
        return this.sendRequest('GET', "schedule?", { station: station, format: 'json', lang: "ru_RU" })
            .then(response => {
                return response.json().then((r) => { return r; })
            })
    }

    before2Sations(from, to) {
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