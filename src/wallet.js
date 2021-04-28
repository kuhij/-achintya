//imports
import React, { useState, useEffect } from "react";
import { Dimensions, View, Text } from "react-native";

import firebase from "firebase";
import { useParams, useHistory } from "react-router-dom";

const { width, height } = Dimensions.get("window");

const guestId = "guest_" + Math.random().toString(36).slice(2)
export default function Wallet({ mySpace, online, id }) {
    const { spaceId } = useParams();

    const [balance, setBalance] = useState(null)

    useEffect(() => {
        firebase.database().ref(`/Spaces/${spaceId}/balance`).on("value", function (snap) {
            setBalance(snap.val())
        })
    }, [mySpace, spaceId])

    return (
        <View style={{ height: height, width: width, background: "#fafafa" }}>
            <View style={{ alignItems: 'center', marginTop: height / 2 - 77 }}>
                <h3 style={{ fontWeight: 600, fontSize: 18 }}>Current Balance:- </h3>
                <br />
                <Text style={{ fontSize: 16 }}>{balance}</Text>
            </View>

        </View>
    )
}

