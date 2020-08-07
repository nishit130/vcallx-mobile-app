import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ToastAndroid,
} from 'react-native';
import Accept from '../components/button';

class CallRecievedScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onConnecting: false,
    };
  }
  showToastWithGravity = () => {
    ToastAndroid.showWithGravity('connecting', ToastAndroid.SHORT);
  };

  createAnswer = () => {
    this.setState({onConnecting: true});
    this.showToastWithGravity();
    this.props.route.params.createAnswer();
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainView}>
          <View style={styles.imageSection}>
            <Image
              style={styles.avatar}
              source={{
                uri:
                  'https://cdn.pixabay.com/photo/2013/07/13/10/07/man-156584_960_720.png',
              }}
            />
          </View>
          <Text style={styles.caller}>Nishit</Text>
          <View style={styles.buttonSection}>
            <Accept
              name="phone"
              backgroundColor="#26ae60"
              callBackFunction={this.createAnswer}
            />
            <Accept
              name="phone-hangup"
              backgroundColor="red"
              callBackFunction={this.props.route.params.dissconect}
            />
          </View>
        </View>
      </View>
    );
  }
}
const dimensions = Dimensions.get('screen');
var fontColor = 'white';
var backgroundColor = '#6A45BB';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: dimensions.height,
    width: dimensions.width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundColor,
  },
  mainView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    flex: 5,
    justifyContent: 'flex-end',
  },
  avatar: {
    height: 120,
    width: 120,
    marginBottom: 20,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
  },
  caller: {
    fontSize: 25,
    flex: 2,
    alignItems: 'center',
    color: fontColor,
    fontWeight: 'bold',
  },
  buttonSection: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answer: {
    borderWidth: 2,
    borderRadius: 50,
    backgroundColor: '#26ae60',
  },
  decline: {
    borderWidth: 2,
    borderRadius: 50,
    backgroundColor: 'red',
  },
});
export default CallRecievedScreen;
