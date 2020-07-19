import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import  {NavigationContainer} from '@react-navigation/native'
import loginScreen from './login';
import signupScreen from './signup';


const AuthStack = createStackNavigator();
function AuthenticationStack() {
    return(
        <NavigationContainer>
            <AuthStack.Navigator headerMode="none">
                <AuthStack.Screen name="login" component={loginScreen} />
                <AuthStack.Screen name="signUp" component={signupScreen} />
            </AuthStack.Navigator>
        </NavigationContainer>
    )
}
export default AuthenticationStack;