import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';
import {YellowBox} from 'react-native';

YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state',
]);
// import {AsyncStorage} from '@react-native-community'
class signupScreen extends React.Component {
  constructor(props) {
    super(props);
  }
  onSignup = () => {
    console.log('ran signup in signup.js true');
    if (this.state.password === this.state.confirm_password) {
      this.props.route.params.socket.emit('addUser', {
        socketID: this.props.route.params.socket.id,
        username: this.state.username,
        password: this.state.password,
      });
      var session = {
        username: this.state.username,
        password: this.state.password,
      };
      AsyncStorage.setItem('session', JSON.stringify(session));
      this.props.route.params.onLogin(true);
    } else {
      console.log('passwords dint match !');
    }
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
          <TextInput
            style={styles.inputBox}
            onChangeText={confirm_password =>
              this.setState({confirm_password: confirm_password})
            }
            underlineColorAndroid="rgba(0,0,0,0)"
            placeholder="Confirm Password"
            secureTextEntry={true}
            placeholderTextColor="#002f6c"
            ref={input => (this.confirm_password = input)}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={this.onSignup}>
              sign up
            </Text>
          </TouchableOpacity>
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
    flex: 2,
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

export default signupScreen;
