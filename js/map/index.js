import MapActions from 'actions/MapActions';
import CityActions from 'actions/CityActions';
import LocationActions from 'actions/LocationActions';
import SidebarActions from 'actions/SidebarActions';
import LocationService from 'services/LocationService';
import CityStore from 'stores/CityStore';
import BaloonService from 'services/BalloonService';

import { saveUserCoordinates } from 'actions/geo';
import { setCity, resetCity } from 'actions/cities';
import { resetLocations } from 'actions/locations';

let _map = null;

export default class Map {
    constructor() {
        this.instance = DG.map('map', this.mapOptions);

        this.instance.locate({ watch: true, enableHighAccuracy: true })
            .on('locationfound', this.saveLocation)
            .on('locationerror', this.throwLocationError);

        this.instance.on('projectchange', this.setCity);
        this.instance.on('projectleave', this.resetCity);
        this.instance.on('dblclick', this.pushPopup);
    }

    get mapOptions() {
        return {
            center: [54.98, 82.89],
            zoom: 14,
            minZoom: 13,
            fullscreenControl: false,
            zoomControl: false,
            doubleClickZoom: false,
            projectDetector: true
        };
    }

    saveLocation({ latitude, longitude }) {
        saveUserCoordinates(latitude, longitude);
    }

    throwLocationError({ message }) {
        console.warn(message);
    }

    setCity({ getProject }) {
        const cityCode = getProject().code;
        CityActions.setCity(cityCode);
        setCity(cityCode);
    }

    resetCity() {
        resetCity();
        resetLocations();
        CityActions.resetCity();
        LocationActions.resetLocations();
    }

    pushPopup({ latlng: { lat, lng } }) {
        LocationService.geocodeCoords(lat, lng);
        MapActions.saveSelectedCoords(lat, lng);

        DG.popup()
            .setLatLng([lat, lng])
            .setContent(BaloonService.createContent())
            .addTo(Map);
    }

    panTo(lat, lng) {
        this.instance.panTo([lat, lng], {
            animate: true
        });
    }

    switchCity(city) {
        const { lat, lng, zoom } = CityStore.findCity(city);
        this.instance.setView([lat, lng], zoom);
        SidebarActions.toggleCityList();
    }
}

export const init = () => new Promise((resolve, reject) => {
    if (window.DG.ready) {
        reject('map already initialized');
    }

    window.DG.then(() => {
        resolve(_map = new Map());
    });
});

export const getInstance = () => _map;
export const ready = () => !!_map.instance;