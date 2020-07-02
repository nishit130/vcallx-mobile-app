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
    
    this.setState({
  	localStream : this.props.route.params.localStream,
  	remoteStream : this.props.route.params.remoteStream,
	})
  }
  
  // stopConnection = () => {
  //   console.log(this.props.route.params.pc)
  //   this.props.route.params.pc.close();
    
  // }
  sendToPeer = (messageType, payload) => {
    this.props.route.params.socket.emit(messageType, {
      socketID : this.props.route.params.socket.id,
      payload
    })
  }
  disconnect = () => {
    console.log('disconnect is called in call.js')
    this.props.route.params.pc.close();
            //this.state.localStream.getTracks().forEach(track => track.stop())
    if(this.state.remoteStream)
    {
      this.state.remoteStream.getTracks().forEach(track => track.stop())
      this.state.remoteStream = null;
    }
    if(this.state.localStream)
    {
      this.state.localStream.getTracks().forEach(track => track.stop())
      //this.state.localStream = null;
    }
    if(this.props.route.params.pc)
    {
      this
      this.props.route.params.pc.onaddstream = null;
      this.props.route.params.pc.onicecandidate = null;
      this.props.route.params.pc.close();
      this.props.route.params.pc = null;
    }
    this.props.navigation.navigate('home')
  }
 
  render()
  {
    const {
      localStream,
      remoteStream,
    } = this.props.route.params
    console.log('localStream : ', localStream)
    // this.setState({
    //   localStream : this.props.route.params.localStream,
    //   remoteStream : this.props.route.params.remoteStream,
    // })
    const remoteVideo = remoteStream ?
      (
        <RTCView
          key={2}
          mirror={true}
      	  objectFit='contain'
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
         <View>
           <TouchableOpacity style={{borderColor:'white',borderWidth:2,height:50}}><Text style={{color:'white',fontSize:20}} onPress={() => {this.disconnect(); this.sendToPeer('disconnect-call','');}}>Cut the Crap</Text></TouchableOpacity>
         </View>
      </View>
    );
  }
};

export default callScreen;
