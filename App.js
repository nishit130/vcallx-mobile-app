/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  AsyncStorage,
  ToastAndroid,
  Image,
} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import io, {Socket} from 'socket.io-client';
import callScreen from './screen/call';
// import LoginScreen from './screen/logins';
import AuthenticationStack from './screen/authScreenStack';
import CallRecievedScreen from './screen/callScreen';

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
    this.props.navigation.setParams({socket: this.socket});
    this.socket.on('connection-success', success => {
      console.log('success', success);
    });
    this.socket.on('offerOrAnswer', (username, sdp) => {
      this.setState({caller: username});
      if (this.pc.signalingState === 'stable') {
        this.props.navigation.navigate('callScreen', {
          createAnswer: this.createAnswer,
          disconnect: this.disconnect,
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
    this.socket.on('disconnect-call', data => {
      this.disconnect();
    });
    this.socket.on('accepted-call', data => {
      this.remoteBool = true;
    });
    this.setLocalVideo();
    this.createPc();
  };
  handleiceState = e => {
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
    this.setState({login: value});
  };
  handleOnaddstreamEvent = e => {
    // console.log("remote srcObject", e.streams)
    //this.remoteVideoref.current.srcObject = e.stream
    // console.log("remote stresan: " ,e.stream)
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
          username: 'email@gmail.com',
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
    let isFront = false;
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
          audio: false,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30,
            },
            facingMode: isFront ? 'user' : 'environment',
            optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
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
    this.setState({remoteBool: true});
    this.setstream();
    if (this.pc == null) {
      this.createPc();
      console.log('offer');
    }

    this.pc
      .createOffer({offerToReceiveVideo: 1})
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
    this.setState({remoteBool: true});
    this.pc.createAnswer({offerToReceiveVideo: 1}).then(sdp => {
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
    AsyncStorage.removeItem('session');
    this.props.route.params.onLogin(false);
  };

  render() {
    const {localStream, remoteStream} = this.state;
    console.log(this.state.localStream);
    // const remoteVideo =
    //   localStream && remoteStream ? (
    //     <View style={{padding: 15}}>
    //       <Text style={{fontSize: 22, textAlign: 'center', color: 'black'}}>
    //         Call is on going ...
    //       </Text>
    //     </View>
    //   ) : (
    //     <View style={{padding: 15}}>
    //       <Text style={{fontSize: 22, textAlign: 'center', color: 'black'}}>
    //         Waiting for Peer connection ...
    //       </Text>
    //     </View>
    //   );
    return (
      <SafeAreaView
        style={{
          flex: 1,
          flexDirection: 'column',
          height: dimensions.height,
          width: dimensions.width,
          backgroundColor: 'transparent',
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            borderRadius: 30,
            borderWidth: 2,
            height: 40,
            alignItems: 'center',
            margin: 10,
          }}
          onPress={this.logout}>
          <Text style={{fontSize: 25}}>Logout</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Enter caller username"
          style={{
            flex: 1,
            fontSize: 30,
            backgroundColor: 'transparent',
            borderBottomWidth: 2,
            height: 50,
            justifyContent: 'center',
            margin: 10,
          }}
          onChangeText={text => this.setState({reciver: text})}
        />
        <SafeAreaView
          style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}
        />
        <SafeAreaView style={{flex: 1, flexDirection: 'row', margin: 20}}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderRadius: 30,
              borderWidth: 2,
              height: 40,
              alignItems: 'center',
              margin: 10,
            }}
            onPress={this.createOffer}>
            <Text style={{fontSize: 25}}>call</Text>
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
          <TouchableOpacity
            style={{
              flex: 1,
              borderRadius: 30,
              borderWidth: 2,
              height: 40,
              alignItems: 'center',
              margin: 10,
            }}
            onPress={() => {
              this.disconnect();
              this.sendToPeer('disconnect-call', '');
            }}>
            <Text style={{fontSize: 25}}>cut</Text>
          </TouchableOpacity>
        </SafeAreaView>
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
        console.log(
          'checked in async storage!',
          session.username,
          session.password,
        );
        console.log('socket', this.state.socket.id);
        if (this.state.socket.id) {
          console.log('socket', this.state.socket.id);
          this.state.socket.emit('check-user', {
            socketID: this.state.socket.id,
            username: session.username,
            password: session.password,
          });
        }
      })
      .then(this.setState({loading: false}))
      .catch(err => {
        console.log(err);
        //console.log(this.socket)
      });
    this.state.socket.on('check-user', (message, value) => {
      if (value) {
        this.setState({
          login: true,
        });
      } else {
        console.log(message);
      }
    });
  };

  UNSAFE_componentWillMount() {
    console.log('ran eff');
    this.setState(
      {
        socket: io.connect('https://8c69a4dc8501.ngrok.io/webrtcPeer', {
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
    if (false) {
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
    // }
  }
}

export default MyStack;
