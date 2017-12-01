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

  // Default ver: 0
  const orderVersion = order.ver || 0

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
