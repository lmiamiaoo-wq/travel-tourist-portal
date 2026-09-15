export const charterAmount = ({ type, days }) => type === '日包车' ? 580 * days : 398
export const earliestDeparture = (now = Date.now()) => new Date(Math.ceil((Number(now) + 12 * 60 * 60 * 1000) / 600000) * 600000)
export const localDeparture = date => ({ date: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`, time: `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}` })
export const validDeparture = (date, time, now = Date.now()) => new Date(`${date}T${time}`).getTime() >= Number(now) + 12 * 60 * 60 * 1000
