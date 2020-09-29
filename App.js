/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

/*
  TODO:
  1.) check if user exist before calling (done)
  2. login screen ui fixes
  3. mute button working
  4. if possible camera flip or switch off camera
*/

import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  AsyncStorage,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import io from 'socket.io-client';
import callScreen from './screen/call';
import AuthenticationStack from './screen/authScreenStack';
import CallRecievedScreen from './screen/callScreen';
import LottieView from 'lottie-react-native';
import SplashScreen from 'react-native-splash-screen';


const dimensions = Dimensions.get('window');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localStream: null,
      remoteStream: null,
      username: '',
      password: '',
      reciver: '',
      caller: '',
      login: false,
    };
    this.sdp;
    this.socket = null;
    this.candidates = [];
    this.remoteBool = false;
  }
  componentDidMount = () => {
    console.log('comonent di mount app.js');
    this.socket = this.props.route.params.socket;
    //console.log("socket from home: ",this.socket)
    this.props.navigation.setParams({
      socket: this.socket,
    });
    this.socket.on('connection-success', success => {
      console.log('success', success);
    });
    this.socket.on('check-user', value => {
      if (!value) {
        console.log('user dosent exist');
        ToastAndroid.show('user do not exist!', ToastAndroid.SHORT);
      }
    });
    this.socket.on('offerOrAnswer', (username, sdp) => {
      this.setState({
        caller: username,
      });
      if (this.pc.signalingState === 'stable') {
        this.props.navigation.navigate('callScreen', {
          createAnswer: this.createAnswer,
          dissconect: this.disconnect,
          caller: username,
        });
      }
      console.log('callers username is', username);
      this.sdp = JSON.stringify(sdp);
      //console.log(sdp)
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });
    this.socket.on('candidate', candidate => {
      console.log(candidate);
      this.pc
        .addIceCandidate(new RTCIceCandidate(candidate))
        .then(
          () => console.log('candidate added suscessfull'),
          err => console.log('candidate error: ', err),
        );
      if (this.remoteBool) {
        this.remoteBool = false;
        this.accepted();
      }
    });
    this.socket.on('disconnect-call', () => {
      this.disconnect();
    });
    this.socket.on('accepted-call', () => {
      this.remoteBool = true;
    });
    this.setLocalVideo();
    this.createPc();

    
  };
  handleiceState = () => {
    console.log('ice state ', this.pc.iceConnectionState);
    if (
      this.pc.iceConnectionState === 'completed' ||
      this.pc.iceConnectionState === 'connected'
    ) {
      this.props.navigation.navigate('call', {
        remoteStream: this.state.remoteStream,
        localStream: this.state.localStream,
        pc: this.pc,
        socket: this.socket,
      });
    }
    if (
      this.pc.iceConnectionState === 'disconnected' ||
      this.pc.iceConnectionState === 'closed'
    ) {
      console.log('state dis in app.js');
      this.disconnect();
    }
  };

  onLogin = value => {
    this.setState({
      login: value,
    });
  };
  handleOnaddstreamEvent = e => {
    // console.log("remote srcObject", e.streams)
    //this.remoteVideoref.current.srcObject = e.stream
    console.log('remote track: ', e.track);

    this.setState({
      remoteStream: e.stream,
    });
  };
  handleICEcandidatesEvent = e => {
    // if(e.candidate) console.log(JSON.stringify(e.candidate))

    if (e.candidate) {
      this.sendToPeer('candidate', e.candidate);
    }
  };
  createPc = () => {
    const pc_config = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: '',
          username: '',
        },
      ],
    };

    this.pc = new RTCPeerConnection(pc_config);
    this.pc.onicecandidate = this.handleICEcandidatesEvent;
    this.pc.onaddstream = this.handleOnaddstreamEvent;
    this.pc.oniceconnectionstatechange = this.handleiceState;
  };
  setLocalVideo = () => {
    console.log('setLocalVideo called');
    let isFront = true;
    mediaDevices.enumerateDevices().then(sourceInfos => {
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind === 'videoinput' &&
          sourceInfo.facing === (isFront ? 'front' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId
              ? [
                  {
                    sourceId: videoSourceId,
                  },
                ]
              : [],
          },
        })
        .then(stream => {
          this.setState({
            localStream: stream,
          });
          // console.log(stream.toURL())
          //this.localVideoref.current.srcObject = stream
        })
        .catch(streamError => {
          console.log('Stream Error: ', streamError);
        });
    });
  };
  setstream = () => {
    if (this.state.localStream) {
      this.pc.addStream(this.state.localStream);
      console.log('stream added!');
    }
  };

  sendToPeer = (messageType, payload, username) => {
    if (messageType === 'offerOrAnswer') {
      console.log('reciver:', username);
      this.socket.emit(messageType, {
        username: username,
        socketID: this.socket.id,
        payload,
      });
    } else {
      console.log('offer wala nahi hai ye');
      this.socket.emit(messageType, {
        socketID: this.socket.id,
        payload,
      });
    }
  };

  createOffer = () => {
    this.setState({
      remoteBool: true,
    });
    this.setstream();
    if (this.pc == null) {
      this.createPc();
      console.log('offer');
    }

    this.pc
      .createOffer({
        offerToReceiveVideo: 1,
        offerToReceiveAudio: 1,
      })
      .then(sdp => {
        console.log(JSON.stringify(sdp));
        this.pc
          .setLocalDescription(sdp)
          .then(() => console.log('local descp added'));
        this.sendToPeer('offerOrAnswer', sdp, this.state.reciver);
      })
      .then(
        () => console.log('call sucess: '),
        err => console.log('call error: ', this.pc, err),
      );
    console.log('muted: ');
    this.state.localStream.getTracks().forEach(track => (track.enabled = true));
  };

  setRemoteDescription = () => {
    const desc = JSON.parse(this.sdp);
    this.pc
      .setRemoteDescription(new RTCSessionDescription(desc))
      .then(() => console.log('remote descp added'));
  };

  createAnswer = () => {
    console.log('answer func ', this.state.localStream);
    if (this.pc == null) {
      this.createPc();
    }
    this.setstream();
    this.setState({
      remoteBool: true,
    });
    this.pc
      .createAnswer({
        offerToReceiveVideo: 1,
        offerToReceiveAudio: 1,
      })
      .then(sdp => {
        this.sendToPeer('offerOrAnswer', sdp, this.state.caller);
        this.pc.setLocalDescription(sdp);
      });
  };
  //}
  disconnect = () => {
    console.log('disconnect function is called');
    this.pc.close();
    //this.state.localStream.getTracks().forEach(track => track.stop())
    if (this.state.remoteStream) {
      this.state.remoteStream.getTracks().forEach(track => track.stop());
      this.state.remoteStream = null;
    }
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
      this.state.localStream = null;
    }
    if (this.pc) {
      this.pc.onaddstream = null;
      this.pc.onicecandidate = null;
      this.pc.close();
      this.pc = null;
    }
    this.candidates = [];
    this.createPc();
    this.setLocalVideo();
    this.setstream();
  };
  addCandidate = () => {
    // const candidate = JSON.parse(this.textref.value)
    this.candidates.forEach(candidate => {
      //console.log(JSON.stringify(candidate))
      this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };
  accepted = () => {
    console.log('remote', this.candidates);
  };
  logout = () => {
    this.socket.emit('disconnect');
    ToastAndroid.show('Logged out!', ToastAndroid.SHORT);
    AsyncStorage.removeItem('session');
    this.props.route.params.onLogin(false);
  };

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: 'column',
          height: dimensions.height,
          width: dimensions.width,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#314CAC',
        }}>
        <View
          style={{
            flex: 0.25,
            flexDirection: 'row',
            backgroundColor: '#314CAC',
          }}>
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              margin: 10,
            }}
            onPress={this.logout}>
            <Text
              style={{
                fontSize: 25,
                color: 'white',
              }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 0.75,
            marginBottom: dimensions.height / 10,
            borderRadius: 50,
            backgroundColor: 'white',
            width: dimensions.width - 50,
          }}>
          <Text
            style={{
              flex: 2,
              fontFamily: 'Exo2-Bold',
              fontSize: 30,
              color: '#314CAC',
              textAlign: 'center',
            }}>
            VcallX
          </Text>
          <View
            behavior={'position'}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TextInput
              placeholder="Enter username"
              style={{
                flex: 1,
                fontSize: 30,
                borderColor: '#314CAC',
                backgroundColor: 'transparent',
                borderBottomWidth: 2,
              }}
              onChangeText={text =>
                this.setState({
                  reciver: text,
                })
              }
            />
          </View>
          <SafeAreaView
            style={{
              flex: 3,
              flexDirection: 'row',
              margin: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 30,
                backgroundColor: '#314CAC',
                height: 40,
                alignItems: 'center',
                margin: 10,
              }}
              onPress={this.createOffer}>
              <Text
                style={{
                  fontSize: 25,
                  color: 'white',
                }}>
                call
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
                              style={{
                                flex: 1,
                                borderRadius: 30,
                                borderWidth: 2,
                                height: 40,
                                alignItems: 'center',
                                margin: 10,
                              }}
                              onPress={this.createAnswer}>
                              <Text style={{fontSize: 25}}>answer</Text>
                            </TouchableOpacity> */}
          </SafeAreaView>
        </View>
      </SafeAreaView>
    );
  }
}

const Stack = createStackNavigator();
class MyStack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      loading: true,
      socket: null,
    };

    this.check = this.check.bind(this);
    this.onLogin = this.onLogin.bind(this);
    // this.is_connected = this.is_connected.bind(this);
    console.log('const');

    this.componentDidMount = () => {
      SplashScreen.hide();
    }
    // this.getData.then(() => {
    //   console.log('promise resolved');
    //   setTimeout(() => {
    //     this.check();
    //     this.setState({loading: false});
    //   }, 5000);
    // });

    // this.check();
  }
  // UNSAFE_componentWillMount = () => {
  //   this.setState(
  //     {
  //       sockte: io('https://ce58f2aa8982.ngrok.io/webrtcPeer'),
  //     },
  //     console.log(this.socket.id),
  //   );
  //   setTimeout(() => {
  //     this.setState({loading: false});
  //   }, 5000);
  // };
  // getData = new Promise((resolve, reject) => {
  //   this.setState({
  //     sockte: io.connect('https://ce58f2aa8982.ngrok.io/webrtcPeer', {
  //       query: {},
  //     }),
  //   });
  //   setTimeout(() => {
  //     resolve();
  //   }, 5000);
  // });
  check = () => {
    AsyncStorage.getItem('session')
      .then(data => {
        var session = JSON.parse(data);

        console.log('socket', this.state.socket.id);
        if (!session) {
          console.log('animation end');
          this.setState({
            loading: false,
          });
        }
        console.log(
          'checked in async storage!',
          session.username,
          session.password,
        );
        if (this.state.socket.id) {
          console.log('socket', this.state.socket.id);
          this.state.socket.emit('login-user', {
            socketID: this.state.socket.id,
            username: session.username,
            password: session.password,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      })
      .then(
        console.log('animation end'),
        // this.setState({
        //   loading: false,
        // })
      )
      .catch(err => {
        console.log(err);
        //console.log(this.socket)
      });
    this.state.socket.on('login-user', (message, value) => {
      if (value) {
        this.setState({
          login: true,
        });
      } else {
        console.log(message);
      }
      console.log('animation end should be called');
      this.setState({
        loading: false,
      });
    });
  };

  UNSAFE_componentWillMount() {
    console.log('ran eff');
    this.setState(
      {
        socket: io.connect('https://vcallx-web.herokuapp.com/webrtcPeer', {
          query: {},
        }),
      },
      async () => {
        await this.state.socket.connected;
      },
    );
    setTimeout(() => {
      this.check();
    }, 5000);
    // setTimeout(() => {
    //   this.setState({loading: false});
    // }, 4000);
    // console.log('component will mount ', this.socket);
  }
  onLogin(value) {
    this.setState({
      login: value,
    });
    console.log('ran login in main app.js ', this.state.login);
  }
  render() {
    console.log('socket: in main app ', this.state.socket.id);
    // if (true) {
    //   return <CallRecievedScreen />;
    // } else {
    if (this.state.loading) {
      // return <ActivityIndicator size="large" />;
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}>
          <LottieView
            style={{height: 200}}
            size={10}
            source={require('./assets/loading.json')}
            autoPlay
            loop
          />
          <Text style={{fontSize: 25}}>Loading...</Text>
        </View>
      );
    } else {
      if (!this.state.login) {
        //!this.state.login
        return (
          <AuthenticationStack
            socket={this.state.socket}
            onLogin={this.onLogin}
          />
        );
      } else {
        return (
          <NavigationContainer>
            <Stack.Navigator headerMode="none">
              <Stack.Screen
                name="home"
                component={App}
                initialParams={{
                  socket: this.state.socket,
                  onLogin: this.onLogin,
                }}
              />
              <Stack.Screen name="callScreen" component={CallRecievedScreen} />
              <Stack.Screen name="call" component={callScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        );
      }
    }
  }
}

export default MyStack;
