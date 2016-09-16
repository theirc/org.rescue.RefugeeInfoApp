import React, {Component, PropTypes} from 'react';
import {AsyncStorage, Image, StyleSheet, View, Text, Dimensions, TouchableOpacity, TouchableHighlight} from 'react-native';
import {connect} from 'react-redux';
import styles, {themes, getFontFamily, getUnderlayColor} from '../styles';
import I18n from '../constants/Messages'

import {updateLanguageIntoStorage} from '../actions/language'
import {updateDirectionIntoStorage} from '../actions/direction'
import {updateRegionIntoStorage} from '../actions/region'
import {updateCountryIntoStorage} from '../actions/country'
import {updateThemeIntoStorage} from '../actions/theme'

class Welcome extends Component {
    static propTypes = {
        firstLoad: React.PropTypes.bool,
        finished: React.PropTypes.func
    };
    state = {
        showTheme: false,
        showLanguage: false,
        languageSelected: false,
        themeSelected: false,
    };

    componentDidMount() {
        if (!this.props.firstLoad) {
            this.props.finished();
        }

        const {props} = this;

        let {language} = props;
        if (!language || this.state.languageSelected) {
            return;
        }

        if (['ar', 'fa'].indexOf(language) > -1) {
            /* Showing theme selection to arabic and farsi speakers
            TODO: Make this a little more dynamic */
            setTimeout(() => {
                if (!props.firstLoad) {
                    return;
                }

                this.setState({
                    languageSelected: true,
                    showLanguage: false,
                    themeSelected: true,
                });
            }, 1000);
        } else {
            setTimeout(() => {
                if (!props.firstLoad) {
                    return;
                }

                this.setState({
                    showTheme: false,
                    languageSelected: false,
                    showLanguage: true,
                    themeSelected: true,
                });
            }, 1000);
        }
    }

    async setLanguage(language) {
        const {dispatch} = this.props;

        await this.setState({
            languageSelected: true,
        });
        const direction = ['ar', 'fa'].indexOf(language) > -1 ? 'rtl' : 'ltr';
        this.setTheme('light');
        await Promise.all([
            dispatch(updateDirectionIntoStorage(direction)),
            dispatch(updateLanguageIntoStorage(language)),
            dispatch({ type: "DIRECTION_CHANGED", payload: direction }),
            dispatch({ type: "LANGUAGE_CHANGED", payload: language })
        ]).then(() => {
            return this.setState({
                language: language,
                showTheme: true,
                showLanguage: false,
                themeSelected: false,
            });
        }).then(() => this.props.finished());
    }

    setTheme(theme) {
        const {dispatch} = this.props;
        Promise.all([
            dispatch(updateThemeIntoStorage(theme)),
            dispatch({ type: "THEME_CHANGED", payload: theme }),
        ]).then(() => this.props.finished());
    }


    renderLanguageSelection() {
        let {language} = this.props;

        return (
            <View>
                <View style={[
                    {
                        flexDirection: 'row',
                        position: 'absolute',
                        bottom: 45 * 3,
                        height: 45,
                        justifyContent: 'center',
                        borderBottomWidth: 1,
                        width: Dimensions.get('window').width,
                        backgroundColor: themes.dark.backgroundColor,
                    },
                ]}>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={[
                            styles.textAccentGreen,
                            getFontFamily(language),
                            { fontSize: 13, alignItems: 'center' }
                        ]}>
                            {I18n.t('LANGUAGE').toUpperCase() }
                        </Text>
                    </View>
                </View>
                <TouchableHighlight
                    onPress={this.setLanguage.bind(this, 'en') }
                    underlayColor={getUnderlayColor('light') }
                    style={[buttonStyle, { bottom: 45 * 2, }]}
                    >
                    <Text style={[
                        { fontSize: 13, color: themes.light.textColor, },
                        getFontFamily('en')
                    ]}>
                        English
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={this.setLanguage.bind(this, 'ar') }
                    underlayColor={getUnderlayColor('light') }
                    style={[buttonStyle, { bottom: 45, }]}
                    >
                    <Text style={[
                        { fontSize: 13, color: themes.light.textColor, },
                        getFontFamily('ar')
                    ]}>
                        العربيـة
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight
                    onPress={this.setLanguage.bind(this, 'fa') }
                    underlayColor={getUnderlayColor('light') }
                    style={[buttonStyle, { bottom: 0, }]}
                    >
                    <Text style={[
                        { fontSize: 13, color: themes.light.textColor, },
                        getFontFamily('fa')
                    ]}>
                        فارسی
                    </Text>
                </TouchableHighlight>
            </View>);
    }

    renderThemeSelection() {
        let {language} = this.props;

        return (
            <View>
                <View style={[
                    {
                        flexDirection: 'row',
                        position: 'absolute',
                        bottom: 90,
                        height: 45,
                        justifyContent: 'center',
                        borderBottomWidth: 1,
                        width: Dimensions.get('window').width,
                        backgroundColor: themes.dark.backgroundColor,
                    },
                ]}>
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={[
                            styles.textAccentGreen,
                            getFontFamily(language),
                            { fontSize: 13, alignItems: 'center' }
                        ]}>
                            {I18n.t('THEME').toUpperCase() }
                        </Text>
                    </View>
                </View>
                <TouchableHighlight
                    onPress={this.setTheme.bind(this, 'light') }
                    underlayColor={getUnderlayColor('light') }
                    style={[buttonStyle, { bottom: 45 }]}
                    >
                    <Text style={[
                        { fontSize: 13, color: themes.light.textColor, },
                        getFontFamily(language)
                    ]}>
                        {I18n.t('LIGHT') }
                    </Text>
                </TouchableHighlight>
                <TouchableOpacity
                    onPress={this.setTheme.bind(this, 'dark')}
                    activeOpacity={0.8}
                    style={[buttonStyle,
                        { bottom: 0, backgroundColor: themes.dark.toolbarColor, }]}
                    >
                    <Text style={[
                        { fontSize: 13, color: themes.dark.textColor },
                        getFontFamily(language)
                    ]}>
                        {I18n.t('DARK') }
                    </Text>
                </TouchableOpacity>
            </View>);
    }

    render() {
        const {theme} = this.props;
        const {showTheme, showLanguage} = this.state;
        const logo = require('../assets/splash-screen.png');

        return (
            <View style={localStyles.screen}>
                <View>
                    <Image
                        source={logo}
                        resizeMode={Image.resizeMode.cover}
                        style={[localStyles.logo]}
                        />
                    {showLanguage && this.renderLanguageSelection() }
                </View>
            </View>
        )

    }
}



const buttonStyle = {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    width: Dimensions.get('window').width
};

const localStyles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#000000'
    },
    logo: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    }
});

function mapStateToProps(state) {
    return {
        language: state.language,
        direction: state.direction,
    };
}

export default connect(mapStateToProps)(Welcome);
