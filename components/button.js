import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  eq,
  set,
  cond,
  Clock,
  stopClock,
  Value,
  clockRunning,
  startClock,
  spring,
  defined,
  or,
  and,
  call,
  greaterThan,
  lessThan,
} from 'react-native-reanimated';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

function runSpring(clock, value, velocity, dest) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const config = {
    damping: 7,
    mass: 1,
    stiffness: 121.6,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: new Value(0),
  };
  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, value),
      set(config.toValue, dest),
      startClock(clock),
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ];
}

class Accept extends Component {
  constructor(props) {
    super(props);
    this.translateY = new Animated.Value(0);
    const state = new Animated.Value(-1);
    const dragY = new Animated.Value(0);
    const dragVY = new Value(0);

    this.onGestureEvent = Animated.event([
      {
        nativeEvent: {
          translationY: dragY,
          velocityY: dragVY,
          state: state,
        },
      },
    ]);
    // this.onGestureEvent = e => {
    //   //console.log(e.nativeEvent.translationY);
    //   return Animated.event([
    //     {
    //       nativeEvent: {
    //         translationY: dragY,
    //         velocityY: dragVY,
    //         state: state,
    //       },
    //     },
    //   ]);
    // };
    const transY = new Animated.Value(0);
    const clock = new Clock();
    this.translateY = cond(
      eq(state, State.ACTIVE),
      [
        cond(
          lessThan(dragY, -150),
          [
            call([transY, state], this.onCall),
            cond(defined(transY), runSpring(clock, transY, dragY, 0), 0),
          ],
          [set(transY, dragY)],
        ),
        stopClock(clock),
        transY,
      ],
      [
        set(
          transY,
          cond(defined(transY), runSpring(clock, transY, dragY, 0), 0),
        ),
      ],
    );
  }
  onCall = ([y, gestureState]) => {
    if (y < -100) {
      // set(gestureState, State.END);
      console.log('callback called! reanimated');
      this.props.callBackFunction();
    }
  };
  render() {
    return (
      <PanGestureHandler
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onGestureEvent}>
        <Animated.View
          style={[
            styles.buttonStyles,
            {
              transform: [{translateY: this.translateY}],
            },
          ]}>
          <View
            style={[
              styles.decline,
              {backgroundColor: this.props.backgroundColor},
            ]}>
            <Icon
              onPress={() => console.log('Decline')}
              style={{margin: 10}}
              color="white"
              name={this.props.name}
              size={50}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
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
  decline: {
    borderWidth: 2,
    borderRadius: 50,
  },
});

export default Accept;
