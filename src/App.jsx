import React, { useEffect, useState } from 'react'
import {
  ArrowLeftIcon,
  BatteryHighIcon,
  CalendarCheckIcon,
  CellSignalHighIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockIcon,
  HeartIcon,
  ListIcon,
  MapPinIcon,
  NavigationArrowIcon,
  PhoneCallIcon,
  ReceiptIcon,
  RoadHorizonIcon,
  ShareNetworkIcon,
  SparkleIcon,
  WifiHighIcon,
  XIcon,
  XCircleIcon,
} from '@phosphor-icons/react'

const recommendations = [
  {
    id: 'qingyan',
    name: '青岩古镇慢游线',
    shortName: '青岩古镇',
    distance: '1.2 公里',
    duration: '车程 6 分钟',
    reason: '明清石板巷好逛不累，现在出发正好避开人流高峰。',
    price: '198',
    image: '/assets/qingyan-village-panorama.png',
    intro: '明清古镇石巷慢游，司机接送与当地玩法建议一次安排，节奏轻松不赶路。',
    features: ['距当前位置仅 1.2 公里，随时可以出发。', '石板巷、城墙和背街机位都有当地玩法建议。', '可根据老人和孩子的体力实时调整路线。'],
    details: [{ day: '半日', city: '贵阳 · 青岩', spots: '青岩古镇南门 · 石板巷 · 古城墙', meals: '特色小吃自理', hotel: '无住宿安排', text: '从青岩古镇南门进入，沿石板巷慢行，安排古城墙、背街与当地小吃停留。' }],
    fees: { included: [{ label: '用车', text: '当前位置至青岩古镇指定上下车点接送。' }, { label: '服务', text: '推荐官路线建议、实时行程调整与返程协调。' }], excluded: [{ label: '门票', text: '景区门票及景区内自费体验项目。' }, { label: '餐饮', text: '行程中小吃、正餐与个人消费。' }] },
  },
  {
    id: 'tianhetan',
    name: '天河潭飞瀑线',
    shortName: '天河潭',
    distance: '18 公里',
    duration: '车程 32 分钟',
    reason: '飞瀑、溶洞和竹筏游船一次体验，雨后水量正好。',
    price: '168',
    image: '/assets/tianhetan-cascade.png',
    intro: '飞瀑、溶洞与山水栈道组合游玩，适合想看瀑布又希望节奏舒适的家庭。',
    features: ['雨后水量正好，飞瀑景观正处于好看的时段。', '溶洞、瀑布和竹筏游船可按兴趣灵活组合。', '全程安排司机接送，可根据体力减少步行路段。'],
    details: [{ day: '1日', city: '贵阳 · 天河潭', spots: '水瀑群 · 卧龙湖 · 溶洞景观', meals: '景区周边午餐自理', hotel: '无住宿安排', text: '上午从当前位置出发，先看水瀑与湖景，下午体验溶洞或游船，傍晚返回贵阳。' }],
    fees: { included: [{ label: '用车', text: '贵阳市区指定地点往返接送与用车费用。' }, { label: '服务', text: '当地路线建议、上下车点协调与行程时间提醒。' }], excluded: [{ label: '门票', text: '天河潭景区门票、观光车、游船与溶洞项目。' }, { label: '其他', text: '餐饮、个人消费与行程外临时增加的用车。' }] },
  },
]

const quickPrompts = ['想看瀑布', '预算有限', '带老人小孩']

const formatLocalDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addCalendarDays = (date, amount) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)
  return nextDate
}

const formatMonthDay = (date) => `${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`

const getBookingDateOptions = () => {
  const today = new Date()
  return [
    { label: '今天', date: today },
    { label: '明天', date: addCalendarDays(today, 1) },
    { label: addCalendarDays(today, 2).toLocaleDateString('zh-CN', { weekday: 'short' }), date: addCalendarDays(today, 2) },
  ]
}

const formatSelectedMonthDay = (value = '') => {
  const [, month = '', day = ''] = value.split('-')
  return month && day ? `${month}月${day}日` : ''
}

const createDefaultOrder = () => {
  return { travelDate: formatLocalDate(new Date()), adults: 2, children: 0, seniors: 0 }
}

const drawerItems = [
  { label: '我的行程', icon: CalendarCheckIcon },
  { label: '我的订单', icon: ReceiptIcon },
  { label: '我的收藏', icon: HeartIcon },
]

function SystemStatusBar() {
  return (
    <div className="system-status" aria-label="系统状态栏">
      <span className="system-time">9:41</span>
      <div className="system-icons" aria-hidden="true">
        <CellSignalHighIcon weight="fill" />
        <WifiHighIcon weight="bold" />
        <BatteryHighIcon weight="fill" />
      </div>
    </div>
  )
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [input, setInput] = useState('')
  const [toast, setToast] = useState('')
  const [locationUpdated, setLocationUpdated] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [booking, setBooking] = useState(createDefaultOrder)
  const bookingDateOptions = getBookingDateOptions()
  const quickBookingDates = bookingDateOptions.map((option) => formatLocalDate(option.date))
  const isCustomBookingDate = !quickBookingDates.includes(booking.travelDate)

  useEffect(() => {
    document.body.style.overflow = drawerOpen || selectedRoute ? 'hidden' : ''
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        setBookingOpen(false)
        setSelectedRoute(null)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [drawerOpen, selectedRoute])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleSend = (event) => {
    event.preventDefault()
    const message = input.trim()
    if (!message) {
      setToast('先说说你想怎么玩')
      return
    }
    setToast(`已发送：${message}`)
    setInput('')
  }

  const refreshLocation = () => {
    setLocationUpdated(true)
    setToast('实时位置已更新')
  }

  const updateTravelerCount = (key, amount) => {
    setBooking((current) => ({ ...current, [key]: Math.max(0, Math.min(30, current[key] + amount)) }))
  }

  return (
    <div className="app-shell">
      <main className="home-screen">
        <header className="hero" aria-label="贵州风景与顶部导航">
          <img
            className="hero-image"
            src="/assets/sunlit-mountain-lake-hero.png"
            alt="阳光下的森林、群山与碧绿湖泊"
          />
          <div className="hero-scrim" />
          <SystemStatusBar />
          <nav className="top-nav" aria-label="主导航">
            <button className="glass-button icon-button" type="button" onClick={() => setDrawerOpen(true)} aria-label="打开侧边栏">
              <ListIcon weight="bold" />
            </button>
          </nav>
        </header>

        <section className="content-flow">
          <article className="guide-card" aria-labelledby="guide-name">
            <div className="guide-topline">
              <div className="guide-avatar-wrap">
                <img className="guide-avatar" src="/assets/yang-tonghai-avatar.png" alt="推荐官杨通海" />
                <span className="avatar-online-dot" aria-label="当前在线" />
              </div>
              <div className="guide-identity">
                <div className="guide-name-row">
                  <h1 id="guide-name">杨通海</h1>
                  <span className="role-badge"><CheckCircleIcon weight="fill" />推荐官</span>
                </div>
                <p className="guide-role">网约车司机 <span /> 贵州旅游推荐官</p>
                <p className="guide-company">爽行出行 <span /> 贵州文旅合作司机</p>
              </div>
              <button className="share-button" type="button" onClick={() => setToast('推荐官名片链接已复制')} aria-label="分享推荐官名片">
                <ShareNetworkIcon />
              </button>
            </div>
            <p className="guide-intro">跑遍黔山秀水，我为你精选地道景点和美食，并按你的偏好实时调整行程。</p>
            <div className="feature-tags" aria-label="服务特色">
              <span>本地通</span>
              <span>明码标价</span>
              <span>实时调行程</span>
            </div>
          </article>

          <article className="location-card" aria-labelledby="location-title">
            <div className="location-head">
              <h2 id="location-title">我现在的位置</h2>
              <button type="button" onClick={refreshLocation}>
                {locationUpdated ? '刚刚更新' : '实时'}
              </button>
            </div>
            <div className="location-map" aria-hidden="true">
              <img className="location-map-image" src="/assets/qingyan-location-map-detail.png" alt="" />
              <div className="current-pin"><MapPinIcon weight="fill" /></div>
            </div>
            <div className="location-copy">
              <strong>贵阳市，花溪区，青岩古镇南门</strong>
              <span>距景区约 1.2 公里，车正驶向下车点</span>
            </div>
          </article>

          <section className="recommendations" aria-labelledby="nearby-title">
            <div className="section-heading">
              <div>
                <h2 id="nearby-title">附近推荐</h2>
              </div>
            </div>

            <div className="recommendation-track">
              {recommendations.map((route) => (
                <article className="route-card" key={route.id} onClick={() => { setBookingOpen(false); setSelectedRoute(route) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setBookingOpen(false); setSelectedRoute(route) } }} role="button" tabIndex="0" aria-label={`查看${route.shortName}详情`}>
                  <img src={route.image} alt={`${route.shortName}风景`} />
                  <div className="route-card-body">
                    <div className="route-title-row">
                      <h3>{route.shortName}</h3>
                    </div>
                    <div className="distance-row">
                      <span><MapPinIcon weight="fill" />距你 {route.distance}</span>
                      <span>{route.duration}</span>
                    </div>
                    <p>{route.reason}</p>
                    <div className="route-footer">
                      <div className="price"><strong><b>¥</b>{route.price}</strong><span>/人起</span></div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </section>

        <form className="composer" onSubmit={handleSend}>
          <div className="quick-prompts" aria-label="快捷输入">
            {quickPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => setInput(prompt)} className={input === prompt ? 'selected' : ''}>
                <SparkleIcon aria-hidden="true" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
          <div className="input-row">
            <label htmlFor="travel-question" className="sr-only">向推荐官提问</label>
            <input
              id="travel-question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="明天去溶洞，带爸妈，不要太累…"
              autoComplete="off"
            />
            <button className="send-button" type="submit" aria-label="发送问题"><NavigationArrowIcon weight="fill" /></button>
          </div>
        </form>
      </main>

      <div className={`drawer-layer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <button className="drawer-scrim" type="button" onClick={() => setDrawerOpen(false)} aria-label="关闭侧边栏" tabIndex={drawerOpen ? 0 : -1} />
        <aside className="drawer" aria-label="侧边栏导航">
          <div className="drawer-header">
            <strong>个人智能体</strong>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="关闭"><XIcon /></button>
          </div>
          <nav>
            {drawerItems.map(({ label, icon: Icon }) => (
              <button type="button" key={label} onClick={() => { setDrawerOpen(false); setToast(`${label}功能已准备`) }}>
                <span><Icon /></span>{label}<CaretRightIcon />
              </button>
            ))}
          </nav>
          <button className="drawer-profile" type="button" onClick={() => { setDrawerOpen(false); setToast('个人资料功能已准备') }}>
            <img src="/assets/visitor-lin-xiaoyue-avatar.png" alt="游客林晓月" loading="lazy" decoding="async" />
            <span><strong>林晓月</strong><small>游客</small></span>
            <CaretRightIcon />
          </button>
        </aside>
      </div>

      {selectedRoute && (
        <div className="route-detail-layer" role="dialog" aria-modal="true" aria-labelledby="route-detail-title">
          <main className="route-detail-screen">
            <section className="route-detail-scroll" aria-label={`${selectedRoute.shortName}线路详情`}>
              <div className="route-detail-hero">
                <img src={selectedRoute.image} alt={`${selectedRoute.shortName}线路头图`} />
                <div className="route-detail-overlay" />
                <SystemStatusBar />
                <header className="route-detail-topbar">
                  <button type="button" onClick={() => { setBookingOpen(false); setSelectedRoute(null) }} aria-label="返回"><ArrowLeftIcon /></button>
                </header>
              </div>

              <section className="route-product-info">
                <h1 id="route-detail-title">{selectedRoute.shortName}</h1>
                <p>{selectedRoute.intro}</p>
              </section>

              <section className="route-content-block">
                <h2><SparkleIcon />行程特色</h2>
                <ul className="route-check-list">
                  {selectedRoute.features.map((feature) => <li key={feature}><CheckCircleIcon weight="fill" /><span>{feature}</span></li>)}
                </ul>
              </section>

              <section className="route-content-block">
                <h2><CalendarCheckIcon />行程速览</h2>
                <div className="route-itinerary-list">
                  {selectedRoute.details.map((detail) => (
                    <article key={`${detail.day}-${detail.city}`}>
                      <div className="route-itinerary-head"><strong>{detail.day}</strong><span>{detail.city}</span></div>
                      <dl>
                        <div><dt>景点</dt><dd>{detail.spots}</dd></div>
                        <div><dt>三餐</dt><dd>{detail.meals}</dd></div>
                        <div><dt>住宿</dt><dd>{detail.hotel}</dd></div>
                      </dl>
                      <p>{detail.text}</p>
                      <img src={selectedRoute.image} alt={`${selectedRoute.shortName}行程配图`} />
                    </article>
                  ))}
                </div>
              </section>

              <section className="route-content-block">
                <h2><img className="expense-title-icon" src="/assets/expense-center.svg" alt="" aria-hidden="true" />费用说明</h2>
                <div className="route-fee-groups">
                  <section className="route-fee-group included">
                    <h3><CheckCircleIcon weight="fill" />此行程费用包含：</h3>
                    <dl>{selectedRoute.fees.included.map((fee) => <div key={fee.label}><dt>【{fee.label}】</dt><dd>{fee.text}</dd></div>)}</dl>
                  </section>
                  <section className="route-fee-group excluded">
                    <h3><XCircleIcon weight="fill" />此行程费用不包含：</h3>
                    <dl>{selectedRoute.fees.excluded.map((fee) => <div key={fee.label}><dt>【{fee.label}】</dt><dd>{fee.text}</dd></div>)}</dl>
                  </section>
                </div>
              </section>
            </section>

            <footer className="route-bottom-cta">
              <div className="route-detail-price"><strong>¥{selectedRoute.price}</strong><span>/人起</span></div>
              <button className="route-book-button" type="button" onClick={() => setBookingOpen(true)}>立即下单</button>
            </footer>

            {bookingOpen && (
              <div className="booking-sheet" role="dialog" aria-modal="true" aria-labelledby="booking-title">
                <button className="booking-backdrop" type="button" aria-label="关闭下单信息" onClick={() => setBookingOpen(false)} />
                <section className="booking-panel">
                  <div className="booking-handle" />
                  <h2 id="booking-title">立即下单</h2>
                  <p>{selectedRoute.shortName}</p>
                  <div className="booking-form">
                    <fieldset>
                      <legend>出行时间</legend>
                      <div className="booking-date-options" aria-label="选择出行日期">
                        {bookingDateOptions.map((option) => {
                          const value = formatLocalDate(option.date)
                          const selected = booking.travelDate === value
                          return (
                            <button className={`booking-date-card${selected ? ' selected' : ''}`} type="button" key={value} aria-pressed={selected} onClick={() => setBooking({ ...booking, travelDate: value })}>
                              <span className="booking-date-status">可订</span>
                              <strong>{option.label}</strong>
                              <span>{formatMonthDay(option.date)}</span>
                            </button>
                          )
                        })}
                        <label className={`booking-date-card booking-date-custom${isCustomBookingDate ? ' selected' : ''}`}>
                          <span>
                            <strong>{isCustomBookingDate ? '已选日期' : '指定日期'}</strong>
                            {isCustomBookingDate && <span>{formatSelectedMonthDay(booking.travelDate)}</span>}
                          </span>
                          <CaretRightIcon weight="bold" aria-hidden="true" />
                          <input aria-label="指定出行日期" type="date" min={quickBookingDates[0]} value={booking.travelDate} onInput={(event) => { const { value: travelDate } = event.target; if (travelDate) setBooking((current) => ({ ...current, travelDate })) }} />
                        </label>
                      </div>
                    </fieldset>
                    <fieldset><legend>出行人数</legend><div className="traveler-grid">{[{ key: 'adults', label: '成人', hint: '18-64周岁' }, { key: 'children', label: '儿童', hint: '2-18周岁' }, { key: 'seniors', label: '老人', hint: '65周岁以上' }].map((traveler) => <label key={traveler.key}><span><strong>{traveler.label}</strong><small>{traveler.hint}</small></span><div className="traveler-stepper" aria-label={`${traveler.label}数量`}><button type="button" aria-label={`减少${traveler.label}人数`} onClick={() => updateTravelerCount(traveler.key, -1)} disabled={booking[traveler.key] === 0}>−</button><output>{booking[traveler.key]}</output><button type="button" aria-label={`增加${traveler.label}人数`} onClick={() => updateTravelerCount(traveler.key, 1)}>+</button></div></label>)}</div></fieldset>
                  </div>
                  <div className="booking-action-bar"><div><span>参考基础金额</span><strong>¥{(Number(selectedRoute.price) * (booking.adults + booking.children + booking.seniors)).toLocaleString('zh-CN')}</strong></div><button type="button" onClick={() => { setBookingOpen(false); setSelectedRoute(null); setToast('订单已提交') }}>立即下单</button></div>
                </section>
              </div>
            )}
          </main>
        </div>
      )}

      <div className="home-indicator" aria-hidden="true" />
      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  )
}

export default App
