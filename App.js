/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
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

class App extends React.Component{

  constructor(props)
  {
    super(props);
    this.state = {
      localStream : null,
      remoteStream : null,
    }
    this.sdp
    this.socket = null
    this.candidates = []
  }
  componentDidMount = () => {
    this.socket = io.connect(
      'https://94edca6f2dab.ngrok.io/webrtcPeer',
      {
        // path: '/vcallx-web',
        query: {}
      }
    )
    this.socket.on('connection-success', success => {
      console.log("success",success)
    })
    this.socket.on('offerOrAnswer', (sdp) => {
      this.sdp = JSON.stringify(sdp)
      console.log(sdp)
      this.pc.setRemoteDescription(new RTCSessionDescription(sdp))
    })
    this.socket.on('candidate', (candidate) => {
      //this.candidates = [...this.candidates, candidate]
      console.log(candidate)
      this.pc.addIceCandidate(new RTCIceCandidate(candidate)).then(() => console.log("candidate added suscessfull"),(err) => console.log("candidate error: ",err)
      
      )
    })
    const pc_config = {
      "iceServers": [
        {
          urls : 'stun:stun.l.google.com:19302'
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'nishit130',
          username: 'nishitlimbani130@gmail.com'
        },
      ]
    }
    this.pc = new RTCPeerConnection(pc_config)
    this.pc.onicecandidate = (e) => {
      // if(e.candidate) console.log(JSON.stringify(e.candidate))

      if(e.candidate){
        this.sendToPeer('candidate', e.candidate)
      }
    }
    this.pc.onaddstream = (e) => {
      // console.log("remote srcObject", e.streams)
       //this.remoteVideoref.current.srcObject = e.stream
       debugger
       console.log("remote stresan: " ,e.stream)
       this.setState({
         remoteStream : e.stream,
       })
     }
     let isFront = true;
      mediaDevices.enumerateDevices().then(sourceInfos => {
        console.log(sourceInfos);
        let videoSourceId;
        for (let i = 0; i < sourceInfos.length; i++) {
          const sourceInfo = sourceInfos[i];
          if(sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
            videoSourceId = sourceInfo.deviceId;
          }
        }
        mediaDevices.getUserMedia({
          audio: true,
          video: {
            mandatory: {
              minWidth: 500, // Provide your own width, height and frame rate here
              minHeight: 300,
              minFrameRate: 30
            },
            facingMode: (isFront ? "user" : "environment"),
            optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
          }
        })
        .then(stream => {
          this.setState({
            localStream : stream,
          })
          console.log(stream.toURL())
          //this.localVideoref.current.srcObject = stream
          this.pc.addStream(stream)
        })
        .catch(streamError => {
          console.log("Stream Error: ",streamError)
        });
        });
    } 
        sendToPeer = (messageType, payload) => {
          this.socket.emit(messageType, {
            socketID : this.socket.id,
            payload
          })
        }
        createOffer = () => {
          console.log('offer')
          this.pc.createOffer({offerToReceiveVideo:1}).then(sdp => {
            // console.log(JSON.stringify(sdp))
            this.pc.setLocalDescription(sdp).then(() => console.log("local descp added"))
            this.sendToPeer('offerOrAnswer', sdp)
          }).then(() => console.log("call made sucessfully wait for user to answer"),(err) => console.log("call error: ",err)
          )
        }
        setRemoteDescription = () => {
          const desc = JSON.parse(this.sdp)
          this.pc.setRemoteDescription(new RTCSessionDescription(desc)).then(() => console.log("remote descp added"))
          
        }
      
        createAnswer = () => {
          console.log("Answer")
          this.pc.createAnswer({offerToReceiveVideo: 1, offerToReceiveAudio: 1}).then(sdp => {
            // console.log(JSON.stringify(sdp)
            this.sendToPeer('offerOrAnswer', sdp)
            this.pc.setLocalDescription(sdp)
          }).then(() => console.log("sucess call"), (err) => console.log("answer error",err)
          
          )
        }
        addCandidate = () => {
          // const candidate = JSON.parse(this.textref.value)
          // console.log('Adding candidate:', candidate)
          this.candidates.forEach(candidate => {
            console.log(JSON.stringify(candidate))
            this.pc.addIceCandidate(new RTCIceCandidate(candidate))
          })
        }
  render()
  {
    const {
      localStream,
      remoteStream,
      } = this.state
      console.log("checking")
      const remoteVideo = remoteStream ? 
      (<RTCView 
          key={2}
          mirror={true}
          objectFit='contain'
          style={{height:200,width:200}}
          streamURL={remoteStream && remoteStream.toURL()}
          />
        )
        :
      (
        <View>
          <Text>Video NotAvailable</Text>
        </View>
      )
    return (
      <>
        <View>
          
          <Text>
            WEB RTC
          </Text>
          <TouchableOpacity onPress={this.createOffer}><Text style={{fontSize:30,margin:10}}>call</Text></TouchableOpacity>
          <TouchableOpacity onPress={this.createAnswer}><Text style={{fontSize:30,margin:10}}>Answer</Text></TouchableOpacity>
          <TouchableOpacity onPress={this.addCandidate}><Text style={{fontSize:30,margin:10}}>candidate</Text></TouchableOpacity>
          <RTCView 
          key={1}
          zOrder={0}
          objectFit='cover'
          style={{height:200,width:200}}
          streamURL={localStream && localStream.toURL()}
          />
          { remoteVideo }
          <RTCView 
          key={2}
          mirror={true}
          objectFit='contain'
          style={{height:200,width:200}}
          streamURL={remoteStream && remoteStream.toURL()}
          />
        </View>
        </>
    );
  }
};



export default App;
