import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { emailValidator } from '../../helpers/emailValidator';
import { passwordValidator } from '../../helpers/passwordValidator';
import { theme } from '../../core/theme';
import { firebase } from '../../firebase/config';
import AsyncStorage from '@react-native-community/async-storage';
import {
    BackButton,
    Background,
    Logo,
    Header,
    TextInput,
    Button
} from '../../components';

const LoginScreen = ({ navigation }) => {

    const [email, setEmail] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });
    const [isSigningIn, setisSigningIn] = useState(false);
   
    _storeData = async (displayName, uid) => {
        try {
            await AsyncStorage.setItem('uid-key', JSON.stringify(uid));
            await AsyncStorage.setItem('email-key', JSON.stringify(email.value));
            await AsyncStorage.setItem('passwork-key', JSON.stringify(password.value));
            await AsyncStorage.setItem('displayName-key', JSON.stringify(displayName));
        } 
        catch (error) {
          // Error saving data
        }
    };    

    const onLoginPressed = async () => {
        const emailError = emailValidator(email.value);
        const passwordError = passwordValidator(password.value);
        Keyboard.dismiss();
        setisSigningIn(true);
        if (emailError || passwordError) {           
            setEmail({ ...email, error: emailError });
            setPassword({ ...password, error: passwordError });
            setisSigningIn(false);
            return;
        }
        await firebase
                .auth()
                .signInWithEmailAndPassword(email.value, password.value)
                .then((response) => {
                    const uid = response.user.uid
                    const usersRef = firebase.firestore().collection('users')
                    usersRef
                        .doc(uid)
                        .get()
                        .then(firestoreDocument => {
                            if (!firestoreDocument.exists) {
                                Alert.alert("L???i", "T??i kho???n n??y kh??ng t???n t???i",
                                    [
                                        {text: 'OK', onPress: () => {}, style: 'cancel' },
                                    ],
                                    { cancelable: true}
                                )
                                return;
                            }
                            //Th??m v??o Local Storage
                            _storeData(response.user.displayName, uid);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'HomeStackScreen' }],
                            })
                        })
                        .catch(error => {
                            Alert.alert("L???i", "M???t kh???u ch??a ????ng",
                                [
                                    {text: 'OK', onPress: () => {}, style: 'cancel' },
                                ],
                                { cancelable: true}
                            )
                    });
                })
                .catch(error => {
                    Alert.alert("L???i", "Sai t??n ????ng nh???p ho???c m???t kh???u",
                        [
                            {text: 'OK', onPress: () => {}, style: 'cancel' },
                        ],
                        { cancelable: true}
                    )
                })      
        setisSigningIn(false);
        // navigation.reset({
        //     index: 0,
        //     routes: [{ name: 'HomeStackScreen' }],
        // })
    }

    return (   
        <Background>
            <BackButton goBack={navigation.goBack} />
            <Logo />
            <Header>Ch??o m???ng b???n</Header>               
            <TextInput 
                label="?????a ch??? Email"
                returnKeyType="next"
                value={email.value}
                onChangeText={(text) => setEmail({ value: text, error: '' })}
                error={!!email.error}
                errorText={email.error}
                autoCapitalize="none"
                autoCompleteType="email"
                textContentType="emailAddress"
                keyboardType="email-address"
            />
        
            <TextInput
                label="M???t kh???u"
                returnKeyType="done"
                value={password.value}
                onChangeText={(text) => setPassword({ value: text, error: '' })}
                error={!!password.error}
                errorText={password.error}
                secureTextEntry
            />
                
            <View style={styles.forgotPassword}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ResetPasswordScreen')}
                >
                    <Text style={styles.forgot}>Qu??n m???t kh???u?</Text>
                </TouchableOpacity>
            </View>

            {isSigningIn ? (
                <ActivityIndicator size="large" color="#0000ff"/>
            ) : (
                <Button mode="contained" onPress={onLoginPressed}>
                    ????ng nh???p
                </Button>
            )}            
            <View style={styles.row}>
                <Text>B???n ch??a c?? t??i kho???n? </Text>
                <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
                    <Text style={styles.link}>????ng k??</Text>
                </TouchableOpacity>
            </View>
        </Background>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1
    },
    forgotPassword: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: 24,
    },
    row: {
      flexDirection: 'row',
      marginTop: 4,
    },
    forgot: {
      fontSize: 13,
      color: theme.colors.secondary,
    },
    link: {
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
})

export default LoginScreen
