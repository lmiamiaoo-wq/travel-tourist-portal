const cnNumbers = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }
export const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export function parseCharterReply(text, previous = {}, now = new Date()) {
  const next = { ...previous }
  const counts = [...text.matchAll(/(\d+|[一二两三四五六七八九十])\s*(?:个)?(?:人|位|成人|大人|老人|小孩|孩子|大|小)/g)]
  if (counts.length) next.people = String(counts.reduce((sum, match) => sum + (cnNumbers[match[1]] || Number(match[1])), 0))
  else if (/^\s*(\d+|[一二两三四五六七八九十])\s*$/.test(text) && !previous.people) next.people = String(cnNumbers[text.trim()] || Number(text.trim()))
  const relative = text.match(/大后天|后天|明天|今天/)
  const explicit = text.match(/(?:(\d{4})[-年/])?(\d{1,2})[-月/](\d{1,2})(?:日|号)?/)
  if (relative) {
    const date = new Date(now); date.setDate(date.getDate() + ({ 今天: 0, 明天: 1, 后天: 2, 大后天: 3 }[relative[0]])); next.date = localDate(date)
  } else if (explicit) {
    const year = Number(explicit[1] || now.getFullYear()), month = Number(explicit[2]), day = Number(explicit[3])
    const date = new Date(year, month - 1, day)
    next.date = date.getMonth() === month - 1 && date.getDate() === day ? localDate(date) : ''
  }
  const known = text.match(/黄果树(?:瀑布|景区)?|青岩(?:古镇)?|天河潭|荔波|小七孔|西江(?:千户苗寨)?|梵净山/)
  const destination = text.match(/(?:目的地[是为：:\s]*|想去|去|前往)([^，,。！!？?\s\d]{2,20})/)
  if (known) next.destination = known[0]
  else if (destination) next.destination = destination[1]
  return next
}
export function assessCharter(request, today = localDate(new Date())) {
  const missing = []
  if (!request.people || !Number.isInteger(Number(request.people)) || Number(request.people) < 1) missing.push('包车人数')
  if (!request.date || request.date < today) missing.push('出行日期（今天或之后）')
  if (!request.destination?.trim()) missing.push('目的地')
  if (missing.length) return { text: `请再告诉我${missing.join('、')}，我来帮你匹配包车服务。`, match: false }
  if (Number(request.people) > 4) return { text: `这次有${request.people}人同行，当前舒适5座车型最多可乘坐4位乘客，暂时没有匹配的可下单车型。可以调整人数后重新匹配。`, match: false }
  if (!request.destination.includes('黄果树')) return { text: `已记下${request.people}人、${request.date}前往${request.destination}。当前推荐中只有黄果树一日包车服务，暂时没有该目的地的可下单包车产品。若想去黄果树，可修改目的地后重新匹配。`, match: false }
  return { text: `为你预约黄果树一日包车：${request.people}人，${request.date}出发，舒适5座。包车1天，含8小时、300公里，￥580/天。点击下方卡片查看详情并下单。`, match: true }
}
