import React, { useState, useEffect } from "react";
import { Dimensions, View, Text } from "react-native";


const { width, height } = Dimensions.get("window");


export default function ArcCircle({ days, hours, minutes, seconds }) {

    const daysRadius = mapNumber(days, 30, 0, 0, 360);
    const hoursRadius = mapNumber(hours, 24, 0, 0, 360);
    const minutesRadius = mapNumber(minutes, 60, 0, 0, 360);
    const secondsRadius = mapNumber(seconds, 60, 0, 0, 360);

    const SVGCircle = ({ radius }) => (
        <svg className='countdown-svg'>
            <path fill="none" stroke="#333" strokeWidth="2" d={describeArc(50, 50, 40, 0, radius)} />
        </svg>
    );

    // From stackoverflow: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    function describeArc(x, y, radius, startAngle, endAngle) {

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }

    // Stackoverflow: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
    function mapNumber(number, in_min, in_max, out_min, out_max) {
        return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }


    return (
        <div className='countdown-wrapper' >
            {true && (
                <div className='countdown-item'>
                    <SVGCircle radius={daysRadius} />
                    {days}
                    <span>days</span>
                </div>
            )}
            {true && (
                <div className='countdown-item'>
                    <SVGCircle radius={hoursRadius} />
                    {hours}
                    <span>hours</span>
                </div>
            )}
            {true && (
                <div className='countdown-item'>
                    <SVGCircle radius={minutesRadius} />
                    {minutes}
                    <span>minutes</span>
                </div>
            )}
            {true && (
                <div className='countdown-item'>
                    <SVGCircle radius={secondsRadius} />
                    {seconds}
                    <span>seconds</span>
                </div>
            )}
        </div>
    )

}