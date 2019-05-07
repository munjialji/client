import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Permissions, Location } from 'expo'

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            hasLocationPermissions: false,
            locationResult: null,
            stationDataSource: {},
        }
    }

    async componentDidMount() {
        await this._getLocationAsync();
        await this._test()
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    stationDataSource: responseJson
                })
            })
            .then((nothing) => {
                fetch(`http://133.186.208.249/api/concentrations?station=${this.state.stationDataSource.id}`)
                    .then((response) => response.json())
                    .then((responseJson) => {
                        this.setState({
                            isLoading: false,
                            dataSource: responseJson,
                        }, function () {

                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                locationResult: 'Permission to access location was denied',
            });
        } else {
            this.setState({ hasLocationPermissions: true });
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ locationResult: location });
    }

    _test = () => {
        if (this.state.locationResult === null) {
            return fetch('http://133.186.208.249/api/stations/140')
        }
        else {
            return fetch(`http://133.186.208.249/api/stations?lon=${this.state.locationResult.coords.longitude}&lat=${this.state.locationResult.coords.latitude}`)
        }
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, padding: 40 }}>
                    <ActivityIndicator />
                </View>
            )
        }

        return (
            <View style={{ flex: 1, paddingTop: 40 }}>
                {
                    this.state.locationResult === null ?
                        <Text>Finding your current location...</Text> :
                        this.state.hasLocationPermissions === false ?
                            <Text>Location permissions are not granted.</Text> :
                            <View>
                                <Text>미세먼지 농도: {this.state.dataSource.fine_dust}</Text>
                                <Text>미세먼지 등급: {this.state.dataSource.fine_dust_grade}</Text>
                                <Text>초미세먼지 농도: {this.state.dataSource.ultra_fine_dust}</Text>
                                <Text>초미세먼지 등급: {this.state.dataSource.ultra_fine_dust_grade}</Text>
                                <Text>측정 시간 : {this.state.dataSource.data_time}</Text>
                                <Text>측정소 이름: {this.state.stationDataSource.name}</Text>
                                <Text>측정소 주소: {this.state.stationDataSource.address}</Text>
                                {this.state.stationDataSource.distance ? <Text>측정소와의 거리: {this.state.stationDataSource.distance}km</Text>: <Text>측정소와의 거리: GPS를 허락하세요. </Text> }
                            </View>
                }
            </View>
        );
    }
}