import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

class signupScreen extends React.Component{
    render()
    {
        return(
            <View style={styles.container}>
            <View style={styles.banner}>
                <Text style={styles.bannerText}>Vcallx Video calling app</Text>
            </View>
            <View style={styles.form}>
                <TextInput style={styles.inputBox}
                onChangeText={(username) => this.setState({username: username})}
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="username"
                placeholderTextColor = "#002f6c"
                selectionColor="#fff"
                keyboardType="email-address"
                onSubmitEditing={()=> this.password.focus()}/>
                
                <TextInput style={styles.inputBox}
                onChangeText={(password) => this.setState({password : password})} 
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Password"
                secureTextEntry={true}
                placeholderTextColor = "#002f6c"
                ref={(input) => this.password = input}
                />
                 <TextInput style={styles.inputBox}
                onChangeText={(password) => this.setState({password : password})} 
                underlineColorAndroid='rgba(0,0,0,0)' 
                placeholder="Confirm Password"
                secureTextEntry={true}
                placeholderTextColor = "#002f6c"
                ref={(input) => this.password = input}
                />

                <TouchableOpacity style={styles.button}> 
                    <Text style={styles.buttonText} onPress={this.onLogin}>sign up</Text>
                </TouchableOpacity>
            </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
    },
    banner : {
        flex: 1,
        justifyContent: 'center',
        alignItems : 'center'

    },
    bannerText: {
        fontSize: 30,
        fontWeight: "800",
        fontStyle: "italic",
    },
    form: {
        flex:2,
    },
    inputBox: {
        width: 300,
        backgroundColor: '#F4A4AB', 
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "white",
        marginVertical: 10,
    },
    button: {
        width: 300,
        backgroundColor: '#E63946',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    },
    signUp : {
        textAlign: "center",
        color: "blue",
    }
});

export default signupScreen;