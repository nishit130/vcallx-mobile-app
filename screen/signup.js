import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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
      this.props.route.params.socket.emit('check-user', {
        socketID: this.props.route.params.socket.id,
        username: this.state.username,
        password: this.state.password,
      });
    } else {
      console.log('passwords dint match !');
    }
  };

  componentDidMount() {
    this.props.route.params.socket.on('check-user', value => {
      if (value) {
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
        console.log('User with this username already exist!');
      }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={'height'}
          style={{flex: 1, backgroundColor: 'white'}}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Sign Up</Text>
          </View>
        </KeyboardAvoidingView>
        <View style={styles.form}>
          <TextInput
            style={styles.inputBox}
            onChangeText={username => this.setState({username: username})}
            underlineColorAndroid="rgba(0,0,0,0)"
            placeholder="Username"
            placeholderTextColor="#314CAC"
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
            placeholderTextColor="#314CAC"
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
            placeholderTextColor="#314CAC"
            ref={input => (this.confirm_password = input)}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={this.onSignup}>
              Sign up
            </Text>
          </TouchableOpacity>

          <View style={{flex: 0.1, marginTop: 30}}>
            <Text onPress={() => this.props.navigation.navigate('login')}>
              Already have an account?
            </Text>
          </View>
        </View>
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
    flex: 1,
    width: dimensions.width,
    //borderRadius: 260,
    backgroundColor: '#314CAC',
    // borderBottomRightRadius: 200,
    borderBottomLeftRadius: 95,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 35,
    color: 'white',
    fontWeight: '800',
    fontFamily: 'Exo2-SemiBold',
  },
  form: {
    paddingTop: 70,
    backgroundColor: 'white',
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: dimensions.width - 0,
    borderTopRightRadius: 95,
    //borderTopLeftRadius: 35,
    //borderWidth: 2,
  },
  inputBox: {
    width: 300,
    borderBottomWidth: 2,
    borderColor: '#314CAC',
    fontSize: 16,
    color: '#314CAC',
    marginVertical: 10,
  },
  button: {
    width: 300,
    marginVertical: 10,
    paddingVertical: 12,
    borderColor: '#314CAC',
    borderWidth: 2,
    backgroundColor: '#314CAC',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  signUp: {
    textAlign: 'center',
    color: 'blue',
  },
});

export default signupScreen;
