const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const request = require('request');

const admin = require('firebase-admin');
admin.initializeApp();

exports.subscribeToTopic = functions.database.ref('Spaces/{spaceId}/token')
    .onWrite((change, context) => {

        let topic = change.after.ref.parent.key;

        const registrationToken = change.after.val();
        console.log(topic, registrationToken);

        if (topic === "none") {
            topic = change.before.data().subscription
            console.log(topic);
            // return admin.messaging().unsubscribeFromTopic(registrationToken, topic).then((response) => {
            //     // See the MessagingTopicManagementResponse reference documentation
            //     // for the contents of response.
            //     return console.log('Successfully unsubscribed to topic:', response, topic);
            // })
            //     .catch((error) => {
            //         return console.log('Error unsubscribed to topic:', error);
            //     });
        } else {
            return admin.messaging().subscribeToTopic(registrationToken, topic).then((response) => {
                // See the MessagingTopicManagementResponse reference documentation
                // for the contents of response.
                console.log('Successfully subscribed to topic:', response, registrationToken, topic);
            })
                .catch((error) => {
                    return console.log('Error subscribing to topic:', error);
                });
        }

    });


//notification from rtdb
exports.sendRcommndNotifications = functions.database.ref('Spaces/{spaceId}/data')
    .onUpdate((change, context) => {
        console.log('function triggered')

        const topic = change.after.ref.parent.key;
        //change.after.ref.parent.child("online").on
        //Write to Firestore: here we use the TransmitterError field as an example
        const firestoreDb = admin.firestore();
        const time = Date.now().toString()
        console.log(change.after.ref.parent.key, change.after.val().being)

        // if (change.after.val().currentLetter === "") {
        //     return null;
        // } else {
        // const docRefçerence = firestoreDb.collection("Spaces").doc(topic).collection("words").doc(time);
        // docRefçerence.set({ word: change.after.val().currentLetter, time: Date.now() })

        const message = {
            data: {
                "body": "Hi",
                "status": change.after.val().being,
                'extra field': "extra data"
            },
            topic: topic
        };

        // Send a message to devices subscribed to the provided topic.
        return admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                return console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                return console.log('Error sending message:', error);
            });
        //}accouts/{username}/paypalCaptureId

    });

// exports.onlineStatus = functions.database.ref('Spaces/{spaceId}/online').onUpdate((change, context) => {
//     const value = change.after.val()
//     const time = Date.now()
//     const firestoreDb = admin.firestore();
//     const space = change.after.ref.parent.key
//     let username;
//     console.log(space, username)

//     admin.database().ref(`/Spaces/${space}/owner`).once("value", function (snap) {
//         username = snap.val()
//     })

//     if (value === false) {
//         const docRefçerence = firestoreDb.collection("Spaces").doc(space).collection("Timeline").doc(time.toString());
//         docRefçerence.set({ exit: time, username: username })
//         console.log('updated', space, username);
//     }

// })

//firestore payment verification function
exports.transaction = functions.firestore.document('transactions/{transactionId}')
    .onWrite(async (change, context) => {
        // Grab the current value of what was written to Cloud Firestore.

        // Access the parameter {documentId} with context.params

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to Cloud Firestore.
        // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.

        //const transactionRef = transaction.ref.parent.parent;
        const newValue = await change.after.data().claimedAmount;
        const paidValue = await change.after.data().paidAmount

        const id = await change.after.data().paymentId


        console.log('newValue ', newValue);
        let amount = parseInt(newValue * 100)
        return request({
            method: 'POST',
            url: `https://rzp_live_qdvU5AH65kV8YG:IQTUSvyTuGq5OnyXKuEpeuVP@api.razorpay.com/v1/payments/${id}/capture`,
            form: {
                amount: amount,
                currency: "INR"
            }
        }, ((error, response, body) => {
            //console.log(response);
            //console.log('Status:', response.statusCode);
            //console.log('Headers:', JSON.stringify(response.headers));
            console.log('Response:', body);
            if (response.statusCode === 200) {
                console.log('CAPTURED');
                if (newValue === paidValue) {
                    return console.log('claimed amount is updated in paidAmount');
                } else {
                    change.after.ref.update({ status: "successful", paidAmount: newValue, time: Date.now() })
                    return console.log('value changed');
                }
            } else {
                console.log(newValue);
                return console.log('payment declined');
            }

            //transaction.ref.parent.update({key: 'value'})
        }));
    });
