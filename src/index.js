import axios from "axios"
const functions = require('firebase-functions')
const admin = require('firebase-admin')
import config from "config.json"

const _ = console.log
axios.defaults.timeout = 2000
const {hoiPosEndpoint, orderVersion} = config
admin.initializeApp(functions.config().firebase);

/**
 * Call save orders in hoipos backend
 * To save it to MySQl db
 * @type {*|CloudFunction<DeltaSnapshot>}
 */
export const callUploadOrder = functions.database.ref('/tmp/{outletBr}/{orderBr}').onWrite(async event => {
  _("[event data]", event.data.val())

  // Check if should handle event
  const {outletBr, orderBr} = event.params
  _("[ouletId, orderBr]", outletBr, orderBr)
  const matchOutletBr = outletBr.match(/^.+(\d+)_orders$/)
  const matchOrderX   = orderBr.match(/^order_(\d+)/)
  const shouldHandle  = matchOutletBr && matchOrderX && true
  _("[shouldHandle]", shouldHandle)
  if(!shouldHandle) return null

  // Call hoipos-backend > uploadOrders API
  const orderData = event.data.val()
  orderData.ver = orderVersion
  _("[orderData]", orderData)
  const outlet_id = +matchOutletBr[1]

  const res = await axios.post(hoiPosEndpoint, {
    type:"SAVE_ORDERS",
    orders:[orderData],
    outlet_id
  })

  return null
});