import axios from "axios"
import config from "config.json"
import { transform } from "./transform"

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
export const callUploadOrder = functions.database.ref("/{outletBr}/{orderBr}").onWrite(async event => {
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

  try {
    // Wait for last call
    await callWait

    // Update callWait to this call
    callWait = axios.post(postUrl, {
      type: "SAVE_ORDER",
      order: hoiposOrder,
      outlet_id
    })

    // Log result
    return callWait.then(res => _("[callApi]", "outlet_id|order_id|res.data", outlet_id, order_id, res.data))
  } catch (err) {
    _("[callApi]", "ERR", err)
    return null
  }
})
