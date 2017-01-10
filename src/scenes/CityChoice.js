import React, {Component, PropTypes} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {LocationListView, OfflineView} from '../components';
import I18n from '../constants/Messages';
import styles from '../styles';
import {
    updateCountryIntoStorage,
    updateRegionIntoStorage,
    updateLocationsIntoStorage
} from '../actions';
import ApiClient from '../utils/ApiClient';


export class CityChoice extends Component {

    static propTypes = {
        country: React.PropTypes.object.isRequired
    };

    static contextTypes = {
        navigator: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.loadInitialState = this.loadInitialState.bind(this);

        this.apiClient = new ApiClient(this.context, props);
        this.state = {
            cities: [],
            loaded: false,
            offline: false
        };
    }

    async componentDidMount() {
        this.loadInitialState();
    }

    async loadInitialState() {
        const {country} = this.props;
        let cities = [];
        try {
            let children = await this.apiClient.getAllChildrenOf(country.id, true);
            cities = [{country, ...country}].concat(children);
            cities = cities.filter((city) => !city.hidden);
            cities.forEach((city) => {city.country = country});
        } catch (e) {
            return this.setState({offline: true});
        }
        cities.forEach((city) => {
            city.onPress = this.onPress.bind(this, city);
            city.title = city.name;
            city.image = null;
        });
        this.setState({
            cities,
            loaded: true,
            offline: false
        });
    }

    async onPress(city) {
        const {dispatch, country} = this.props;
        let region = await this.apiClient.getLocation(city.slug);
        region.allContent = region.content.concat(region.important, region.banners);
        this.setState({region});

        requestAnimationFrame(() => {
            Promise.all([
                dispatch(updateCountryIntoStorage(country)),
                dispatch(updateRegionIntoStorage(region)),
                dispatch(updateLocationsIntoStorage(this.state.cities)),
                dispatch({type: 'REGION_CHANGED', payload: region}),
                dispatch({type: 'COUNTRY_CHANGED', payload: country}),
                dispatch({type: 'LOCATIONS_CHANGED', payload: this.state.cities})
            ]);
            if (city.content && city.content.length == 1) {
                return this.context.navigator.to('infoDetails', null, {
                    section: city.content[0].html,
                    sectionTitle: city.title
                });
            }
            return this.context.navigator.to('info');
        });
    }

    render() {
        if (this.state.offline) {
            return (
                <OfflineView
                    offline={this.state.offline}
                    onRefresh={this.loadInitialState}
                />
            );
        }
        return (
            <View style={styles.container}>
                <LocationListView
                    header={I18n.t('SELECT_LOCATION')}
                    rows={this.state.cities}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        language: state.language
    };
};

export default connect(mapStateToProps)(CityChoice);
