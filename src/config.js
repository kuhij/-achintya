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

const app = firebase.initializeApp(config)
export const messaging = app.messaging();
messaging.usePublicVapidKey("BOMtci_z8K7FLTKJcdlg8tQcMmNGhyn-wQesDCm-p24J6Js1x7UPU2k6TBwSY684KZtd9KCRk5uZkueK3C1IO5k");

export default !firebase.apps.length ? app : firebase.app();
