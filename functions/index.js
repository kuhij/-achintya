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
