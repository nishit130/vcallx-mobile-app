/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
import React from 'react';
import {View, Text, TouchableOpacity, Dimensions} from 'react-native';
import {RTCView,  MediaStreamTrack} from 'react-native-webrtc';

const dimensions = Dimensions.get('window');

class callScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localStream: null,
      remoteStream: null,
      meeting_id: '',
      client_password: '',
    };
    this.sdp;
    this.socket = null;
    this.candidates = [];
    this.props.route.params.pc.oniceconnectionstatechange = this.handleiceState;
    this.setState({
      localStream: this.props.route.params.localStream,
      remoteStream: this.props.route.params.remoteStream,
    });
  }

  // stopConnection = () => {
  //   console.log(this.props.route.params.pc)
  //   this.props.route.params.pc.close();

  // }
  handleiceState = e => {
    if (this.props.route.params.pc) {
      if (
        this.props.route.params.pc.iceConnectionState == 'disconnected' ||
        this.props.route.params.pc.iceConnectionState == 'closed'
      ) {
        this.props.navigation.navigate('home', {diss: 'true'});
      }
    }
  };

  Mute = () => {
    console.log('switch camera')
    audioTracks = this.props.route.params.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    // MediaStreamTrack.prototype.
    // MediaStreamTrack.prototype._switchCamera()
  }
  disconnect = () => {
    console.log('disconnect is called in call.js');
    this.props.route.params.pc.close();
    //this.state.localStream.getTracks().forEach(track => track.stop())
    if (this.state.remoteStream) {
      this.state.remoteStream.getTracks().forEach(track => track.stop());
      this.state.remoteStream = null;
    }
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
      //this.state.localStream = null;
    }
    if (this.props.route.params.pc) {
      this.props.route.params.pc.onaddstream = null;
      this.props.route.params.pc.onicecandidate = null;
      this.props.route.params.pc.close();
    }
    this.props.route.params.pc = null;
    this.props.navigation.navigate('home', {diss: 'true'});
  };

  render() {
    const {localStream, remoteStream} = this.props.route.params;
    console.log('localStream : ', localStream);
    // this.setState({
    //   localStream : this.props.route.params.localStream,
    //   remoteStream : this.props.route.params.remoteStream,
    // })
    const remoteVideo = remoteStream ? (
      <RTCView
        key={2}
        audio={true}
        mirror={true}
        objectFit="contain"
        style={{
          backgroundColor: 'black',
          height: dimensions.height - 50,
          width: dimensions.width,
        }}
        zOrder={0}
        streamURL={remoteStream && remoteStream.toURL()}
      />
    ) : (
      <View style={{padding: 15}}>
        <Text style={{fontSize: 22, textAlign: 'center', color: 'white'}}>
          Waiting for Peer connection ...{this.state.client_password}
        </Text>
      </View>
    );
    return (
      <View style={{height: dimensions.height, width: dimensions.width}}>
        <View
          style={{
            backgroundColor: 'pink',
            zIndex: 0,
            height: dimensions.height - 100,
            width: dimensions.width,
          }}>
          {/* <RTCView 
            key={2}
            objectFit='cover'
            style={{height:dimensions.height,width:dimensions.width}}
            streamURL={localStream && localStream.toURL()}
            /> */}
          {remoteVideo}
        </View>
        <View
          style={{
            position: 'absolute',
            height: 200,
            width: 150,
            backgroundColor: 'black',
            bottom: 50,
            right: 0,
          }}>
          <RTCView
            key={1}
            objectFit="cover"
            audio={true}
            style={{height: 200, width: 150}}
            streamURL={localStream && localStream.toURL()}
            zOrder={100}
          />
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            bottom: 0,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              flex: 1,
              borderColor: 'white',
              borderWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 50,
              height: 50,
              backgroundColor: 'red',
            }}>
            <Text
              style={{color: 'white', fontSize: 20}}
              onPress={this.disconnect}>
              Cut
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={{
              flex: 1,
              borderColor: 'white',
              borderWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 50,
              height: 50,
              backgroundColor: 'grey',
            }}>
            <Text
              style={{color: 'white', fontSize: 20}}
              onPress={this.Mute}>
              Mute
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }
}

export default callScreen;
