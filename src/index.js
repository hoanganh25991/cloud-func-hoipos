import axios from "axios"
import config from "config.json"
import { transform } from "./transform"

const functions = require("firebase-functions")
const admin = require("firebase-admin")

// Config
const _ = console.log
axios.defaults.timeout = 2000
const { ordersApi } = config
admin.initializeApp(functions.config().firebase)

/**
 * Call save orders in hoipos backend
 * To save it to MySQl db
 * @type {*|CloudFunction<DeltaSnapshot>}
 */
export const callUploadOrder = functions.database.ref("/{outletBr}/{orderBr}").onWrite(async event => {
  if (!event.data.exists()) {
    _("[event data]", "No data exist")
    return null
  }

  // _("[event data]", event.data.val())
  const fbCnf = functions.config().firebase
  _("[fbCnf]", fbCnf)

  const { projectId } = fbCnf
  const projectCnf = config[projectId]

  if (!projectId) {
    _("[projectId]", `No cnf for ${projectId}`)
    return null
  }

  const { endpoint } = projectCnf

  // Check if should handle event
  const { outletBr, orderBr } = event.params
  _("[outletBr, orderBr]", outletBr, orderBr)
  const matchOutletBr = outletBr.match(/outlet_(\d+)_orders$/)
  const matchOrderX = orderBr.match(/^order_(\d+)/)
  const shouldHandle = matchOutletBr && matchOrderX && true
  _("[shouldHandle]", shouldHandle)
  if (!shouldHandle) return null

  // Call hoipos-backend > uploadOrders API
  const orderData = event.data.val()
  _("[orderData]", orderData)
  const outlet_id = +matchOutletBr[1]
  _("[outlet_id]", outlet_id)
  const hoiposOrder = transform(orderData)
  _("[hoiposOrder]", hoiposOrder)
  const postUrl = `${endpoint}/${ordersApi}`
  _("[postUrl]", postUrl)

  try {
    const res = await axios.post(postUrl, {
      type: "SAVE_ORDER",
      order: hoiposOrder,
      outlet_id
    })
    _("[res.data]", res.data)
  } catch (err) {
    _("[callApi ERR]", err)
  }

  return null
})
