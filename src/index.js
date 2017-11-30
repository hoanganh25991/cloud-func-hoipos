import functions from "firebase-functions"
import admin from "firebase-admin"
import config from "service-account.json"

admin.initializeApp(config);

export const callUploadOrder = functions.database.ref('/tmp').onWrite(event => {
  console.log("[event data]", event.data.val())
  return null
});