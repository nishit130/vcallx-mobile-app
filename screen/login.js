import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  AsyncStorage,
  Image,
  KeyboardAvoidingView,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

class loginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }
  componentDidMount() {
    this.props.route.params.socket.on('login-user', (message, value) => {
      if (value) {
        //ToastAndroid.show(message);
        ToastAndroid.show(message, ToastAndroid.SHORT);
        var session = {
          username: this.state.username,
          password: this.state.password,
        };
        AsyncStorage.setItem('session', JSON.stringify(session));
        this.props.route.params.onLogin(true);
      } else {
        // ToastAndroid.show(message);
        ToastAndroid.show(message, ToastAndroid.SHORT);
        console.log(message, value);
      }
    });
  }

  onLogin = () => {
    console.log('ran login in login.js true');
    this.props.route.params.socket.emit('login-user', {
      socketID: this.props.route.params.socket.id,
      username: this.state.username,
      password: this.state.password,
    });
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <Image
            style={{
              flex: 1,
              resizeMode: 'cover',
            }}
            source={require('../assets/img/video-call.png')}
          />
        </View>
        <KeyboardAvoidingView behavior={'height'} style={{...styles.form}}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon
              style={{
                flex: 0.1,
                marginVertical: 10,
              }}
              name="account-outline"
              size={30}
              color="white"
            />
            <TextInput
              style={{...styles.inputBox, flex: 0.9}}
              onChangeText={username => this.setState({username: username})}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="Username"
              placeholderTextColor="white"
              selectionColor="#fff"
              keyboardType="email-address"
              onSubmitEditing={() => this.password.focus()}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon
              style={{
                flex: 0.1,
                marginVertical: 10,
              }}
              name="lock"
              size={30}
              color="white"
            />
            <TextInput
              style={{...styles.inputBox, flex: 0.9}}
              onChangeText={password => this.setState({password: password})}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="Password"
              secureTextEntry={true}
              placeholderTextColor="white"
              ref={input => (this.password = input)}
            />
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={this.onLogin}>
              Login
            </Text>
          </TouchableOpacity>
          <Text
            style={styles.signUp}
            onPress={() => this.props.navigation.navigate('signUp')}>
            Create Account
          </Text>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
const dimensions = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#314CAC',
  },
  banner: {
    flex: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 30,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  form: {
    marginTop: 20,
    flex: 1,
  },
  inputBox: {
    width: dimensions.width - 90,
    backgroundColor: '#314CAC',
    borderColor: 'white',
    borderBottomWidth: 2,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'white',
    marginVertical: 10,
  },
  button: {
    width: dimensions.width - 90,
    borderWidth: 2,
    borderColor: 'white',
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#314CAC',
    textAlign: 'center',
  },
  signUp: {
    flex: 0.6,
    textAlign: 'center',
    color: '#fafafa',
  },
});
export default loginScreen;
