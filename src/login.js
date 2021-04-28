import React, { useState, useEffect } from "react";
import { Dimensions, View, Text, } from "react-native";

import { notification, Button, Input, Tooltip, Spin } from 'antd';

import firebase from "firebase";
import swal from 'sweetalert';

import { Redirect, useHistory } from "react-router-dom";
import { UserOutlined, DollarTwoTone, CheckCircleTwoTone } from '@ant-design/icons';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
//import Spaces from "./spaces";
//import TopCreators from "./topcreators";

const { width, height } = Dimensions.get("window");


export default function Login(params) {
    const history = useHistory();

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [redirect, setRedirect] = useState(false)
    const [exist, setExist] = useState(false)
    const [showCreations, setShowCreations] = useState(false)
    const [showSelect, setShowSelect] = useState(false)
    const [spaceName, setSpaceName] = useState("")
    const [available, setAvailable] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [showPayment, setShowPayment] = useState(true)
    const [amount, setAmount] = useState(null)

    const [Login, setLogin] = useState(false)
    const [Sign, setSignUp] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    const openNotification = (placement, message) => {
        notification.info({
            message: `Alert`,
            description:
                `${message}`,
            placement
        });
    };
    //else if (amount % 100 !== 0) {
    //     openNotification('bottomLeft', "Incorrect format")
    // }

    useEffect(() => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                setLoggedIn(true)
                //loggedIn user
                console.log(user);
                const name1 = user.email.replace('@achintya.org', '')
                const id = user.uid
                firebase.database().ref(`/Users/${id}/mySpace/`).once("value", function (snap) {
                    setSpaceName(snap.val())
                    //setRedirect(true)
                })
            }
        })
    }, [])

    const openCheckout = () => {
        if (amount === null) {
            openNotification('bottomLeft', "Please enter valid amount.")
        } else if (amount < 1) {
            openNotification('bottomLeft', "Minimum amount is 1.")
        } else {

            let options = {
                "key": "rzp_live_qdvU5AH65kV8YG",
                "amount": 100 * parseInt(amount),
                "name": "Achintya",
                "description": "Space",
                "image": "../favicon.png",
                "handler": async function (response) {
                    console.log(response.razorpay_payment_id)
                    if (response.razorpay_payment_id) { //once transaction is completed
                        await firebase.firestore().collection("transactions").doc(response.razorpay_payment_id).set({
                            paymentId: response.razorpay_payment_id,
                            claimedAmount: parseInt(amount),
                            time: Date.now(),
                            status: 'pending'
                        }).then(() => {

                            swal({
                                title: "Transaction Successful for INR " + 1,
                                text: "Enter username password to create your space.",
                                icon: "success",
                                button: "proceed",
                                buttonColor: '#000',
                            }).then(() => {
                                setShowPayment(false)
                                setShowLogin(true)
                            })
                            firebase.firestore().collection("transactions").doc(response.razorpay_payment_id).onSnapshot(async function (doc) {
                                if (doc.data()) {
                                    if (doc.data().paidAmount) {
                                        if (parseInt(doc.data().paidAmount) === parseInt(amount) && doc.data().status === "successful") {
                                            console.log('payment verified');
                                        } else {
                                            console.log('payment declined');
                                        }
                                    }
                                }
                            })

                        })

                    }
                },
                "notes": {
                    "address": "Hello World"
                },
                "theme": {
                    "color": "#000"
                }
            };

            let rzp = new window.Razorpay(options);
            rzp.open();
        }
    }

    const handleUsername = (e) => {
        setUsername(e.target.value)

        let usersRef = firebase.database().ref('Users');
        usersRef.orderByChild('name').equalTo(e.target.value).on("value", function (snapshot) {
            if (snapshot.val()) {
                setExist(true)
                console.log(snapshot.val(), 'exist')
                console.log(Object.keys(snapshot.val())[0]);
            }
            else {
                console.log('not exist')
                //firebase.auth().signOut()
            }
        });
    }

    const handleSpaceName = (e) => {
        setSpaceName(e.target.value)
        firebase.database().ref(`/Spaces/${e.target.value}/`).on("value", function (snap) {
            if (snap.val()) {
                setAvailable(false)
            } else {
                setAvailable(true)
            }
        })
    }


    const selectSpace = () => {
        if (available) {
            firebase.database().ref(`/Spaces/${spaceName}/`).update({
                online: true,
                balance: parseInt(amount),
            })
            firebase.database().ref(`/Users/${username}/`).update({
                currentSpace: spaceName,
                mySpace: spaceName
            })

            setRedirect(true)
            history.push(`/space/${spaceName}`);
        } else {
            openNotification('bottomLeft', "spacename exists! Please select another one.")
        }
    }

    const signUp = () => {
        firebase.auth().createUserWithEmailAndPassword(username + "@achintya.org", password).then(function (result) {
            const username = result.user['email'].replace('@achintya.org', '')
            console.log(username, 'successfully signed up');
            const id = result.user.uid

            firebase.database().ref(`/Users/${id}/`).update({
                currentSpace: "",
                mySpace: "",
                name: username
            })

            setUsername(id)
            setShowLogin(false)
            setShowSelect(true)
        }).catch(function (error) {
            const errorCode = error.code;
            const errorMessage = error.message
            openNotification('bottomLeft', errorMessage)
            setPassword("")
            setUsername("")
            console.log(errorMessage, errorCode);
        });
    }

    const login = () => {
        console.log('called');


        firebase.auth().signInWithEmailAndPassword(username + "@achintya.org", password).then(async function (result) {
            console.log(result.user['email'].replace('@achintya.org', ''), result.user, result.user.uid)
            const username = result.user['email'].replace('@achintya.org', '')
            const id = result.user.uid


            await setUsername(id)

            await firebase.database().ref(`/Users/${id}/mySpace`).once("value", function (snap) {
                setSpaceName(snap.val())
                history.push(`/space/${snap.val()}`);
            })
            setRedirect(true)

        }).catch(function (error) {
            const errorCode = error.code;
            const errorMessage = error.message
            openNotification('bottomLeft', errorMessage)
            setPassword("")
            setUsername("")
            console.log(errorMessage, errorCode);
        });

    }

    const onAmountEnter = (e) => {
        if (e.nativeEvent.key == "Enter") {
            openCheckout()
        }
    }

    const amountChange = (e) => {

        const text = e.target.value
        let newText = '';
        let numbers = '0123456789';
        console.log(e.target.value);
        for (var i = 0; i < text.length; i++) {
            if (numbers.indexOf(text[i]) > -1) {
                newText = newText + text[i];
            }
            else {
                // your call back function
                openNotification('bottomLeft', "Please Enter numbers only")
            }
        }
        setAmount(newText);
    }

    const check = () => {
        if (!loggedIn) {
            setLogin(true)
        } else {
            setRedirect(true)
        }
    }

    return redirect ? <Redirect push to={`/space/${spaceName}`} /> : (

        <View style={{ height: height, width: width, overflow: 'hidden', background: "#fafafa" }}>
            <img
                src="../favicon.png"
                alt="logo"
                style={{ height: 25, width: 25, margin: 10, marginTop: 14 }}
            />
            {showPayment && Sign ?
                <View
                    style={{ width: width <= 600 ? width / 1.5 : width / 4, marginTop: height <= 600 ? (height / 2) / 2 : (height / 2) / 1.7, marginLeft: width / 2 - (width <= 600 ? width / 1.5 : width / 5) / 2 }}
                >
                    <Input
                        id="standard-number"
                        label="amount"
                        type="number"
                        placeholder="Enter Amount"
                        keyboardType='number-pad'

                        style={{ height: 40, width: width <= 600 ? width / 1.5 : width / 5, fontSize: 14, }}
                        value={amount}
                        onChange={amountChange}
                        onKeyPress={onAmountEnter}
                    />

                    <br />
                    <Button style={{ width: width <= 600 ? width / 1.5 : width / 5, height: 40 }} onClick={openCheckout}>
                        Pay
                        </Button>
                </View>
                : null}

            {!Sign && !Login ?
                <View
                    style={{ width: width <= 600 ? width / 1.5 : width / 4, marginTop: height <= 600 ? (height / 2) / 2 : (height / 2) / 1.7, marginLeft: width / 2 - (width <= 600 ? width / 1.5 : width / 5) / 2 }}
                >
                    <Button style={{ width: width <= 600 ? width / 1.5 : width / 5, height: 40 }} onClick={check}>
                        LogIn
                        </Button>

                    <br />
                    <Button style={{ width: width <= 600 ? width / 1.5 : width / 5, height: 40 }} onClick={() => setSignUp(true)}>
                        Signup
                        </Button>
                </View>
                : null}

            {showLogin || Login ?
                <>

                    <View
                        style={{ width: width <= 600 ? width / 1.5 : width / 4, marginTop: height <= 600 ? (height / 2) / 2 : (height / 2) / 1.7, marginLeft: width / 2 - (width <= 600 ? width / 1.6 : width / 5.5) / 2 }}
                    >

                        <Input
                            id="standard-text"
                            label="username"
                            type="text"
                            placeholder="enter username"
                            prefix={<UserOutlined />}
                            style={{ height: 40, width: width <= 600 ? width / 1.5 : width / 5, fontSize: 14, paddingLeft: 4 }}
                            value={username}
                            onChange={handleUsername}
                        />
                        {/* {username.length >= 1 ?
                            <p style={{ position: 'absolute', zIndex: 999, fontSize: 11, marginTop: 39, marginLeft: 12, color: exist ? "red" : "green" }}>{exist ? "already in use" : "available"}</p> : null} */}

                        <Input
                            id="standard-password"
                            label="password"
                            type="text"
                            prefix={<UserOutlined />}
                            type="password"
                            placeholder="enter password"
                            style={{ height: 40, width: width <= 600 ? width / 1.5 : width / 5, fontSize: 14, marginTop: 25, paddingLeft: 4 }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button style={{ width: width <= 600 ? width / 1.5 : width / 5, height: 40, marginTop: 25 }} onClick={Sign ? signUp : login}>
                            {Sign ? "SignUp" : "Login"}
                        </Button>

                    </View >

                </>
                : null
            }
            {showSelect ?
                <View
                    style={{ width: width <= 600 ? width / 1.5 : width / 4, marginTop: height <= 600 ? (height / 2) / 2 : (height / 2) / 1.7, marginLeft: width / 2 - (width <= 600 ? width / 1.5 : width / 5) / 2 }}
                >
                    <Input
                        id="standard-text"
                        label="spacename"
                        type="text"
                        placeholder="Enter spacename"
                        prefix={<UserOutlined />}
                        style={{ height: 40, width: width <= 600 ? width / 1.5 : width / 5, fontSize: 14 }}
                        value={spaceName}
                        onChange={handleSpaceName}
                    />
                    {/* {spaceName.length >= 1 ?
                        <p style={{ position: 'absolute', zIndex: 999, fontSize: 11, marginTop: 39, marginLeft: 12, color: !available ? "red" : "green" }}>{!available ? "already in use" : "available"}</p> : null} */}

                    <Button style={{ width: width <= 600 ? width / 1.5 : width / 5, height: 40, marginTop: 25 }} onClick={selectSpace}>
                        Proceed
                        </Button>
                </View>
                : null}
        </View>

    )

}

