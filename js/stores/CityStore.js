import AppDispatcher from '../AppDispatcher';
import ActionTypes from '../Constants';
import { EventEmitter } from 'events';
import { find } from 'lodash';

let _currentCity = localStorage.getItem('city') || 'omsk';
let _citiesList = JSON.parse(localStorage.getItem('cities_list')) || [];

class CityStore extends EventEmitter {
    constructor(props) {
        super(props);

        const setCitiesList = ({ cities }) => {
            if (cities) {
                _citiesList = cities;

                localStorage.setItem('cities_list', JSON.stringify(_citiesList));
                this.emit('change');
            }
        };

        const setCity = ({ city }) => () => {
            if (city) {
                _currentCity = city;

                localStorage.setItem('city', _currentCity);
                this.emit('change');
            }
        };

        const resetCity = () => {
            _currentCity = '';
            this.emit('change');
        };

        AppDispatcher.register(action => {
            const actionList = {
                [ActionTypes.SET_CITY]: setCity(action),
                [ActionTypes.SET_CITIES_LIST]: setCitiesList(action),
                [ActionTypes.RESET_CITY]: resetCity,
            };

            if (actionList[action.actionType]) {
                actionList[action.actionType]();
            }
        });
    }

    findCity(code) {
        return find(_citiesList, cityObj => cityObj.code === code);
    }

    get citiesList() {
        return _citiesList;
    }

    get currentCity() {
        return _currentCity;
    }
}

export default new CityStore;
