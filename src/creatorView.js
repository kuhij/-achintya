import React, { useEffect, useState, useRef } from "react";
import { View, Dimensions } from "react-native";
import YouTube from "react-player";
import { IconButton, Button as MButton } from "@material-ui/core";

import {
    MicOffRounded,
    MicRounded,
} from "@material-ui/icons";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import firebase from "firebase";
import { useHistory, useParams } from "react-router-dom";


const { width, height } = Dimensions.get("window");

export default function YoutubeLiveView({ myName, turn, takeTurn, videoId, spaceName, }) {

    const [audioOn, setAudioOn] = useState(false)
    const [startPlay, setStartPlay] = useState(false)

    return (
        <View style={{ height: height, overflow: 'hidden' }}>
            <View
                style={{
                    height: height,
                    width: width,
                    overflow: 'hidden',
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >

                <View style={{ height: height, width: width }}>
                    {/* <video style={{ width: '100vw', height: height, margin: 0, opacity: expression ? 0 : 1 }} ref={video} autoPlay playsInline muted={expression ? true : false}></video> */}

                    <YouTube
                        width={width}
                        height={height}
                        playing={true}
                        muted={audioOn}
                        style={{ position: "absolute", top: 0, left: 0, height: height, width: width }}
                        url={"https://www.youtube.com/watch?v=" + videoId}
                    />

                </View>
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: "100%",
                    }}
                ></View>

            </View>
            <div className="inner-container" style={{ position: 'absolute', marginTop: height - 80 }}>

                <div className="video-overlay" >
                    {turn !== myName ?
                        <IconButton
                            aria-label="Take Turn"
                            style={{
                                backgroundColor: "firebrick",
                                marginLeft: width <= 600 ? width / 2 - 60 : width / 2 - 30,
                            }}
                            onClick={takeTurn}
                        >
                            <TouchAppIcon style={{ fontSize: 20, color: "#fff", }} />

                        </IconButton>
                        : null
                    }
                    <IconButton
                        aria-label="Mute Audio"
                        style={{
                            backgroundColor: !audioOn ? "#ff5e78" : "black",
                            marginLeft: turn !== myName ? 30 : width / 2 - 30
                        }}
                        onClick={() => setAudioOn(!audioOn)}
                    >
                        {audioOn ? (
                            <MicRounded style={{ fontSize: 20, color: "#fff", }} />
                        ) : (
                                <MicOffRounded style={{ fontSize: 20, color: "#fff" }} />
                            )}
                    </IconButton>

                    {/* {!startPlay ?
                        <IconButton
                            aria-label="Mute Audio"
                            style={{
                                backgroundColor: "black",
                                marginLeft: 30
                            }}
                            onClick={() => setStartPlay(true)}
                        >
                            <PlayArrowIcon style={{ fontSize: 35, color: "#fff", }} />
                        </IconButton>
                        : null} */}
                </div>
            </div>
        </View>
    );
}
