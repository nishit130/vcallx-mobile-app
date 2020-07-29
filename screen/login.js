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
} from 'react-native';

class loginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }
  componentDidMount() {
    this.props.route.params.socket.on('check-user', (message, value) => {
      if (value) {
        //ToastAndroid.show(message);
        console.log(message, value);
        var session = {
          username: this.state.username,
          password: this.state.password,
        };
        AsyncStorage.setItem('session', JSON.stringify(session));
        this.props.route.params.onLogin(true);
      } else {
        // ToastAndroid.show(message);
        console.log(message, value);
      }
    });
  }

  onLogin = () => {
    console.log('ran login in login.js true');
    this.props.route.params.socket.emit('check-user', {
      socketID: this.props.route.params.socket.id,
      username: this.state.username,
      password: this.state.password,
    });
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Vcallx Video calling app</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.inputBox}
            onChangeText={username => this.setState({username: username})}
            underlineColorAndroid="rgba(0,0,0,0)"
            placeholder="username"
            placeholderTextColor="#002f6c"
            selectionColor="#fff"
            keyboardType="email-address"
            onSubmitEditing={() => this.password.focus()}
          />

          <TextInput
            style={styles.inputBox}
            onChangeText={password => this.setState({password: password})}
            underlineColorAndroid="rgba(0,0,0,0)"
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#002f6c"
            ref={input => (this.password = input)}
          />

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
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  banner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 30,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  form: {
    flex: 1,
  },
  inputBox: {
    width: 300,
    backgroundColor: '#F4A4AB',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'white',
    marginVertical: 10,
  },
  button: {
    width: 300,
    backgroundColor: '#E63946',
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  signUp: {
    textAlign: 'center',
    color: 'blue',
  },
});
export default loginScreen;
