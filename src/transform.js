import config from "config.json"
const { orderVersion } = config

export const transform = _order => {
  const {
    order,
    customer,
    orderAudits = [],
    parents = [],
    orderPayments = [],
    discounts = [],
    promotions = []
  } = _order
  return {
    ...order,
    ver: orderVersion,
    promotions,
    discounts,
    audits: orderAudits,
    payments: orderPayments,
    customer,
    order_parent_items: parents
  }
}
