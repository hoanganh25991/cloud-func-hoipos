import axios from "axios"
import config from "config.json"
import { transform } from "./transform"
import { callSaveOrder } from "./api"

const functions = require("firebase-functions")
const admin = require("firebase-admin")

// Config
const _ = console.log
axios.defaults.timeout = 5000
const { ordersApi } = config
admin.initializeApp(functions.config().firebase)

// Concurrency save on order > conflict in MYSQL Insert
// Store global promise of calling save
// To queue it
let callWait = Promise.resolve()

/**
 * Save order back into MySQL
 * @type {*|CloudFunction<DeltaSnapshot>}
 */
export const callUploadOrder = functions.database.ref("/{outletBr}/{orderBr}").onWrite(event => {
  if (!event.data.exists()) {
    _("[event data]", "No data exists")
    return null
  }

  // Should handle event
  const { outletBr, orderBr } = event.params

  _("[outletBr]", outletBr)
  _("[orderBr]", orderBr)

  const matchOutletBr = outletBr.match(/outlet_(\d+)_orders/)
  const matchOrderX = orderBr.match(/order_(\d+)/)
  const shouldHandle = matchOutletBr && matchOrderX && true
  if (!shouldHandle) return null

  // Get fb admin cnf in .runtimeconfig.json
  const fbCnf = functions.config().firebase
  const { projectId } = fbCnf
  const projectCnf = config[projectId]

  _("[fbCnf]", fbCnf)
  _("[projectCnf]", projectCnf)

  if (!projectCnf) return null

  // Call hoipos-backend > uploadOrders API
  const outlet_id = +matchOutletBr[1]
  const order_id = +matchOrderX[1]
  const orderData = event.data.val()
  const hoiposOrder = transform(orderData)
  const { endpoint } = projectCnf
  const postUrl = `${endpoint}/${ordersApi}`

  _("[outlet_id]", outlet_id)
  _("[order_id]", order_id)
  _("[orderData]", orderData)
  _("[hoiposOrder]", hoiposOrder)
  _("[postUrl]", postUrl)

  // Call Api
  // Log lastCall data
  // Queue this call
  const lastCall = callWait
  const callSaveOrder = callSaveOrder({ outlet_id, order_id, hoiposOrder, postUrl })
  lastCall.then(callData => _("[callSaveOrder]", callData)).catch(err => _("[callSaveOrder ERR]", err))
  callWait = lastCall.then(() => callSaveOrder).catch(() => callSaveOrder)
  return callWait
})
