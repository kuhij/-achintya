import React, { useState, useEffect } from "react";
import { Dimensions, View, Text } from "react-native";
import firebase from 'firebase';

import { notification, Button, Input, Form, InputNumber, DatePicker, TimePicker } from 'antd';

import { useHistory, useParams } from "react-router-dom";
import ArcCircle from "./arcCircles";


const { width, height } = Dimensions.get("window");
const code = "code_" + Math.random().toString(36).slice(2)


export default function Dashboard(params) {
    const history = useHistory();
    const { spaceId } = useParams()
    const [quantity, setQuantity] = useState(0)
    const [create, setCreate] = useState(false)
    const [price, setPrice] = useState(0)
    const [scheduleDate, setScheduleDate] = useState(Date.now())

    const [upcomingEvent, setUpComingEvent] = useState({})
    const [timeLeft, setTimeLeft] = useState({})
    const [name, setName] = useState("")
    const [mySpace, setMySpace] = useState("")
    const [loggedIn, setLoggedIn] = useState(false)
    const [show, setShow] = useState(false)
    const [creator, setCreator] = useState(false)
    const [started, setStarted] = useState(false)


    const handleQuantity = (value) => {
        console.log(value);
        setQuantity(value)
    }

    const onChange = (value) => {
        console.log(value);
        setPrice(value)
    }

    useEffect(() => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {

                const name1 = user.email.replace('@achintya.org', '')
                firebase.database().ref(`/Users/${name1}/`).once("value", function (snap) {
                    setMySpace(snap.val().mySpace)
                    console.log(snap.val().mySpace);
                })
                setName(name1)
                setLoggedIn(true)
                console.log('current user ', user);
            }
        })

        firebase.database().ref(`/Spaces/${spaceId}/events/`).on("value", function (snap) {
            if (snap.val()) {
                setUpComingEvent({
                    ...upcomingEvent, data: {
                        time: snap.val().startTime,
                        status: snap.val().status,
                        code: snap.val().passcode,
                        quantity: snap.val().quantity
                    }
                })

            }

        })

    }, [spaceId])

    useEffect(() => {
        if (Object.keys(upcomingEvent).length !== 0) {

            const interval = setInterval(() => {
                let current = Date.now()
                let startTime = upcomingEvent.data.time
                if (current >= startTime && upcomingEvent.data.quantity === 0) {
                    if (upcomingEvent.data.status !== "live") {
                        firebase.database().ref(`/Spaces/${spaceId}/events/`).update({
                            status: "live22"
                        }).then(() => {
                            setStarted(true)
                            clearInterval(interval)
                            console.log('event started');
                        })
                    }

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

        if (loggedIn) {
            if (spaceId === mySpace) {
                setShow(true)
                setCreator(true)
            } else {
                firebase.firestore().collection("Users").doc(name).collection("events").doc(spaceId).get().then((querySnapshot) => {
                    if (querySnapshot.exists) {

                        if (Object.keys(upcomingEvent).length !== 0) {
                            let code = querySnapshot.data().passcode
                            console.log(upcomingEvent.data.code, code);
                            if (code == upcomingEvent.data.code) {
                                setShow(true)
                            } else {
                                setShow(false)
                            }
                        }

                    } else {
                        setShow(false)
                    }

                })
            }

        }
        console.log(loggedIn);
    }, [loggedIn, upcomingEvent, mySpace, show])


    useEffect(() => {
        if (timeLeft.data) {
            console.log(timeLeft.data);
        }

    }, [timeLeft])

    const createEvent = () => {
        firebase.database().ref(`/Spaces/${spaceId}/events/`).update({
            quantity: quantity,
            startTime: Date.parse(scheduleDate),
            price: price,
            status: 'upcoming',
            passcode: code
        }).then(() => {
            setCreate(false)
            alert("submitted successfully")

        })
    }

    const join = () => {
        alert('u joined the event')
    }

    const campaign = () => {
        history.push(`/campaign/${spaceId}`)
    }


    return (
        <View style={{ height: height, width: width }}>
            <img
                src="../favicon.png"
                alt="logo"
                style={{ height: 25, width: 25, margin: 10 }}
                onClick={() => history.push("/")}
            />

            {show ?
                <View style={{ height: height, width: width, overflow: 'hidden' }}>
                    {!create ?
                        <View style={{ width: '100%', marginTop: height <= 600 ? (height / 2) / 4 : (height / 2) / 2 }}>
                            {Object.keys(upcomingEvent).length === 0 && creator ?
                                <Button style={{ width: width <= 600 ? width / 2 : width / 4, height: 40, marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 4) / 2 }} onClick={() => setCreate(true)}>
                                    create campaign
                </Button>
                                :
                                <View style={{ width: "100%", }}>

                                    <Text style={{ textAlign: 'center' }}>{!started ? "Time Since Live" : "Event is live"}</Text>
                                    <br />
                                    {!started ?
                                        // <Text>{timeLeft.data.days} days, {timeLeft.data.hours} hours, {timeLeft.data.minutes} min, {timeLeft.data.seconds} secs</Text>
                                        timeLeft.data ?
                                            <ArcCircle days={timeLeft.data.days} minutes={timeLeft.data.minutes} hours={timeLeft.data.hours} seconds={timeLeft.data.seconds} />
                                            : null
                                        : null}
                                    <br />
                                    <Button
                                        onClick={!started ? campaign : join}
                                        style={{ width: width <= 600 ? width / 2 : width / 4, marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 4) / 2 }}>
                                        {!started ? "go to campaign" : "Join"}
                                    </Button>

                                </View>
                            }
                        </View >
                        :
                        <View
                            style={{ width: width, marginLeft: width / 2 - (width <= 600 ? width / 2 : width / 4) / 2, marginTop: height <= 600 ? (height / 2) / 4 : (height / 2) / 2 }}>
                            <Text>Price:</Text>
                            <InputNumber
                                style={{ marginTop: 5, width: width <= 600 ? width / 2 : width / 4 }}
                                placeholder="ticket price"
                                defaultValue={price}
                                onChange={onChange}
                            />
                            <br />

                            <Text>Quantity</Text>
                            <InputNumber
                                style={{ marginTop: 5, width: width <= 600 ? width / 2 : width / 4 }}
                                placeholder="number of tickets"
                                defaultValue={quantity}
                                onChange={handleQuantity}
                            />
                            <br />

                            <form style={{ marginTop: 5, width: width <= 600 ? width / 2 : width / 4 }}>
                                <label style={{ fontSize: 17 }} htmlFor="time">Select Schedule time:</label>
                                <input
                                    type="datetime-local" id="time"
                                    value={scheduleDate}
                                    name="time"
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    style={{ marginTop: 5, width: width <= 600 ? width / 2 : width / 4 }}
                                />
                            </form>
                            <br />

                            <Button
                                style={{ width: width <= 600 ? width / 2 : width / 4, }}
                                onClick={createEvent}>
                                Submit
                             </Button>

                        </View>
                    }
                </View>
                :
                <Text>You are not authorised user to view this page.</Text>
            }
        </View>
    )

}