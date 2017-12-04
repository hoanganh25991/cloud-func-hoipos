export const callSaveOrder = ({ outlet_id, order_id, hoiposOrder, postUrl }) => {
  return new Promise((reslv, rejct) => {
    const res = axios.post(postUrl, { outlet_id, type: "SAVE_ORDER", order: hoiposOrder })
    res.then(res => reslv({ outlet_id, order_id, resData: res.data })).catch(err => rejct(err))
    return res
  })
}
