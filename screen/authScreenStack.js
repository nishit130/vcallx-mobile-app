import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import loginScreen from './login';
import signupScreen from './signup';

const AuthStack = createStackNavigator();
function AuthenticationStack(props) {
  function onLogin(value) {
    console.log('ran login in authstack ', value);
    props.onLogin(value);
  }
  return (
    <NavigationContainer>
      <AuthStack.Navigator headerMode="none">
        <AuthStack.Screen
          name="login"
          component={loginScreen}
          initialParams={{socket: props.socket, onLogin: onLogin}}
        />
        <AuthStack.Screen
          name="signUp"
          component={signupScreen}
          initialParams={{socket: props.socket, onLogin: onLogin}}
        />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}
export default AuthenticationStack;
