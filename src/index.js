const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

export const callUploadOrder = functions.database.ref('/tmp').onWrite(event => {
  console.log("[event data]", event.data.val())
  return null
});