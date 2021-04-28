import firebase from "firebase";

const config = {
    apiKey: "AIzaSyBmZ-AXOJ0uW6thGCPjtDLLWR2XPh8lcUU",
    authDomain: "achintya-org.firebaseapp.com",
    databaseURL: "https://achintya-org.firebaseio.com",
    projectId: "achintya-org",
    storageBucket: "achintya-org.appspot.com",
    messagingSenderId: "401631217685",
    appId: "1:401631217685:web:1ed2fc7d9e06ba7b"
};
export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
