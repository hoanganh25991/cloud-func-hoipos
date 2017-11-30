const functions = require('firebase-functions');
const admin = require('firebase-admin');
const _ = console.log

admin.initializeApp(functions.config().firebase);

export const callUploadOrder = functions.database.ref('/tmp/{outletId}/{orderId}').onWrite(event => {
  // Check if should handle event
  const {outletId, orderId} = event.params
  _("[ouletId, orderId]", outletId, orderId)
  _("[event data]", event.data.val())


  const matchOrderBrand = outletId.match(/^.+(\d+)_orders$/)
  const matchOrderX     = orderId.match(/^order_(\d+)/)

  const shouldHandle = matchOrderBrand && matchOrderX

  if(!shouldHandle) return null

  _("[shouldHandle]", shouldHandle)

  const orderData = event.data.val()
  _("[orderData]", orderData)

  // Call hoipos-backend > uploadOrders API

  return null
});