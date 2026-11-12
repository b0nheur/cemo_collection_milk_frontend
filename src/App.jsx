import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Tooltip, Legend, Filler,
} from 'chart.js'
import {
  Activity, Banknote, BarChart3, Bell, Boxes, ChevronDown, CircleDollarSign, ClipboardList,
  Droplets, FileBarChart, LayoutDashboard, LogOut, Menu, Milk, Plus, Search, Settings,
  ShoppingCart, Truck, Users, Wallet, X,
} from 'lucide-react'
import './App.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const NAV = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  { label: 'Suppliers', icon: Users, path: '/suppliers', roles: ['administrator', 'manager'] },
  { label: 'Milk collection', icon: Droplets, path: '/collections', roles: ['administrator', 'manager', 'milk_collector'] },
  { label: 'Buyers', icon: Truck, path: '/buyers', roles: ['administrator', 'manager'] },
  { label: 'Milk sales', icon: ShoppingCart, path: '/sales', roles: ['administrator', 'manager', 'accountant'] },
  { label: 'Payments', icon: Wallet, path: '/payments', roles: ['administrator', 'manager', 'accountant'] },
  { label: 'Stock', icon: Boxes, path: '/stock', roles: ['administrator', 'manager', 'milk_collector'] },
  { label: 'Expenses', icon: CircleDollarSign, path: '/expenses', roles: ['administrator', 'manager', 'accountant'] },
  { label: 'Reports', icon: FileBarChart, path: '/reports', roles: ['administrator', 'manager', 'accountant'] },
  { label: 'User management', icon: Settings, path: '/users', roles: ['administrator'] },
]
const money = (value) => `${Number(value || 0).toLocaleString('en-US')} RWF`
const liters = (value) => `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 })} L`

async function api(path, options = {}) {
  const token = localStorage.getItem('cemo_token')
  try {
    const response = await axios({
      url: `${API_URL}${path}`,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'The API request failed.')
  }
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('cemo_token', token)
      onLogin(user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="login-shell">
      <section className="login-art">
        <div className="login-brand"><span className="brand-mark"><Milk size={22} /></span><span>CEMO<span className="brand-light"> MILK</span></span></div>
        <div className="login-message"><span className="eyebrow">COLLECT. CARE. GROW.</span><h1>Better milk.<br />Better livelihoods.</h1><p>One clear view of every litre, every supplier, and every payment.</p></div>
        <div className="login-stat"><Droplets size={18} /><span>Made for Rwanda's dairy community</span></div>
      </section>
      <section className="login-form-wrap"><form className="login-form" onSubmit={submit}>
        <div className="login-small-logo"><span className="brand-mark"><Milk size={21} /></span><span>CEMO</span></div>
        <span className="eyebrow">WELCOME BACK</span><h2>Sign in to CEMO</h2><p className="muted">Enter your work account details to continue.</p>
        <label>Email address<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@cemo.rw" required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required /></label>
        {error && <div className="error-banner" role="alert">{error}</div>}
        <button className="primary-button login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<span>→</span></button>
        <p className="login-note">Administrator access is created with the backend seed command.</p>
      </form></section>
    </main>
  )
}

function Shell({ user, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const current = NAV.find((item) => item.path === location.pathname) || NAV[0]
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><span className="brand-mark"><Milk size={21} /></span><span>CEMO<span className="brand-light"> MILK</span><small>COLLECTION SYSTEM</small></span><button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav">{NAV.filter((item) => !item.roles || item.roles.includes(user?.role)).map(({ label, icon: Icon, path }) => <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span>{label === 'Milk collection' && <span className="nav-dot" />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><div className="help-icon"><Activity size={17} /></div><strong>Need a hand?</strong><span>Our team is here to help.</span><a href="mailto:support@cemo.rw">Contact support <span>↗</span></a></div><button className="nav-link" onClick={onLogout}><LogOut size={18} /><span>Sign out</span></button></div>
      <div className="sidebar-foot">CEMO MILK MANAGEMENT <span>v1.0</span></div>
    </aside>
    {menuOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="main-column">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <b>{current.label}</b></div><div className="top-actions"><span className="date-label">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="profile"><div className="avatar">{(user?.fullName || 'C').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div className="profile-copy"><strong>{user?.fullName || 'CEMO User'}</strong><span>{user?.role || 'Administrator'}</span></div><ChevronDown size={15} /></div></div></header>
      <main className="page-content">{children}</main>
    </div>
  </div>
}

function useResource(endpoint) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api(endpoint)
      setData(response.data ?? response)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint])
  useEffect(() => { reload() }, [reload])
  return { data, loading, error, reload }
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

function MetricCard({ label, value, note, icon: Icon, tone = 'green', change }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={18} /></span></div><strong className="metric-value">{value}</strong><div className="metric-foot">{change && <span className="metric-change">{change}</span>}<span>{note}</span></div></article>
}

function Dashboard({ user }) {
  const { data: dashboard, loading, error, reload } = useResource('/reports/dashboard')
  const cards = [
    { label: 'Registered suppliers', value: dashboard.suppliers?.total ?? '—', note: `${dashboard.suppliers?.farmers ?? 0} farmers · ${dashboard.suppliers?.abadongi ?? 0} Abadongi`, icon: Users, tone: 'green', change: `${dashboard.suppliers?.active ?? 0} active` },
    { label: "Today's collection", value: loading ? '…' : liters(dashboard.collection?.today), note: 'Milk received today', icon: Droplets, tone: 'blue', change: 'Live' },
    { label: 'Monthly collection', value: loading ? '…' : liters(dashboard.collection?.month), note: `${liters(dashboard.collection?.grade1)} Grade 1 · ${liters(dashboard.collection?.grade2)} Grade 2`, icon: Milk, tone: 'amber', change: 'This month' },
    { label: 'Milk sold this month', value: loading ? '…' : liters(dashboard.sales?.litresMonth), note: `${money(dashboard.sales?.month)} sales revenue`, icon: ShoppingCart, tone: 'blue', change: 'This month' },
    { label: 'Supplier payments due', value: loading ? '…' : money(dashboard.payments?.outstanding), note: `${money(dashboard.payments?.paidMonth)} paid this month`, icon: Banknote, tone: 'purple', change: 'Outstanding' },
  ]
  const canViewFinance = ['administrator', 'manager', 'accountant'].includes(user.role)
  const months = dashboard.monthly || []
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#14291f', padding: 11 } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: '#89958d', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: '#edf1ee' }, border: { display: false }, ticks: { color: '#89958d', font: { size: 11 } } } } }
  const collectionChart = { labels: months.map((item) => item.label), datasets: [{ label: 'Grade 1', data: months.map((item) => Number(item.grade1)), borderColor: '#19764b', backgroundColor: '#19764b', borderRadius: 5, maxBarThickness: 26 }, { label: 'Grade 2', data: months.map((item) => Number(item.grade2)), borderColor: '#b5d8c5', backgroundColor: '#b5d8c5', borderRadius: 5, maxBarThickness: 26 }] }
  const salesChart = { labels: months.map((item) => item.label), datasets: [{ label: 'Sales (RWF)', data: months.map((item) => Number(item.sales)), borderColor: '#298c60', backgroundColor: 'rgba(41,140,96,.1)', pointBackgroundColor: '#fff', pointBorderColor: '#298c60', pointRadius: 3, fill: true, tension: .35 }] }
  return <>
    <PageHeading eyebrow={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()} title="Good morning" description="Here’s what’s happening across your dairy operations today." action={<button className="primary-button" onClick={reload}><Activity size={16} /> Refresh dashboard</button>} />
    {error && <div className="error-banner"><span>{error}</span><button onClick={reload}>Retry</button></div>}
    <section className="metrics-grid">{cards.filter((card) => canViewFinance || !['Milk sold this month', 'Supplier payments due'].includes(card.label)).map((card) => <MetricCard key={card.label} {...card} />)}</section>
    <section className={`charts-grid ${canViewFinance ? '' : 'chart-single'}`}>
      <article className="panel chart-panel"><div className="panel-heading"><div><h2>Milk production</h2><p>Monthly litres by quality grade</p></div><span className="select-chip">Last 6 months <ChevronDown size={14} /></span></div><div className="chart-area">{months.length ? <Bar data={collectionChart} options={chartOptions} /> : <EmptyChart loading={loading} />}</div><div className="chart-legend"><span><i className="legend-green" /> Grade 1</span><span><i className="legend-mint" /> Grade 2</span><span className="chart-total">{liters(dashboard.collection?.month)} <small>this month</small></span></div></article>
      {canViewFinance && <article className="panel chart-panel"><div className="panel-heading"><div><h2>Sales performance</h2><p>Monthly sales revenue</p></div><span className="select-chip">Last 6 months <ChevronDown size={14} /></span></div><div className="chart-area">{months.length ? <Line data={salesChart} options={chartOptions} /> : <EmptyChart loading={loading} />}</div><div className="sales-total">{money(dashboard.sales?.month)}<span>Revenue this month</span></div></article>}
    </section>
    <section className="bottom-grid"><article className="panel stock-summary"><div className="panel-heading"><div><h2>Milk stock</h2><p>Available for sale right now</p></div><Boxes size={18} className="panel-icon" /></div><div className="stock-item"><div><span>Grade 1</span><strong>{liters(dashboard.stock?.grade1)}</strong></div><div className="stock-track"><i className="stock-g1" style={{ width: `${Math.min(100, dashboard.stock?.grade1 ? 76 : 0)}%` }} /></div></div><div className="stock-item"><div><span>Grade 2</span><strong>{liters(dashboard.stock?.grade2)}</strong></div><div className="stock-track"><i className="stock-g2" style={{ width: `${Math.min(100, dashboard.stock?.grade2 ? 52 : 0)}%` }} /></div></div><div className="stock-total"><span>Total stock</span><strong>{liters(dashboard.stock?.total)}</strong></div></article><article className="panel quick-actions"><div className="panel-heading"><div><h2>Quick actions</h2><p>Get the workday moving</p></div></div><div className="quick-grid"><NavLink to="/collections"><span className="quick-icon green"><Plus size={17} /></span><span><strong>Record collection</strong><small>Log a new delivery</small></span><span className="quick-arrow">↗</span></NavLink><NavLink to="/sales"><span className="quick-icon blue"><ShoppingCart size={17} /></span><span><strong>Record milk sale</strong><small>Update buyer and stock</small></span><span className="quick-arrow">↗</span></NavLink><NavLink to="/suppliers"><span className="quick-icon amber"><Users size={17} /></span><span><strong>Add a supplier</strong><small>Register a new partner</small></span><span className="quick-arrow">↗</span></NavLink><NavLink to="/reports"><span className="quick-icon purple"><BarChart3 size={17} /></span><span><strong>View reports</strong><small>Explore your performance</small></span><span className="quick-arrow">↗</span></NavLink></div></article></section>
  </>
}

function EmptyChart({ loading }) {
  return <div className="empty-chart">{loading ? 'Loading your figures…' : 'No reporting data yet. Record a delivery or sale to get started.'}</div>
}

const MODULES = {
  '/suppliers': { title: 'Supplier directory', noun: 'supplier', endpoint: '/suppliers', eyebrow: 'PARTNERS', description: 'Manage your farmers and Abadongi in one place.', icon: Users, roles: ['administrator', 'manager'], fields: [['fullName', 'Full name', 'text', true], ['phone', 'Phone number', 'tel', true], ['location', 'Location', 'text', true], ['type', 'Supplier type', 'select', true, ['Farmer', 'Abadongi']]], columns: [['fullName', 'Supplier'], ['supplierCode', 'Supplier ID'], ['phone', 'Phone'], ['location', 'Location'], ['type', 'Type'], ['status', 'Status']], search: 'Search name, phone or supplier ID…' },
  '/collections': { title: 'Milk collection', noun: 'delivery', endpoint: '/deliveries', eyebrow: 'OPERATIONS', description: 'Record supplier deliveries and machine quality readings.', icon: Droplets, roles: ['administrator', 'manager', 'milk_collector'], fields: [['supplierId', 'Supplier', 'supplier', true], ['quantityLitres', 'Quantity (litres)', 'number', true], ['grade', 'Milk grade', 'select', true, ['Grade 1', 'Grade 2']], ['deliveryDate', 'Delivery date', 'date', true], ['recordedBy', 'Recorded by', 'text', true], ['fat', 'Fat reading (%)', 'number'], ['density', 'Density reading', 'number'], ['temperature', 'Temperature (°C)', 'number'], ['qualityNotes', 'Quality notes', 'text']], columns: [['supplierName', 'Supplier'], ['deliveryDate', 'Date'], ['quantityLitres', 'Litres'], ['grade', 'Grade'], ['pricePerLitre', 'Price / L'], ['totalPayment', 'Total payment'], ['recordedBy', 'Recorded by']], search: 'Search supplier or grade…' },
  '/buyers': { title: 'Buyer directory', noun: 'buyer', endpoint: '/buyers', eyebrow: 'PARTNERS', description: 'Companies and markets that purchase your milk.', icon: Truck, roles: ['administrator', 'manager'], fields: [['buyerName', 'Buyer name', 'text', true], ['companyName', 'Company name', 'text'], ['phone', 'Phone number', 'tel'], ['address', 'Address', 'text'], ['type', 'Buyer type', 'select', true, ['Company', 'Market', 'Individual']]], columns: [['buyerName', 'Buyer'], ['companyName', 'Company'], ['phone', 'Phone'], ['address', 'Address'], ['type', 'Type']], search: 'Search buyers…' },
  '/sales': { title: 'Milk sales', noun: 'sale', endpoint: '/sales', eyebrow: 'REVENUE', description: 'Record sales and keep an accurate view of available stock.', icon: ShoppingCart, roles: ['administrator', 'manager', 'accountant'], fields: [['buyerId', 'Buyer', 'buyer', true], ['grade', 'Milk grade', 'select', true, ['Grade 1', 'Grade 2']], ['quantityLitres', 'Quantity (litres)', 'number', true], ['pricePerLitre', 'Selling price / litre (RWF)', 'number', true], ['saleDate', 'Sale date', 'date', true], ['recordedBy', 'Recorded by', 'text', true]], columns: [['buyerName', 'Buyer'], ['saleDate', 'Date'], ['grade', 'Grade'], ['quantityLitres', 'Litres'], ['pricePerLitre', 'Price / L'], ['totalAmount', 'Total amount'], ['recordedBy', 'Recorded by']], search: 'Search buyer or grade…' },
  '/payments': { title: 'Supplier payments', noun: 'payment', endpoint: '/payments', eyebrow: 'FINANCE', description: 'Reconcile earned supplier balances against recorded payouts.', icon: Wallet, roles: ['administrator', 'manager', 'accountant'], fields: [['supplierId', 'Supplier', 'supplier', true], ['amount', 'Amount paid (RWF)', 'number', true], ['paymentDate', 'Payment date', 'date', true], ['method', 'Payment method', 'select', true, ['Mobile Money', 'Bank transfer', 'Cash']], ['reference', 'Reference / receipt no.', 'text'], ['notes', 'Notes', 'text']], columns: [['supplierName', 'Supplier'], ['paymentDate', 'Date'], ['amount', 'Amount paid'], ['method', 'Method'], ['reference', 'Reference']], search: 'Search supplier or receipt…' },
  '/expenses': { title: 'Company expenses', noun: 'expense', endpoint: '/expenses', eyebrow: 'FINANCE', description: 'Log operating costs and keep your profit and loss current.', icon: CircleDollarSign, roles: ['administrator', 'manager', 'accountant'], fields: [['category', 'Category', 'select', true, ['Transport', 'Employee salaries', 'Electricity', 'Maintenance', 'Other']], ['description', 'Description', 'text', true], ['amount', 'Amount (RWF)', 'number', true], ['expenseDate', 'Date', 'date', true], ['recordedBy', 'Recorded by', 'text']], columns: [['category', 'Category'], ['description', 'Description'], ['expenseDate', 'Date'], ['amount', 'Amount']], search: 'Search category or description…' },
}

function PaymentBalances({ suppliers }) {
  const { data, loading } = useResource('/payments/balances')
  const totals = data.reduce((result, supplier) => ({
    earned: result.earned + Number(supplier.earned),
    paid: result.paid + Number(supplier.paid),
    outstanding: result.outstanding + Number(supplier.outstanding),
  }), { earned: 0, paid: 0, outstanding: 0 })
  return <div className="balances-wrap">
    <div className="balance-cards"><div><span>Total earned</span><strong>{loading ? '…' : money(totals.earned)}</strong></div><div><span>Paid to suppliers</span><strong>{loading ? '…' : money(totals.paid)}</strong></div><div><span>Outstanding</span><strong>{loading ? '…' : money(totals.outstanding)}</strong></div></div>
    <div className="balance-table"><div className="balance-caption"><strong>Supplier balances</strong><span>Calculated from recorded deliveries minus payments</span></div><div className="table-scroll"><table><thead><tr><th>Supplier</th><th>Supplier ID</th><th>Earned</th><th>Paid</th><th>Unpaid balance</th></tr></thead><tbody>{data.length ? data.map((item) => <tr key={item.supplierId}><td>{item.supplierName}</td><td>{item.supplierCode}</td><td>{money(item.earned)}</td><td>{money(item.paid)}</td><td><strong>{money(item.outstanding)}</strong></td></tr>) : <tr><td colSpan="5" className="table-empty">{loading ? 'Loading balances…' : 'No active suppliers.'}</td></tr>}</tbody></table></div></div>
    <span className="sr-only">{suppliers.length} active suppliers available for payment entry</span>
  </div>
}

function getDisplayValue(value, key) {
  if (value === null || value === undefined || value === '') return '—'
  if (['amount', 'totalAmount', 'totalPayment'].includes(key)) return money(value)
  if (key === 'pricePerLitre') return `${money(value)}/L`
  if (key === 'quantityLitres') return liters(value)
  if (key.toLowerCase().includes('date')) return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return String(value)
}

function SupplierHistoryDialog({ supplier, onClose }) {
  const { data, loading, error } = useResource(`/suppliers/${supplier.id}/history`)
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card history-card"><div className="modal-heading"><div><span className="eyebrow">SUPPLIER DELIVERY RECORDS</span><h2>{supplier.fullName}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>{error && <div className="error-banner">{error}</div>}<div className="table-scroll"><table><thead><tr><th>Date</th><th>Litres</th><th>Grade</th><th>Fat</th><th>Density</th><th>Temperature</th><th>Payment</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td>{getDisplayValue(item.deliveryDate, 'deliveryDate')}</td><td>{liters(item.quantityLitres)}</td><td>{item.grade}</td><td>{item.fat ?? '—'}</td><td>{item.density ?? '—'}</td><td>{item.temperature ?? '—'}</td><td>{money(item.totalPayment)}</td></tr>)}{!data.length && <tr><td colSpan="7" className="table-empty">{loading ? 'Loading delivery history…' : 'No deliveries recorded for this supplier.'}</td></tr>}</tbody></table></div></section></div>
}

function ResourcePage({ config }) {
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7))
  const [supplierFilter, setSupplierFilter] = useState('')
  const listEndpoint = config.endpoint === '/payments'
    ? `${config.endpoint}?month=${reportMonth}${supplierFilter ? `&supplierId=${supplierFilter}` : ''}`
    : config.endpoint
  const { data, loading, error, reload } = useResource(listEndpoint)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [historySupplier, setHistorySupplier] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const { data: suppliers } = useResource(config.endpoint === '/sales' || config.endpoint === '/payments' || config.endpoint === '/deliveries' ? '/suppliers?status=active' : '/suppliers')
  const { data: buyers } = useResource(config.endpoint === '/sales' ? '/buyers?status=active' : '/buyers?status=inactive')
  const filtered = useMemo(() => data.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase()))), [data, search])
  function openForm(row) {
    setEditing(row || null)
    setFormError('')
    setModal(true)
  }
  async function submit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const body = Object.fromEntries(formData.entries())
    setSaving(true)
    setFormError('')
    try {
      await api(`${config.endpoint}${editing ? `/${editing.id}` : ''}`, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(body) })
      setModal(false)
      await reload()
    } catch (requestError) {
      setFormError(requestError.message)
    } finally {
      setSaving(false)
    }
  }
  async function remove(row) {
    if (!window.confirm(`Deactivate ${row.fullName || row.buyerName || row.description || config.noun + ' #' + row.id}?`)) return
    try {
      await api(`${config.endpoint}/${row.id}`, { method: 'DELETE' })
      await reload()
    } catch (requestError) {
      window.alert(requestError.message)
    }
  }
  async function downloadReceipt(row) {
    try {
      const token = localStorage.getItem('cemo_token')
      const response = await axios.get(`${API_URL}/payments/${row.id}/receipt`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `cemo-payment-${row.id}.pdf`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      window.alert(requestError.response?.data?.message || requestError.message)
    }
  }
  const Icon = config.icon
  const action = <button className="primary-button" onClick={() => openForm()}><Plus size={17} /> Add {config.noun}</button>
  return <>
    <PageHeading eyebrow={config.eyebrow} title={config.title} description={config.description} action={action} />
    <section className="panel data-panel">{config.endpoint === '/payments' && <PaymentBalances suppliers={suppliers} />}<div className="table-toolbar"><div className="table-title"><Icon size={18} /><strong>{config.title}</strong><span>{filtered.length} records</span></div><label className="search-field"><Search size={16} /><input placeholder={config.search} value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
      {config.endpoint === '/payments' && <div className="payment-filters"><label>Supplier<select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}><option value="">All suppliers</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.fullName}</option>)}</select></label><label>Payment month<input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} /></label></div>}
      {error && <div className="inline-error">{error} <button onClick={reload}>Retry</button></div>}
      <div className="table-scroll"><table><thead><tr>{config.columns.map(([key, title]) => <th key={key}>{title}</th>)}<th className="action-column">Actions</th></tr></thead><tbody>
        {loading ? <tr><td colSpan={config.columns.length + 1} className="table-empty">Loading records…</td></tr> : filtered.length ? filtered.map((row) => <tr key={row.id}>{config.columns.map(([key]) => <td key={key}>{key === 'grade' ? <span className={`badge ${row[key] === 'Grade 1' ? 'badge-green' : 'badge-blue'}`}>{row[key]}</span> : key === 'type' || key === 'status' ? <span className="badge badge-neutral">{row[key]}</span> : getDisplayValue(row[key], key)}</td>)}<td className="row-actions">{config.endpoint === '/suppliers' && <button onClick={() => setHistorySupplier(row)}>History</button>}{config.endpoint === '/payments' && <button onClick={() => downloadReceipt(row)}>Receipt</button>}{config.endpoint !== '/payments' && <button onClick={() => openForm(row)}>Edit</button>}<button className="danger-text" onClick={() => remove(row)}>Remove</button></td></tr>) : <tr><td colSpan={config.columns.length + 1} className="table-empty">No records found. Add your first {config.noun} to get started.</td></tr>}
      </tbody></table></div><div className="table-footer">Showing {filtered.length} of {data.length} records <span>Live data · CEMO API</span></div></section>
    {historySupplier && <SupplierHistoryDialog supplier={historySupplier} onClose={() => setHistorySupplier(null)} />}
    {modal && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(false) }}><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">{editing ? 'UPDATE RECORD' : 'NEW RECORD'}</span><h2>{editing ? 'Edit' : 'Add'} {config.noun}</h2></div><button type="button" className="icon-button" onClick={() => setModal(false)} aria-label="Close"><X size={19} /></button></div><div className="form-grid">{config.fields.map(([name, label, type, required, options]) => <label key={name} className={name === 'notes' ? 'form-wide' : ''}>{label}{type === 'select' || type === 'supplier' || type === 'buyer' ? <select name={name} required={required} defaultValue={editing?.[name] || ''}><option value="" disabled>Select {label.toLowerCase()}</option>{(type === 'supplier' ? suppliers.map((item) => [item.id, `${item.fullName} · ${item.supplierCode}`]) : type === 'buyer' ? buyers.map((item) => [item.id, item.buyerName]) : options.map((item) => [item, item])).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> : <input name={name} type={type} required={required} min={type === 'number' ? '0.01' : undefined} step={type === 'number' ? '0.01' : undefined} defaultValue={editing?.[name] ?? (type === 'date' ? new Date().toISOString().slice(0, 10) : '')} />}</label>)}</div>
        {config.endpoint === '/deliveries' && <div className="form-hint">Grade 1 is paid at 500 RWF/L. Grade 2 is paid at 400 RWF/L. Supplier payment is calculated automatically from the recorded grade and litres.</div>}
        {config.endpoint === '/sales' && <div className="form-hint">A sale can only be recorded when enough milk of the selected grade is in stock.</div>}
        {formError && <div className="error-banner">{formError}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save record'}</button></div></form></div>}
  </>
}

function StockPage() {
  const { data, loading, error, reload } = useResource('/stock')
  const { data: movements } = useResource('/stock/movements')
  const [modal, setModal] = useState(false)
  const [formError, setFormError] = useState('')
  async function reject(event) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget).entries())
    try {
      await api('/stock/rejected', { method: 'POST', body: JSON.stringify(body) })
      setModal(false)
      setFormError('')
      await reload()
    } catch (requestError) { setFormError(requestError.message) }
  }
  return <><PageHeading eyebrow="INVENTORY" title="Milk stock" description="Live grade-level inventory and a complete movement history." action={<div className="export-actions"><button className="secondary-button" onClick={() => setModal(true)}>Record rejected milk</button><button className="secondary-button" onClick={reload}>Refresh stock</button></div>} />{error && <div className="error-banner">{error}</div>}<div className="metrics-grid stock-metrics"><MetricCard label="Grade 1 available" value={loading ? '…' : liters(data.grade1)} note="Ready for sale" icon={Milk} tone="green" /><MetricCard label="Grade 2 available" value={loading ? '…' : liters(data.grade2)} note="Ready for sale" icon={Droplets} tone="blue" /><MetricCard label="Total available" value={loading ? '…' : liters(data.total)} note="All grades" icon={Boxes} tone="amber" /><MetricCard label="Rejected / spoiled" value={loading ? '…' : liters(data.rejected)} note="Recorded waste" icon={Activity} tone="purple" /></div><div className="panel data-panel"><div className="table-toolbar"><div className="table-title"><ClipboardList size={18} /><strong>Stock movement history</strong><span>{movements.length} movements</span></div></div><div className="table-scroll"><table><thead><tr><th>Date</th><th>Movement</th><th>Grade</th><th>Quantity</th><th>Reference</th><th>Recorded by</th></tr></thead><tbody>{movements.map((item) => <tr key={item.id}><td>{getDisplayValue(item.createdAt, 'date')}</td><td><span className={`badge ${item.movementType === 'sale' ? 'badge-blue' : item.movementType === 'rejected' ? 'badge-neutral' : 'badge-green'}`}>{item.movementType}</span></td><td>{item.grade}</td><td>{liters(item.quantityLitres)}</td><td>{item.reference || '—'}</td><td>{item.recordedBy || '—'}</td></tr>)}{!movements.length && <tr><td colSpan="6" className="table-empty">{loading ? 'Loading stock movements…' : 'No stock movements have been recorded.'}</td></tr>}</tbody></table></div></div>{modal && <div className="modal-backdrop"><form className="modal-card" onSubmit={reject}><div className="modal-heading"><div><span className="eyebrow">STOCK ADJUSTMENT</span><h2>Record rejected milk</h2></div><button type="button" className="icon-button" onClick={() => setModal(false)} aria-label="Close"><X size={18} /></button></div><div className="form-grid"><label>Milk grade<select name="grade" required defaultValue=""><option value="" disabled>Select grade</option><option>Grade 1</option><option>Grade 2</option></select></label><label>Quantity (litres)<input name="quantityLitres" type="number" step="0.01" min="0.01" required /></label><label className="form-wide">Reason<input name="reason" required /></label></div>{formError && <div className="error-banner">{formError}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button">Record rejection</button></div></form></div>}</>
}

function ReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10))
  const [exportType, setExportType] = useState('monthly')
  const [report, setReport] = useState([])
  const [finance, setFinance] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    setBusy(true)
    setError('')
    try {
      const response = await api(`/reports/monthly?month=${month}`)
      setReport(response.data || [])
      const financialReport = await api(`/reports/finance?month=${month}`)
      setFinance(financialReport.data)
    } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
  }, [month])
  useEffect(() => { load() }, [load])
  async function download(format) {
    try {
      const token = localStorage.getItem('cemo_token')
      const dateQuery = exportType === 'daily-collection' ? `&date=${reportDate}` : ''
      const response = await axios.get(`${API_URL}/reports/export?type=${exportType}&month=${month}${dateQuery}&format=${format}`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' })
      const blob = response.data
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `cemo-${exportType}-${month}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (requestError) { setError(requestError.message) }
  }
  return <><PageHeading eyebrow="INSIGHTS" title="Monthly reports" description="Compare supplier deliveries, review company performance and export records." action={<div className="export-actions"><button className="secondary-button" onClick={() => download('pdf')}><FileBarChart size={16} /> Download PDF</button><button className="primary-button" onClick={() => download('excel')}>Export Excel</button></div>} /><section className="panel report-filter"><label>Reporting month<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label><label>Report to export<select value={exportType} onChange={(e) => setExportType(e.target.value)}><option value="monthly">Monthly milk collection</option><option value="daily-collection">Daily milk collection</option><option value="payments">Supplier payments</option><option value="sales">Milk sales</option><option value="stock">Stock movements</option><option value="expenses">Company expenses</option><option value="profit-loss">Profit &amp; loss</option></select></label>{exportType === 'daily-collection' && <label>Collection date<input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} /></label>}<span>Export reports as PDF or Excel.</span></section>{error && <div className="error-banner">{error}</div>}<section className="metrics-grid finance-metrics"><MetricCard label="Milk sales revenue" value={busy ? '…' : money(finance?.revenue)} note="Selected month" icon={ShoppingCart} tone="green" /><MetricCard label="Supplier milk costs" value={busy ? '…' : money(finance?.supplierCosts)} note="Recorded delivery value" icon={Droplets} tone="blue" /><MetricCard label="Operating expenses" value={busy ? '…' : money(finance?.expenses)} note="Recorded expenses" icon={CircleDollarSign} tone="amber" /><MetricCard label="Profit / loss" value={busy ? '…' : money(finance?.profitOrLoss)} note="Revenue less supplier costs and expenses" icon={Banknote} tone="purple" /></section><section className="panel data-panel"><div className="table-toolbar"><div className="table-title"><BarChart3 size={18} /><strong>Supplier milk summary</strong><span>{report.length} suppliers</span></div><span className="report-period">{month}</span></div><div className="table-scroll"><table><thead><tr><th>Supplier</th><th>Grade 1</th><th>Grade 2</th><th>Total litres</th><th>Previous month</th><th>Change</th><th>Change %</th><th>Total payment</th></tr></thead><tbody>{busy ? <tr><td colSpan="8" className="table-empty">Loading report…</td></tr> : report.length ? report.map((row) => <tr key={row.supplierId}><td><strong>{row.supplierName}</strong></td><td>{liters(row.grade1)}</td><td>{liters(row.grade2)}</td><td><strong>{liters(row.totalLitres)}</strong></td><td>{liters(row.previousMonthLitres)}</td><td className={row.changeLitres >= 0 ? 'positive-text' : 'negative-text'}>{row.changeLitres > 0 ? '+' : ''}{liters(row.changeLitres)}</td><td>{row.changePercent.toFixed(1)}%</td><td>{money(row.totalPayment)}</td></tr>) : <tr><td colSpan="8" className="table-empty">No delivery records for this month.</td></tr>}</tbody></table></div><div className="table-footer">Changes are compared with the previous calendar month.</div></section></>
}

function UserManagement() {
  const { data, loading, error, reload } = useResource('/auth/users')
  const [modal, setModal] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget).entries())
    setSaving(true)
    setSaveError('')
    try {
      await api('/auth/users', { method: 'POST', body: JSON.stringify(body) })
      setModal(false)
      await reload()
    } catch (requestError) { setSaveError(requestError.message) } finally { setSaving(false) }
  }
  async function setStatus(user, status) {
    if (!window.confirm(`${status === 'inactive' ? 'Deactivate' : 'Reactivate'} ${user.fullName}?`)) return
    try {
      await api(`/auth/users/${user.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      await reload()
    } catch (requestError) { window.alert(requestError.message) }
  }
  return <><PageHeading eyebrow="ADMINISTRATION" title="User management" description="Create team accounts and control access to the CEMO workspace." action={<button className="primary-button" onClick={() => setModal(true)}><Plus size={16} /> Add user</button>} /><section className="panel data-panel"><div className="table-toolbar"><div className="table-title"><Users size={18} /><strong>Team accounts</strong><span>{data.length} users</span></div></div>{error && <div className="inline-error">{error}<button onClick={reload}>Retry</button></div>}<div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="table-empty">Loading users…</td></tr> : data.map((item) => <tr key={item.id}><td><strong>{item.fullName}</strong></td><td>{item.email}</td><td>{item.role.replaceAll('_', ' ')}</td><td><span className={`badge ${item.status === 'active' ? 'badge-green' : 'badge-neutral'}`}>{item.status}</span></td><td>{getDisplayValue(item.createdAt, 'createdAt')}</td><td className="row-actions"><button className={item.status === 'active' ? 'danger-text' : ''} onClick={() => setStatus(item, item.status === 'active' ? 'inactive' : 'active')}>{item.status === 'active' ? 'Deactivate' : 'Reactivate'}</button></td></tr>)}</tbody></table></div></section>{modal && <div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><div className="modal-heading"><div><span className="eyebrow">TEAM ACCESS</span><h2>Create a user</h2></div><button type="button" className="icon-button" onClick={() => setModal(false)} aria-label="Close"><X size={18} /></button></div><div className="form-grid"><label>Full name<input name="fullName" required /></label><label>Email address<input name="email" type="email" required /></label><label>Password (10+ characters)<input name="password" type="password" minLength="10" required /></label><label>Role<select name="role" required defaultValue="milk_collector"><option value="administrator">Administrator</option><option value="manager">Manager</option><option value="milk_collector">Milk collector</option><option value="accountant">Accountant</option></select></label></div>{saveError && <div className="error-banner">{saveError}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? 'Creating…' : 'Create user'}</button></div></form></div>}</>
}

function AppRouter() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('cemo_token')))
  useEffect(() => {
    if (!localStorage.getItem('cemo_token')) return
    api('/auth/me').then((response) => setUser(response.user)).catch(() => localStorage.removeItem('cemo_token')).finally(() => setChecking(false))
  }, [])
  if (checking) return <div className="loading-screen"><span className="loading-mark"><Milk size={22} /></span>Preparing your workspace…</div>
  if (!user) return <Login onLogin={setUser} />
  const logout = () => { localStorage.removeItem('cemo_token'); setUser(null) }
  return <Shell user={user} onLogout={logout}><Routes><Route path="/" element={<Dashboard user={user} />} />{Object.entries(MODULES).map(([path, config]) => <Route key={path} path={path} element={config.roles.includes(user.role) ? <ResourcePage config={config} /> : <Navigate to="/" replace />} />)}<Route path="/stock" element={['administrator', 'manager', 'milk_collector'].includes(user.role) ? <StockPage /> : <Navigate to="/" replace />} /><Route path="/reports" element={['administrator', 'manager', 'accountant'].includes(user.role) ? <ReportsPage /> : <Navigate to="/" replace />} /><Route path="/users" element={user.role === 'administrator' ? <UserManagement /> : <Navigate to="/" replace />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Shell>
}

export default function App() {
  return <BrowserRouter><AppRouter /></BrowserRouter>
}
