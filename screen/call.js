/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler';
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
  Dimensions
} from 'react-native';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from 'react-native-webrtc';

import io from 'socket.io-client';

const dimensions = Dimensions.get('window')

class callScreen extends React.Component{

  constructor(props)
  {
    super(props);
    this.state = {
      localStream : null,
      remoteStream : null,
      meeting_id: "",
      client_password: "",
    }
    this.sdp
    this.socket = null
    this.candidates = []
  }

  stopConnection = () => {
    console.log(this.props.route.params.pc)
    this.props.route.params.pc.getTransceivers().forEach((transceiver) => {
      transceiver.stop();
    });
  }
  render()
  {
    const {
      localStream,
      remoteStream,
    } = this.props.route.params
    
    const remoteVideo = remoteStream ?
      (
        <RTCView
          key={2}
          mirror={true}
          style={{backgroundColor: 'black',height:dimensions.height,width:dimensions.width}}
          zOrder={0}
          streamURL={remoteStream && remoteStream.toURL()}
        />
      ) :
      (
        <View style={{ padding: 15, }}>
          <Text style={{ fontSize:22, textAlign: 'center', color: 'white' }}>Waiting for Peer connection ...{this.state.client_password}</Text>
        </View>
      )
    return (
      <View style={{height:dimensions.height,width:dimensions.width,backgroundColor:'blue'}}> 

        <View style={{position:'relative',backgroundColor:'pink',zIndex:0,height:dimensions.height-100,width:dimensions.width}}>
            {/* <RTCView 
            key={2}
            objectFit='cover'
            style={{height:dimensions.height,width:dimensions.width}}
            streamURL={localStream && localStream.toURL()}
            /> */}
            {remoteVideo}
        </View>         
         <View style={{position:'absolute',height:200, width:150,backgroundColor:'blue',bottom:100,right:0,zIndex:100}}>
            <RTCView
            key={1} 
            objectFit='cover'
            style={{height:200,width:150}}
            streamURL={localStream && localStream.toURL()}
            zOrder={100}
            />
         </View>
         <View style={{flex:1,flexDirection:'row',backgroundColor:'yellow',height:100,width:dimensions.width}}>
            <TouchableOpacity style={{flex:1,flexDirection:'row'}} onPress={this.stopConnection}><Text>answer</Text></TouchableOpacity>
         </View>
      </View>
    );
  }
};

export default callScreen;
