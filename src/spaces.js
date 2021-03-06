//imports
import React, { useState, useEffect } from "react";
import { Dimensions, View, Text } from "react-native";

import { notification, Tooltip, Button } from 'antd';

import TextPage from './text';
import Wallet from './wallet';

import firebase from "firebase";
import { useSwipeable, Swipeable, LEFT, UP, DOWN } from "react-swipeable";
import swal from 'sweetalert';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import YoutubeLiveView from "./creatorView";
import { useParams, useHistory, Redirect } from "react-router-dom";
import { messaging } from './config'
const { width, height } = Dimensions.get("window");


const initialState = {
    value: "",
};


const guestId = "guest_" + Math.random().toString(36).slice(2)
export default function Spaces() {
    const { spaceId } = useParams();
    const history = useHistory();

    const [state, setState] = useState(initialState);
    const [fullData, setFullData] = useState("")
    const [turn, setTurn] = useState("")

    const [name, setName] = useState("")
    const [loggedIn, setLoggedIn] = useState(false)
    const [online, setOnline] = useState(false)
    const [mySpace, setMySpace] = useState("")
    const [showText, setShowText] = useState(false)
    const [showWallet, setShowWallet] = useState(true)
    const [showVideo, setShowVideo] = useState(false)
    const [showYoutube, setShowYoutube] = useState(false)
    const [creator, setCreator] = useState(false)

    const [myVideoId, setMyVideoId] = useState("")
    const [uid, setUid] = useState("")
    const [videoId, setVideoId] = useState("")
    const [token, setToken] = useState("")

    const openNotification = (placement, message) => {
        notification.info({
            message: `Alert`,
            description:
                `${message}`,
            placement
        });
    };

    useEffect(() => {

        messaging.requestPermission().then(function () {
            console.log("permission granted");
            return messaging.getToken()
        })
            .then(function (token) {

                console.log(token);
                setToken(token)
                firebase.database().ref(`/Spaces/${spaceId}/`).update({
                    token: token
                })
            }).catch((error) => {
                console.log('error occured ', error);
            })

    }, [])

    useEffect(() => {
        messaging.onMessage((payload) => {

            console.log("on message works!", payload, payload.data.status);
        });
    }, [])

    useEffect(() => {
        if (creator) {
            swal({
                text: 'Enter video id',
                content: "input",
                button: {
                    text: "Proceed",
                    closeModal: true,
                },
            }).then((value) => {
                if (value) {
                    firebase.database().ref(`/Spaces/${spaceId}/data`).update({
                        being: value,
                    }).then(() => {
                        setMyVideoId(value)
                    })
                } else {
                    //backToHome()
                }
            })
        }
    }, [creator])

    useEffect(() => {

        firebase.database().ref(`/Spaces/${spaceId}/data/being`).once("value", function (snap) {
            if (snap.val()) {
                setVideoId(snap.val())
            }

        })

    }, [myVideoId, videoId, spaceId])

    const writer = () => {
        const path = firebase.database().ref(`/Spaces/${spaceId}/writer`)
        writerFunction(path)
    }

    const writerFunction = (ref) => {
        ref.on("value", (snapshot) => {

            setTurn(snapshot.val())
        });
    }

    //fetching current data from rtdb -- text
    const keyPressFunction = (ref) => {
        let append = ""
        ref.on("value", async function (snapshot) {

            if (snapshot.val()) {

                if (snapshot.val() === null) {
                    return null;
                } else {
                    const current = snapshot.val();
                    console.log(current);
                    setState((e) => ({
                        ...e,
                        value: current,
                    }));
                    append = append + current
                    setFullData(append)

                }
            }
        });
    };

    const listening = () => {
        let docRef = firebase.database().ref(`/Spaces/${spaceId}/data/word`);
        keyPressFunction(docRef);

    };

    const spaceOwnerData = async () => {
        const time = Date.now()
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                setLoggedIn(true)
                //loggedIn user
                const name1 = user.email.replace('@achintya.org', '')
                const id = user.uid
                setName(name1)
                setUid(id)
                console.log('current user ', user);
                firebase.database().ref(`/Users/${id}/`).once("value", function (snap) {
                    setMySpace(snap.val().mySpace)

                    if (spaceId === snap.val().mySpace) {
                        setCreator(true)

                        firebase.database().ref(`/Spaces/${snap.val().mySpace}/`).update({
                            online: true,
                            owner: id,
                            writer: name1,
                            time: firebase.database.ServerValue.TIMESTAMP,
                        })

                        firebase.database().ref(`/Spaces/${snap.val().mySpace}/data`).update({
                            word: `${"<b style=font-size:17px;>" + (name1.charAt(0).toUpperCase() + name1.slice(1)) + " :" + "</b>"}  `,
                        })


                        firebase.database().ref(`/Spaces/${snap.val().mySpace}/`).onDisconnect().update({
                            online: false,
                            writer: name1,
                            time: firebase.database.ServerValue.TIMESTAMP,
                        });
                        firebase.database().ref(`/Spaces/${snap.val().mySpace}/data`).onDisconnect().update({
                            word: ""
                        });
                    } else {
                        firebase.database().ref(`/Users/${id}/`).update({
                            currentSpace: spaceId
                        })
                    }

                    firebase.database().ref(`/Users/${id}/`).onDisconnect().update({
                        currentSpace: snap.val().mySpace
                    })

                })

            } else {
                setName(guestId)
                setLoggedIn(false)
                console.log('not logged in');
            }
        });

        firebase.database().ref(`/Spaces/${spaceId}/`).update({
            count: firebase.database.ServerValue.increment(1),
        })

        firebase.database().ref(`/Spaces/${spaceId}/`).onDisconnect().update({
            count: firebase.database.ServerValue.increment(-1)
        });
        listening();
        writer()
    };

    const onSignOut = () => {
        firebase.auth().signOut().then(() => {

            console.log('successfully signed out');
            backToHome()
            openNotification('bottomLeft', "Successfully logged out.")
        }).catch((error) => {
            console.log(error);
        });

    }

    const backToHome = () => {
        firebase.database().ref(`/Spaces/${mySpace}/`).onDisconnect().cancel()
        firebase.database().ref(`/Spaces/${mySpace}/`).update({
            count: firebase.database.ServerValue.increment(-1),
            online: false,
        })

        history.push("/")
    }

    useEffect(() => {
        const time = Date.now()
        if (spaceId) {
            console.log(spaceId);

            firebase.database().ref(`/Spaces/${spaceId}/online`).on("value", function (snap) {
                setOnline(snap.val())
            })
        }

    }, [spaceId])


    useEffect(() => {
        spaceOwnerData();
    }, []);

    //taking turn on KEY ENTER
    useEffect(() => {

        const listener = (event) => {

            if (event.code === "Enter") {
                TakeTurn()

            }
        };

        // register listener
        document.addEventListener("keydown", listener);

        // clean up function, un register listener on component unmount
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [name, turn, online])

    const enterVideoId = (val) => {
        setState((e) => ({
            ...e,
            value: "",
        }));
        firebase.database().ref(`/Spaces/${spaceId}/`).update({ writer: name })
        firebase.database().ref(`/Spaces/${spaceId}/data`).update({ word: "\n\n", being: val }).then(() => {
            firebase.database().ref(`/Spaces/${spaceId}/data`).update({
                word: `${"<b style=font-size:17px;>" + (name.charAt(0).toUpperCase() + name.slice(1)) + " :" + "</b>"}  `,
            })
        })
    }

    const TakeTurn = () => {
        if (online) {

            if (myVideoId) {
                enterVideoId(myVideoId)

            } else {
                swal({
                    text: 'Enter video id',
                    content: "input",
                    button: {
                        text: "Proceed",
                        closeModal: true,
                    },
                }).then((value) => {

                    if (value) {

                        setMyVideoId(value)
                        enterVideoId(value)

                    } else {
                        console.log('no video id');
                    }
                })
            }
        } else {
            openNotification('bottomLeft', "user is offline.")
        }
    }

    const Text = () => {

        setShowText(true)

        setShowWallet(false)
        setShowYoutube(false)
    }

    const backward = () => {
        setShowVideo(false)
        setShowText(false)
        setShowWallet(true)
        setShowYoutube(false)

    }

    const onYouTube = () => {
        setShowVideo(false)
        setShowYoutube(true)
        setShowWallet(false)
        setShowText(false)
    }

    const onVideo = () => {
        setShowVideo(true)
        setShowYoutube(false)
    }



    function onSwiping({ dir }) {
        if (dir === DOWN) {
            console.log('down');
        }
        if (dir === LEFT) {
            console.log('left');

        }
    }

    return (

        <View style={{ height: height, width: width }}>

            <View>
                <img
                    src="../favicon.png"
                    alt="logo"
                    style={{ height: 22, width: 22, margin: 10, position: 'absolute', zIndex: 9, cursor: 'pointer', marginTop: 14, zIndex: 99 }}
                    onClick={backToHome}
                />
                {/* {mySpace === spaceId ?
                    <Tooltip title="sign out">
                        <View style={{ marginLeft: width <= 600 ? width / 1.05 - 23 : width / 1.05, cursor: 'pointer', position: 'fixed', zIndex: 9, marginTop: 14 }} onClick={onSignOut}>
                            <ExitToAppIcon />
                        </View>
                    </Tooltip>
                    : null} */}
                <View style={{ marginLeft: width / 1.15, position: 'absolute', zIndex: 999, marginTop: 20 }}>
                    <Button style={{ width: width / 10 }} onClick={onYouTube}>YouTube</Button>
                    <br />
                    <Button style={{ width: width / 10 }} onClick={backward}>wallet</Button>
                    <br />
                    <Button style={{ width: width / 10 }} onClick={Text}>Text</Button>
                </View>

                {showText ?
                    <View style={{ height: height, }}>
                        {fullData ?
                            <TextPage
                                currentData={state.value}
                                turn={turn}
                                myName={name}
                                spaceId={spaceId}
                                mySpace={mySpace}
                                online={online}
                                takeTurn={TakeTurn}
                                signout={onSignOut}
                                state={fullData}
                            />
                            : null}
                    </View>
                    : null}

                {showWallet ?
                    <View style={{ height: '100%', width: '100%', }}>

                        <Wallet myName={name} id={uid} mySpace={mySpace} online={online} />

                    </View>
                    : null}

                {showYoutube ?
                    <View style={{ height: height }}>

                        <YoutubeLiveView
                            myName={name} spaceName={spaceId} turn={turn} takeTurn={TakeTurn} online={online} videoId={videoId} myVideoId={myVideoId}
                        />

                    </View>
                    : null}

                {/* <View style={{ marginTop: height / 2.3, position: 'absolute' }}>

                    {!showWallet ?
                        <View style={{ cursor: 'pointer', marginLeft: 20, }} onClick={backward}>
                            <KeyboardArrowLeftIcon style={{ color: 'black' }} />
                        </View>
                        :
                        <View
                            style={{ cursor: 'pointer', marginLeft: width - 45, marginRight: width <= 600 ? '4%' : '2%', }}
                            onClick={forward}
                        >
                            <KeyboardArrowRightIcon style={{ color: 'black' }} />

                        </View>
                    }

                    {showYoutube ?

                        <View style={{ cursor: 'pointer', marginLeft: 20 }} onClick={onVideo}>
                            <KeyboardArrowLeftIcon style={{ color: 'white' }} />
                        </View>
                        :
                        <View style={{ cursor: 'pointer', display: showVideo ? "block" : 'none', marginLeft: width - 45, marginRight: width <= 600 ? '4%' : '2%', position: 'absolute' }} onClick={onYouTube}>
                            <KeyboardArrowRightIcon style={{ color: 'white' }} />
                        </View>
                    }

                </View> */}
            </View>

        </View>

    )
}
