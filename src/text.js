//imports
import React, { useState, useEffect, useRef } from "react";
import { Dimensions, View, Text, TextInput } from "react-native";

import { notification, Button, Input, Tooltip, Switch } from 'antd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import firebase from "firebase";

import { useParams, useHistory } from "react-router-dom";
const { width, height } = Dimensions.get("window");

export default function TextPage({ currentData, turn, myName, mySpace, online, takeTurn, signout, state }) {
    const { spaceId } = useParams();
    const [word, setWord] = useState("")
    const [showBook, setShowBook] = useState(false)
    const [Width, setWidth] = useState(5)
    const history = useHistory()
    const textRef = useRef()
    const textInputRef = useRef();

    let data = state

    const openNotification = (placement, message) => {
        notification.info({
            message: `Alert`,
            description:
                `${message}`,
            placement
        });
    };

    function onChange(checked1) {
        console.log(`switch to ${checked1}`);
        setShowBook(checked1)
    }

    useEffect(() => {
        console.log(state);
        let remove;

        autoFocus()
        remove = state.replace(/['"]+/g, '')

        var parser = new DOMParser();
        var doc = parser.parseFromString(remove, 'text/html');
        data = doc.body.innerHTML

        textRef.current.innerHTML = data
        //doc.body.getElementsByTagName("b")[0].innerHTML = ".style{color: blue;}";
        //textRef.current.scrollTop = textRef.current.scrollHeight

        console.log(doc.body,);

        console.log(data);


    }, [state, showBook])

    const handleInputMobile = (e) => {
        console.log(e.target.value);
        setWidth(((e.target.value.length + 1) * 7) + 'px')
        setWord(e.target.value)
        const time = Date.now()
        var space = e.target.value.charAt(e.target.value.length - 1)

        // console.log(e.target.value, space);
        if (space == " ") {
            let wrd = word + " "
            // firebase.firestore().collection("Spaces").doc(spaceId).collection("Timeline").doc(time.toString()).set({
            //     username: myName,
            //     word: wrd,
            //     time: time
            // })
            firebase.database().ref(`/Spaces/${spaceId}/data`).update({ word: wrd })

            setWord("")

            console.log('spacebar detected');
        }
    }

    const autoFocus = () => {
        console.log('called');
        if (turn === myName) {
            textInputRef.current.focus()
        }

    }

    const onKeyPress = (e) => {
        console.log(e.target.value);

    }


    return (
        <View>

            <View style={{ position: "absolute", height: height, width: width, background: "#fafafa", overscrollBehaviorY: "contain", scrollSnapType: "y proximity", scrollSnapAlign: "end", overflowY: 'auto', }}>

                <View
                    style={{
                        width: width,
                        height: height,
                        zIndex: 99999,
                        overscrollBehaviorY: "contain", scrollSnapType: "y proximity", scrollSnapAlign: "end", overflowY: 'auto',
                    }}
                >
                    <View style={{ width: width, height: 50, justifyContent: 'center', alignItems: 'center', background: "#fafafa", position: 'fixed' }} >
                        {turn ?
                            <Text style={{ textAlign: 'center', fontFamily: 'Orelega One' }}>
                                <span style={{ fontSize: 19 }}>
                                    {spaceId.charAt(0).toUpperCase() + spaceId.slice(1)}:
                    </span>
                                {" "}{turn}

                                <Tooltip title={online ? "online" : "offline"}>
                                    <View style={{ marginLeft: 6, cursor: 'pointer', background: online ? "green" : "red", height: 9, width: 9, borderRadius: '50%' }}>

                                    </View>
                                </Tooltip>
                            </Text>
                            : null}

                        {/* <Switch

                            onChange={onChange}
                            style={{ width: '3%', marginLeft: width < 600 ? width / 1.50 : width / 1.15, position: 'fixed', }}
                        /> */}

                        {mySpace === spaceId ?
                            <Tooltip title="sign out">
                                <View style={{ marginLeft: width <= 600 ? width / 1.05 - 23 : width / 1.05, cursor: 'pointer', position: 'fixed' }} onClick={signout}>
                                    <ExitToAppIcon />
                                </View>
                            </Tooltip>
                            : null}

                        <View style={{ height: 1, background: 'black', marginTop: 42, position: 'fixed', width: width, }}></View>

                    </View>

                    <View
                        style={{ width: '100%', height: '100%', zIndex: -999, overflow: 'auto', overscrollBehaviorY: "contain", scrollSnapType: "y proximity", scrollSnapAlign: "end", }}
                        onClick={autoFocus}
                    >

                        <View
                            style={{ marginLeft: 10, display: 'flex', flexFlow: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 52, overscrollBehaviorY: "contain", scrollSnapType: "y proximity", scrollSnapAlign: "end", }}>

                            <Text style={{ lineHeight: 30, width: '98%', margin: 'auto', marginTop: 8, marginBottom: 10 }}>

                                <span style={{ fontFamily: 'inherit', fontSize: 15, letterSpacing: 0.4, }} ref={textRef}></span>

                                {turn === myName ?
                                    <input
                                        onChange={handleInputMobile}
                                        value={word}
                                        type="text"
                                        style={{ width: Width, outline: "none", border: "none", color: "#888888", background: 'none' }}
                                        ref={textInputRef}
                                        onkeypress={onKeyPress}
                                    /> : null}

                            </Text>
                        </View>

                    </View >

                </View>

            </View>

        </View>

    )
}