import React, { useState, useEffect } from "react";
import { Dimensions, View, Text, TextInput, TouchableOpacity } from "react-native";
import firebase from 'firebase';

import { notification, Button, InputNumber } from 'antd';

import { Redirect, useHistory, useParams } from "react-router-dom";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import swal from 'sweetalert';
import ArcCircle from "./arcCircles";


const txnsId = "txns_" + Math.random().toString(36).slice(5)

const { width, height } = Dimensions.get("window");

export default function Campaign(params) {
    const { spaceId } = useParams()
    const history = useHistory()
    const [amount, setAmount] = useState(null)

    const [showNumber, setShowNumber] = useState(true)
    const [showUser, setShowUser] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [exist, setExist] = useState(false)
    const [redirect, setRedirect] = useState(false)

    const [spaceName, setSpaceName] = useState("")
    const [upcomingEvent, setUpComingEvent] = useState({})
    const [timeLeft, setTimeLeft] = useState({})
    const [name, setName] = useState("")
    const [loggedIn, setLoggedIn] = useState(false)

    //manual customized alert 
    const openNotification = (placement, message) => {
        notification.info({
            message: `Alert`,
            description:
                `${message}`,
            placement
        });
    };


    useEffect(() => {
        firebase.database().ref(`/Spaces/${spaceId}/events/`).on("value", function (snap) {
            if (snap.val()) {

                setUpComingEvent({
                    ...upcomingEvent, data: {
                        time: snap.val().startTime,
                        status: snap.val().status,
                        code: snap.val().passcode,
                        quantity: snap.val().quantity,
                        price: snap.val().price
                    }
                })
            }
        })

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                setLoggedIn(true)
                const name1 = user.email.replace('@achintya.org', '')
                setUsername(name1)
                console.log('current user ', user);
            }
        })
    }, [spaceId])

    const amountChange = (e) => {

        const text = e.target.value
        let newText = '';
        let numbers = '0123456789';

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

    useEffect(() => {
        if (upcomingEvent.data) {

            const interval = setInterval(() => {
                let current = Date.now()
                let startTime = upcomingEvent.data.time
                if (current >= startTime) {
                    clearInterval(interval)
                    console.log('event started');
                }

                var difference = startTime - current;

                var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                difference -= daysDifference * 1000 * 60 * 60 * 24

                var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
                difference -= hoursDifference * 1000 * 60 * 60

                var minutesDifference = Math.floor(difference / 1000 / 60);
                difference -= minutesDifference * 1000 * 60

                var secondsDifference = Math.floor(difference / 1000);

                setTimeLeft({
                    ...timeLeft, data: {
                        days: daysDifference,
                        hours: hoursDifference,
                        minutes: minutesDifference,
                        seconds: secondsDifference
                    }
                })
                // console.log(current, startTime, startTime - current, new Date(startTime - current));
            }, 1000);
            console.log(upcomingEvent.data);
        }
    }, [upcomingEvent])

    useEffect(() => {
        if (timeLeft.data) {
            console.log(timeLeft.data);
        }

    }, [timeLeft])

    const login = () => {

        firebase.auth().signInWithEmailAndPassword(username + "@achintya.org", password).then(function (result) {
            console.log(result.user['email'].replace('@achintya.org', ''), result.user)
            const username = result.user['email'].replace('@achintya.org', '')
            const name = result.user.uid
            Buy()
            setUsername(username)
            setRedirect(true)


        }).catch(function (error) {
            const errorCode = error.code;
            const errorMessage = error.message
            console.log(errorMessage, errorCode);
        });

    }

    //number input func on ENTER key press.
    const onAmountEnter = (e) => {
        if (e.nativeEvent.key == "Enter") {
            onKey()
        }
    }

    //number input func on proceed icon.
    const onKey = () => {
        console.log(amount)
        if (amount === null) {
            openNotification('bottomLeft', "Please enter valid amount")
        } else if (amount < 1) {
            openNotification('bottomLeft', upcomingEvent.data.price + " is minimum price")
        } else if (amount % 100 !== 0) {
            openNotification('bottomLeft', "incorrect format")
        } else if (parseInt(amount) > upcomingEvent.data.price) {
            openNotification('bottomLeft', upcomingEvent.data.price + " is maximum price")
        }
        else {
            setShowNumber(false)
            //head to username input
            setShowUser(true)
            console.log(upcomingEvent.data.price, parseInt(amount));
        }

    }

    //username input func on ENTER key press.
    const onUserEnter = (e) => {
        if (e.nativeEvent.key == "Enter") {

            onKey2()

        }
    }

    //username input func on proceed icon.
    const onKey2 = () => {
        if (username === "") {
            openNotification('bottomLeft', "Please Enter Username")
        } else {
            firebase.database().ref(`/Users/${username}`).on("value", function (snap) {
                if (snap.val()) {
                    console.log('user found');
                    setExist(true)

                    setSpaceName(snap.val().mySpace)
                    setShowPassword(true)
                    setShowUser(false)
                } else {
                    console.log('not found');
                    swal({
                        title: "username not found",
                        text: 'SignUp on homepage to buy ticket',
                        icon: 'error',
                        button: {
                            text: "Okay",
                            closeModal: true,
                        },
                    }).then(() => {
                        history.push("/")
                    })
                    setExist(false)
                }
            })

        }

    }



    const saveInFireStore = () => {
        firebase.firestore().collection("Transactions").doc(txnsId).set({
            status: 1,
            time: Date.now(),
            event: spaceId,
            amount: parseInt(amount)
        })

        firebase.database().ref(`/Spaces/${spaceId}/events/`).update({
            quantity: firebase.database.ServerValue.increment(-1)
        }).then(() => {
            firebase.firestore().collection("Users").doc(username).collection("events").doc(spaceId).set({
                event: spaceId,
                passcode: upcomingEvent.data.code
            })
        })
    }

    const Buy = () => {
        saveInFireStore()
        swal({
            title: 'Txns. Successfull',
            text: "you will contacted shortly when event started.",
            icon: 'success',
            button: {
                text: "Okay",
                closeModal: true,
            },
        })
        setRedirect(true)

    }


    const join = () => {
        setRedirect(true)
    }


    return redirect ? <Redirect push to={`/space/${spaceId}`} /> : (
        <View style={{ height: height, width: width, overflow: 'hidden' }}>
            <img
                src="../favicon.png"
                alt="logo"
                style={{ height: 25, width: 25, margin: 10, cursor: 'pointer' }}
                onClick={() => history.push("/")}
            />

            {Object.keys(upcomingEvent).length !== 0 ?
                <View style={{ height: height, width: width, overflow: 'hidden' }}>
                    {upcomingEvent.data.status === "upcoming" ?
                        <View>
                            {upcomingEvent.data.quantity > 0 ?
                                <View style={{ marginTop: height <= 600 ? (height / 2) / 4 : (height / 2) / 2 }}>
                                    {upcomingEvent.data ?
                                        <>
                                            <Text style={{ fontSize: 22, fontWeight: 600, textAlign: 'center' }}>Rs {upcomingEvent.data.quantity * upcomingEvent.data.price}</Text>
                                            <Text
                                                style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}
                                            >
                                                Rs {upcomingEvent.data.price} per/ticket</Text>
                                        </>
                                        : null}
                                    <br />
                                    {showUser && !loggedIn ?
                                        <View style={{ width: "100%", marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 8) / 2 }}>
                                            <TextInput
                                                id="standard-text"
                                                label="username"
                                                type="text"
                                                placeholder="username"
                                                style={{ height: 40, borderColor: 'gray', borderBottomWidth: 1, width: width <= 600 ? width / 2 : width / 8, padding: '1%', fontSize: 12, textAlign: 'center', outline: 'none' }}
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                onKeyPress={onUserEnter}
                                            />
                                            <br />

                                            <Button style={{ width: width <= 600 ? width / 2 : width / 8 }} onClick={onKey2}>
                                                Proceed
                        </Button>

                                        </View>
                                        : null}

                                    {showPassword ?
                                        <View style={{ width: width / 3, marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 8) / 2 }}>
                                            <TextInput
                                                id="standard-password"
                                                label="password"
                                                type="password"
                                                placeholder="password"
                                                secureTextEntry={true}
                                                style={{ height: 40, borderColor: 'gray', borderBottomWidth: 1, width: width <= 600 ? width / 2 : width / 8, padding: '1%', fontSize: 12, textAlign: 'center', outline: 'none' }}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <br />

                                            <Button style={{ width: width <= 600 ? width / 2 : width / 8 }} onClick={login}>
                                                Buy
                        </Button>
                                        </View>
                                        : null}

                                    {showNumber ?
                                        <View style={{ width: "100%", marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 8) / 2 }}>
                                            <TextInput
                                                id="standard-number"
                                                label="amount"
                                                type="number"
                                                placeholder="Enter Amount"
                                                keyboardType='number-pad'
                                                style={{ height: 40, borderColor: 'gray', borderBottomWidth: 1, width: width <= 600 ? width / 2 : width / 8, padding: '1%', fontSize: 12, textAlign: 'center', outline: 'none' }}
                                                value={amount}
                                                onChange={amountChange}
                                                onKeyPress={onAmountEnter}
                                            />

                                            <br />

                                            <Button style={{ width: width <= 600 ? width / 2 : width / 8 }} onClick={!loggedIn ? onKey : Buy}>
                                                {!loggedIn ? "Proceed" : 'Buy'}
                                            </Button>

                                        </View>
                                        : null}

                                </View>
                                :
                                <h2 style={{ textAlign: 'center', marginTop: height <= 600 ? (height / 2) / 2 : (height / 2) / 1.7, }}>Tickets Sold out</h2>
                            }
                            <View style={{ marginTop: width <= 600 ? 75 / 2 : 75 }}>

                                <Text style={{ textAlign: 'center' }}>Time Since Live</Text>
                                <br />
                                {timeLeft.data ?

                                    <ArcCircle days={timeLeft.data.days} minutes={timeLeft.data.minutes} hours={timeLeft.data.hours} seconds={timeLeft.data.seconds} />
                                    : null}
                            </View>

                        </View>
                        :
                        <View style={{ marginTop: height <= 600 ? (height / 2) / 4 : (height / 2) / 2 }} >
                            <Text style={{ textAlign: 'center' }}>Event is live</Text>
                            <br />
                            <Button
                                style={{ width: width <= 600 ? width / 2 : width / 8, marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 8) / 2 }} onClick={join}>
                                Join
        </Button>
                        </View>
                    }
                </View>
                : <h2 style={{ textAlign: 'center' }}>no campaign found</h2>}
        </View >
    )

}