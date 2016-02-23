import React from 'react';
import LocationStore from '../stores/LocationStore';
import LocationService from '../services/LocationService';
import MapService from '../MapService';
import MarkerService from '../MarkerService';
import LocationList from './LocationList';
import CitiesList from './CitiesList';
import WarningMessage from './WarningMessage';
import CityStore from '../stores/CityStore';
import SidebarStore from '../stores/SidebarStore';
import CityService from '../CityService';
import {isEmpty} from 'lodash';

const sidebarStyle = {
    position: 'fixed',
    display: 'inline-block',
    width: 300 + 'px',
    height: 100 + '%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
    overflow: 'auto'
};

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            locations: LocationStore.locations,
            city: CityStore.currentCity,
            cities: CityStore.citiesList,
            cityView: SidebarStore.viewState
        };

        this.switchCity = (city) => () => MapService.switchCity(city);
        this.onChange = () => this.setState({locations: LocationStore.locations});
        this.onViewChange = () => this.setState({cityView: SidebarStore.viewState});

        this.onCityChange = () => {
            const city = CityStore.currentCity;

            if (city) {
                LocationService.getLocations(city);
                this.setState({city});
            } else {
                MarkerService.removeMarkers();
            }

            if (isEmpty(this.state.cities) && CityStore.citiesList.length) {
                this.setState({cities: CityStore.citiesList});
            }
        };

        this.handleScrolling = (e) => {
            if (LocationStore.canLoadMore) {
                const initialHeight = e.nativeEvent.srcElement.firstChild.scrollHeight - window.innerHeight;
                const currentScrollHeight = e.nativeEvent.srcElement.scrollTop;

                if (currentScrollHeight >= initialHeight && !LocationStore.isBlocked) {
                    const targetPage = LocationStore.currentPage + 1;
                    LocationService.getLocations(CityStore.currentCity, targetPage);
                }
            }
        }
    }

    componentWillUnmount() {
        LocationStore.removeListener("change", this.onChange);
        CityStore.removeListener("change", this.onCityChange);
        SidebarStore.removeListener("change", this.onViewChange);
    }

    componentWillMount() {
        LocationService.getLocations(this.state.city);
        CityService.fetchCitiesList();

        LocationStore.addListener("change", this.onChange);
        CityStore.addListener("change", this.onCityChange);
        SidebarStore.addListener("change", this.onViewChange);
    }

    render() {
        let content;
        let isLocationList;

        if (this.state.cityView) {
            content  = <CitiesList switchCity={this.switchCity.bind(this)} list={this.state.cities} />
        } else {
            if (this.props.children) {
                content = this.props.children;
            } else {
                if (this.state.city) {
                    content = <LocationList list={this.state.locations} />;
                    isLocationList = true;
                } else {
                    content = <WarningMessage message="Вы находитесь за пределами ближайшего города" />
                }
            }
        }

        return (
            <div onScroll={isLocationList ? this.handleScrolling.bind(this) : ''}  style={sidebarStyle} className="sidebar" >
                {content}
            </div>)
    }
};
