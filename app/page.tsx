'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  BarChart3,
  ListTodo,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

type TabType = 'rekap' | 'log' | 'akun'

// Express Backend Base URL
const BACKEND_URL = 'http://localhost:5001/api/socialforce'

interface PeriodSummary {
  activities: {
    like: number
    komentar: number
    share: number
    upload: number
  }
  totalAccounts: number
  activeAccounts: number
  inactiveAccounts: number
}

interface LogItem {
  id: string
  waktu: string
  akun: string
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Facebook' | 'X'
  aktivitasType: 'Upload' | 'Komentar' | 'Like' | 'Share'
  aktivitasLabel: string
  status: 'Berhasil' | 'Menunggu approval' | 'Gagal'
  createdAt?: string
}

interface AccountItem {
  id: string
  code: string
  name: string
  username: string
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Facebook' | 'X'
  status: 'Aktif' | 'Tidak aktif'
  koneksi: 'Terhubung' | 'Terputus'
}

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rekap')
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // 1. SUMMARY STATE
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days' | 'thisMonth'>('7days')
  const [summaryData, setSummaryData] = useState<PeriodSummary>({
    activities: { like: 0, komentar: 0, share: 0, upload: 0 },
    totalAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
  })

  // 2. LOGS STATE (Server-side search, pagination, limit)
  const [logs, setLogs] = useState<LogItem[]>([])
  const [logFilterTab, setLogFilterTab] = useState<string>('Semua')
  const [logSearch, setLogSearch] = useState('')
  const [logPage, setLogPage] = useState(1)
  const [logLimit, setLogLimit] = useState(10)
  const [logTotal, setLogTotal] = useState(0)
  const [logTotalPages, setLogTotalPages] = useState(1)
  const [logLoading, setLogLoading] = useState(false)

  const [newLog, setNewLog] = useState<Partial<LogItem>>({
    waktu: '10:00',
    akun: '@social_',
    platform: 'Instagram',
    aktivitasType: 'Like',
    aktivitasLabel: 'Like Konten',
    status: 'Berhasil',
  })
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editLogData, setEditLogData] = useState<Partial<LogItem>>({})

  // 3. ACCOUNTS STATE (Server-side search, pagination, limit)
  const [accounts, setAccounts] = useState<AccountItem[]>([])
  const [accountPlatformFilter, setAccountPlatformFilter] = useState('Semua')
  const [accountStatusFilter, setAccountStatusFilter] = useState('Semua')
  const [accountSearch, setAccountSearch] = useState('')
  const [accountPage, setAccountPage] = useState(1)
  const [accountLimit, setAccountLimit] = useState(10)
  const [accountTotal, setAccountTotal] = useState(0)
  const [accountTotalPages, setAccountTotalPages] = useState(1)
  const [accountLoading, setAccountLoading] = useState(false)

  const [newAccount, setNewAccount] = useState<Partial<AccountItem>>({
    name: 'Social Account 101',
    username: '@social_101',
    platform: 'Instagram',
    status: 'Aktif',
    koneksi: 'Terhubung',
  })
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editAccountData, setEditAccountData] = useState<Partial<AccountItem>>({})

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Fetch Summary dari Express Backend
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/summary`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data?.periods) {
          const p = json.data.periods[selectedPeriod] || json.data.periods['7days']
          setSummaryData(p)
        }
      }
    } catch (err) {
      console.error('Error fetching summary:', err)
    }
  }

  // Fetch Logs dengan hit API setiap kali parameter berubah
  const fetchLogs = async () => {
    setLogLoading(true)
    try {
      const params = new URLSearchParams({
        page: logPage.toString(),
        limit: logLimit.toString(),
        tab: logFilterTab,
        search: logSearch.trim(),
      })
      const res = await fetch(`${BACKEND_URL}/logs?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setLogs(json.data || [])
          if (json.pagination) {
            setLogTotal(json.pagination.total)
            setLogTotalPages(json.pagination.totalPages)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
    } finally {
      setLogLoading(false)
    }
  }

  // Fetch Accounts dengan hit API setiap kali parameter berubah
  const fetchAccounts = async () => {
    setAccountLoading(true)
    try {
      const params = new URLSearchParams({
        page: accountPage.toString(),
        limit: accountLimit.toString(),
        platform: accountPlatformFilter,
        status: accountStatusFilter,
        search: accountSearch.trim(),
      })
      const res = await fetch(`${BACKEND_URL}/accounts?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setAccounts(json.data || [])
          if (json.pagination) {
            setAccountTotal(json.pagination.total)
            setAccountTotalPages(json.pagination.totalPages)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
    } finally {
      setAccountLoading(false)
    }
  }

  // Initial & Tab triggers
  useEffect(() => {
    fetchSummary()
  }, [selectedPeriod])

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 250)
    return () => clearTimeout(timer)
  }, [logPage, logLimit, logFilterTab, logSearch])

  useEffect(() => {
    const timer = setTimeout(fetchAccounts, 250)
    return () => clearTimeout(timer)
  }, [accountPage, accountLimit, accountPlatformFilter, accountStatusFilter, accountSearch])

  // Refresh All
  const handleRefreshAll = () => {
    setLoading(true)
    Promise.all([fetchSummary(), fetchLogs(), fetchAccounts()]).finally(() => setLoading(false))
  }

  // Log Handlers
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${BACKEND_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      })
      if (res.ok) {
        showNotification('Log Aktivitas baru berhasil ditambahkan!')
        setNewLog({
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          akun: '@social_',
          platform: 'Instagram',
          aktivitasType: 'Like',
          aktivitasLabel: 'Like Konten',
          status: 'Berhasil',
        })
        fetchLogs()
        fetchSummary()
      }
    } catch (err) {
      alert('Gagal menambah log')
    }
  }

  const handleDeleteLog = async (id: string) => {
    if (!confirm('Hapus log ini?')) return
    try {
      const res = await fetch(`${BACKEND_URL}/logs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showNotification('Log berhasil dihapus!')
        fetchLogs()
        fetchSummary()
      }
    } catch (err) {
      alert('Gagal menghapus log')
    }
  }

  const handleUpdateLog = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/logs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLogData),
      })
      if (res.ok) {
        showNotification('Log berhasil diperbarui!')
        setEditingLogId(null)
        fetchLogs()
        fetchSummary()
      }
    } catch (err) {
      alert('Gagal update log')
    }
  }

  // Account Handlers
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${BACKEND_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      })
      if (res.ok) {
        showNotification('Akun SocialForce baru berhasil ditambahkan!')
        fetchAccounts()
        fetchSummary()
      }
    } catch (err) {
      alert('Gagal menambah akun')
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Hapus akun ini?')) return
    try {
      const res = await fetch(`${BACKEND_URL}/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showNotification('Akun berhasil dihapus!')
        fetchAccounts()
        fetchSummary()
      }
    } catch (err) {
      alert('Gagal menghapus akun')
    }
  }

  const handleUpdateAccount = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAccountData),
      })
      if (res.ok) {
        showNotification('Akun berhasil diperbarui!')
        setEditingAccountId(null)
        fetchAccounts()
        fetchSummary()
      }
    } catch (err) {
      alert('Gagal update akun')
    }
  }

  const totalInteraksi =
    summaryData.activities.like +
    summaryData.activities.komentar +
    summaryData.activities.share +
    summaryData.activities.upload

  const activePercent =
    summaryData.totalAccounts > 0
      ? Math.round((summaryData.activeAccounts / summaryData.totalAccounts) * 100)
      : 0
  const inactivePercent = 100 - activePercent

  return (
    <div className="min-h-screen bg-[#0c0d14] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600/95 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 backdrop-blur-md animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#121421]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">CMS SocialForce</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Orkestrasi Siber
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
          <a
            href="http://localhost:3000/manajemen-aksi"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka SISTRA
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('rekap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'rekap'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            1. Input Rekap & Status Akun
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'log'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            2. Log Aktivitas ({logTotal})
          </button>
          <button
            onClick={() => setActiveTab('akun')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'akun'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            3. Manajemen Akun ({accountTotal})
          </button>
        </div>

        {/* TAB 1: REKAP AKTIVITAS & STATUS AKUN */}
        {activeTab === 'rekap' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141624] border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-base font-semibold text-white">Summary Dashboard Card (Auto Dari API Database)</h2>
                <p className="text-xs text-slate-400">
                  Data rekap aktivitas dan status akun dihitung otomatis dari tabel <b>Log Aktivitas</b> dan <b>Manajemen Akun</b> 
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Periode:</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="today">Hari Ini</option>
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="thisMonth">Bulan Ini</option>
                </select>
                <button
                  onClick={fetchSummary}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sinkronkan
                </button>
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="bg-[#10121d] border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-5 border-b border-slate-800/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">Dashboard SocialForce</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Orkestrasi Siber
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Rekap eksekusi aktivitas buzzer & status operasional akun media sosial SocialForce.
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 font-medium">
                  {selectedPeriod === 'today'
                    ? 'Hari Ini'
                    : selectedPeriod === '7days'
                    ? '7 Hari Terakhir'
                    : selectedPeriod === '30days'
                    ? '30 Hari Terakhir'
                    : 'Bulan Ini'}
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: Rekap Aktivitas */}
                <div className="bg-[#141726]/70 border border-slate-800/70 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-white">Rekap Aktivitas</h4>
                      <span className="text-[11px] text-blue-400 font-medium bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded">
                        Total {logTotal} Log
                      </span>
                    </div>
                    <div className="space-y-4">
                      {/* Like */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium w-20">Like</span>
                          <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round((summaryData.activities.like / (Math.max(summaryData.activities.like, summaryData.activities.komentar, summaryData.activities.share, summaryData.activities.upload) || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-bold w-16 text-right">
                            {summaryData.activities.like.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Komentar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium w-20">Komentar</span>
                          <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round((summaryData.activities.komentar / (Math.max(summaryData.activities.like, summaryData.activities.komentar, summaryData.activities.share, summaryData.activities.upload) || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-bold w-16 text-right">
                            {summaryData.activities.komentar.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Share */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium w-20">Share</span>
                          <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round((summaryData.activities.share / (Math.max(summaryData.activities.like, summaryData.activities.komentar, summaryData.activities.share, summaryData.activities.upload) || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-bold w-16 text-right">
                            {summaryData.activities.share.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Upload */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium w-20">Upload</span>
                          <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round((summaryData.activities.upload / (Math.max(summaryData.activities.like, summaryData.activities.komentar, summaryData.activities.share, summaryData.activities.upload) || 1)) * 100))}%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-bold w-16 text-right">
                            {summaryData.activities.upload.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Total {totalInteraksi.toLocaleString('id-ID')} interaksi tercatat
                    </span>
                    <button
                      onClick={() => setActiveTab('log')}
                      className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700/60 flex items-center gap-1.5"
                    >
                      Buka Tabel Log &rarr;
                    </button>
                  </div>
                </div>

                {/* Column 2: Status Akun */}
                <div className="bg-[#141726]/70 border border-slate-800/70 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-white">Status Akun</h4>
                      <span className="text-xs text-slate-400 font-medium">
                        {summaryData.totalAccounts} akun terdaftar
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-white">
                          {summaryData.activeAccounts}
                        </span>
                        <span className="text-sm text-slate-400">
                          / {summaryData.totalAccounts} aktif
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar 2-color */}
                    <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${activePercent}%` }}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{ width: `${inactivePercent}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-6 mt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-slate-300 font-medium">Aktif {activePercent}% ({summaryData.activeAccounts})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="text-slate-300 font-medium">Tidak aktif {inactivePercent}% ({summaryData.inactiveAccounts})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status dihitung otomatis dari tabel Akun.</span>
                    <button
                      onClick={() => setActiveTab('akun')}
                      className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700/60 flex items-center gap-1.5"
                    >
                      Buka Tabel Akun &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOG AKTIVITAS (SESUAI GAMBAR DENGAN TIME PICKER & LABEL DI BAWAH) */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            {/* Input Form New Log */}
            <div className="bg-[#141624] border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Input Log Aktivitas Baru
              </h3>
              <form onSubmit={handleAddLog} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Waktu</label>
                    <input
                      type="time"
                      required
                      value={newLog.waktu}
                      onChange={(e) => setNewLog({ ...newLog, waktu: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Akun</label>
                    <input
                      type="text"
                      required
                      placeholder="@social_001"
                      value={newLog.akun}
                      onChange={(e) => setNewLog({ ...newLog, akun: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Platform</label>
                    <select
                      value={newLog.platform}
                      onChange={(e) => setNewLog({ ...newLog, platform: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Facebook">Facebook</option>
                      <option value="X">X (Twitter)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Kategori Aktivitas</label>
                    <select
                      value={newLog.aktivitasType}
                      onChange={(e) => {
                        const type = e.target.value as any
                        let defaultLabel = 'Publikasi Konten'
                        if (type === 'Komentar') defaultLabel = 'Balasan Komentar'
                        if (type === 'Like') defaultLabel = 'Like'
                        if (type === 'Share') defaultLabel = 'Share Konten'
                        setNewLog({ ...newLog, aktivitasType: type, aktivitasLabel: defaultLabel })
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                    >
                      <option value="Upload">Upload</option>
                      <option value="Komentar">Komentar</option>
                      <option value="Like">Like</option>
                      <option value="Share">Share</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Status</label>
                    <select
                      value={newLog.status}
                      onChange={(e) => setNewLog({ ...newLog, status: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                    >
                      <option value="Berhasil">Berhasil</option>
                      <option value="Menunggu approval">Menunggu approval</option>
                      <option value="Gagal">Gagal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-3">
                    <label className="text-[11px] text-slate-400 block mb-1">Aktivitas Label</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Publikasi Konten, Like Video, Balasan Komentar"
                      value={newLog.aktivitasLabel}
                      onChange={(e) => setNewLog({ ...newLog, aktivitasLabel: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Log Aktivitas
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Log Table Container */}
            <div className="bg-[#111320] border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Log Aktivitas</h3>
                  <p className="text-xs text-slate-400">
                    Log ditujukan untuk audit aktivitas akun resmi, termasuk waktu, sumber, dan status hasil tindakan.
                  </p>
                </div>
                {/* Search Bar (Real-time hit API) */}
                <div className="relative w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari akun, platform, aktivitas..."
                    value={logSearch}
                    onChange={(e) => {
                      setLogSearch(e.target.value)
                      setLogPage(1)
                    }}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['Semua', 'Upload', 'Komentar', 'Like', 'Share'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setLogFilterTab(tab)
                        setLogPage(1)
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        logFilterTab === tab
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Limit Selector */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Baris per halaman:</span>
                  <select
                    value={logLimit}
                    onChange={(e) => {
                      setLogLimit(parseInt(e.target.value, 10))
                      setLogPage(1)
                    }}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141727] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5 w-12 text-center">No</th>
                      <th className="px-4 py-3.5">Waktu</th>
                      <th className="px-4 py-3.5">Tanggal & Jam Dibuat</th>
                      <th className="px-4 py-3.5">Akun</th>
                      <th className="px-4 py-3.5">Platform</th>
                      <th className="px-4 py-3.5">Aktivitas</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          Memuat data dari server...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          Tidak ada log ditemukan.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log, index) => {
                        const isEditing = editingLogId === log.id
                        const rowNumber = (logPage - 1) * logLimit + index + 1
                        const formattedDateTime = log.createdAt
                          ? new Date(log.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'

                        return (
                          <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                            {/* Nomor Urut */}
                            <td className="px-4 py-3.5 text-center font-mono text-slate-400 font-semibold">
                              {rowNumber}
                            </td>

                            {/* Waktu Pelaksanaan */}
                            <td className="px-4 py-3.5 font-medium text-slate-300">
                              {isEditing ? (
                                <input
                                  type="time"
                                  value={editLogData.waktu ?? log.waktu}
                                  onChange={(e) =>
                                    setEditLogData({ ...editLogData, waktu: e.target.value })
                                  }
                                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white [color-scheme:dark]"
                                />
                              ) : (
                                log.waktu
                              )}
                            </td>

                            {/* Tanggal & Jam Data Dibuat */}
                            <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                              {formattedDateTime}
                            </td>

                            {/* Akun */}
                            <td className="px-4 py-3.5 font-medium text-slate-200">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editLogData.akun ?? log.akun}
                                  onChange={(e) =>
                                    setEditLogData({ ...editLogData, akun: e.target.value })
                                  }
                                  className="w-28 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                />
                              ) : (
                                log.akun
                              )}
                            </td>

                            {/* Platform */}
                            <td className="px-4 py-3.5 text-slate-300">
                              {isEditing ? (
                                <select
                                  value={editLogData.platform ?? log.platform}
                                  onChange={(e) =>
                                    setEditLogData({
                                      ...editLogData,
                                      platform: e.target.value as any,
                                    })
                                  }
                                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                >
                                  <option value="Instagram">Instagram</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="TikTok">TikTok</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="X">X</option>
                                </select>
                              ) : (
                                log.platform
                              )}
                            </td>

                            {/* Aktivitas */}
                            <td className="px-4 py-3.5 text-slate-200">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editLogData.aktivitasLabel ?? log.aktivitasLabel}
                                  onChange={(e) =>
                                    setEditLogData({
                                      ...editLogData,
                                      aktivitasLabel: e.target.value,
                                    })
                                  }
                                  className="w-40 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                />
                              ) : (
                                log.aktivitasLabel
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              {isEditing ? (
                                <select
                                  value={editLogData.status ?? log.status}
                                  onChange={(e) =>
                                    setEditLogData({
                                      ...editLogData,
                                      status: e.target.value as any,
                                    })
                                  }
                                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                >
                                  <option value="Berhasil">Berhasil</option>
                                  <option value="Menunggu approval">Menunggu approval</option>
                                  <option value="Gagal">Gagal</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                                    log.status === 'Berhasil'
                                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                      : log.status === 'Menunggu approval'
                                      ? 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                                      : 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      log.status === 'Berhasil'
                                        ? 'bg-emerald-400'
                                        : log.status === 'Menunggu approval'
                                        ? 'bg-amber-400'
                                        : 'bg-rose-400'
                                    }`}
                                  />
                                  {log.status}
                                </span>
                              )}
                            </td>

                            {/* Aksi */}
                            <td className="px-4 py-3.5 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdateLog(log.id)}
                                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingLogId(null)}
                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingLogId(log.id)
                                      setEditLogData(log)
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/30"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <div>
                  Menampilkan {logs.length > 0 ? (logPage - 1) * logLimit + 1 : 0} -{' '}
                  {Math.min(logPage * logLimit, logTotal)} dari {logTotal} log
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={logPage <= 1}
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-medium">
                    Halaman {logPage} dari {logTotalPages}
                  </span>
                  <button
                    disabled={logPage >= logTotalPages}
                    onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAJEMEN AKUN */}
        {activeTab === 'akun' && (
          <div className="space-y-6">
            {/* Input Form New Account */}
            <div className="bg-[#141624] border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Input Akun SocialForce Baru
              </h3>
              <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Nama Akun</label>
                  <input
                    type="text"
                    required
                    placeholder="Social Account 101"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Username / Handle</label>
                  <input
                    type="text"
                    required
                    placeholder="@social_101"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Platform</label>
                  <select
                    value={newAccount.platform}
                    onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="X">X (Twitter)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Status</label>
                  <select
                    value={newAccount.status}
                    onChange={(e) => {
                      const val = e.target.value as any
                      setNewAccount({
                        ...newAccount,
                        status: val,
                        koneksi: val === 'Aktif' ? 'Terhubung' : 'Terputus',
                      })
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2 focus:border-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak aktif">Tidak aktif</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Akun
                  </button>
                </div>
              </form>
            </div>

            {/* Account List Table */}
            <div className="bg-[#111320] border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Daftar Akun SocialForce</h3>
                  <p className="text-xs text-slate-400">
                    Total {accountTotal} akun terdaftar di sistem SocialForce.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter Platform */}
                  <select
                    value={accountPlatformFilter}
                    onChange={(e) => {
                      setAccountPlatformFilter(e.target.value)
                      setAccountPage(1)
                    }}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2"
                  >
                    <option value="Semua">Semua Platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="X">X</option>
                  </select>
                  {/* Filter Status */}
                  <select
                    value={accountStatusFilter}
                    onChange={(e) => {
                      setAccountStatusFilter(e.target.value)
                      setAccountPage(1)
                    }}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-2"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak aktif">Tidak aktif</option>
                  </select>
                  {/* Limit */}
                  <select
                    value={accountLimit}
                    onChange={(e) => {
                      setAccountLimit(parseInt(e.target.value, 10))
                      setAccountPage(1)
                    }}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2"
                  >
                    <option value={5}>5 / hal</option>
                    <option value={10}>10 / hal</option>
                    <option value={20}>20 / hal</option>
                    <option value={50}>50 / hal</option>
                  </select>
                  {/* Search */}
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Cari kode, nama, user..."
                      value={accountSearch}
                      onChange={(e) => {
                        setAccountSearch(e.target.value)
                        setAccountPage(1)
                      }}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141727] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Kode</th>
                      <th className="px-5 py-3.5">Nama Akun</th>
                      <th className="px-5 py-3.5">Username</th>
                      <th className="px-5 py-3.5">Platform</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Koneksi</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {accountLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          Memuat akun dari server...
                        </td>
                      </tr>
                    ) : accounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          Tidak ada akun ditemukan.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((acc) => {
                        const isEditing = editingAccountId === acc.id
                        return (
                          <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-blue-400 font-bold">
                              #{acc.code}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-slate-200">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editAccountData.name ?? acc.name}
                                  onChange={(e) =>
                                    setEditAccountData({ ...editAccountData, name: e.target.value })
                                  }
                                  className="w-36 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                />
                              ) : (
                                acc.name
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editAccountData.username ?? acc.username}
                                  onChange={(e) =>
                                    setEditAccountData({
                                      ...editAccountData,
                                      username: e.target.value,
                                    })
                                  }
                                  className="w-32 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                />
                              ) : (
                                acc.username
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">
                              {isEditing ? (
                                <select
                                  value={editAccountData.platform ?? acc.platform}
                                  onChange={(e) =>
                                    setEditAccountData({
                                      ...editAccountData,
                                      platform: e.target.value as any,
                                    })
                                  }
                                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                >
                                  <option value="Instagram">Instagram</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="TikTok">TikTok</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="X">X</option>
                                </select>
                              ) : (
                                acc.platform
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              {isEditing ? (
                                <select
                                  value={editAccountData.status ?? acc.status}
                                  onChange={(e) =>
                                    setEditAccountData({
                                      ...editAccountData,
                                      status: e.target.value as any,
                                      koneksi:
                                        e.target.value === 'Aktif' ? 'Terhubung' : 'Terputus',
                                    })
                                  }
                                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white"
                                >
                                  <option value="Aktif">Aktif</option>
                                  <option value="Tidak aktif">Tidak aktif</option>
                                </select>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                    acc.status === 'Aktif'
                                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      acc.status === 'Aktif' ? 'bg-emerald-400' : 'bg-rose-400'
                                    }`}
                                  />
                                  {acc.status}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`text-[11px] font-medium ${
                                  acc.koneksi === 'Terhubung'
                                    ? 'text-emerald-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {acc.koneksi}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleUpdateAccount(acc.id)}
                                    className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAccountId(null)}
                                    className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingAccountId(acc.id)
                                      setEditAccountData(acc)
                                    }}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAccount(acc.id)}
                                    className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/30"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <div>
                  Menampilkan {accounts.length > 0 ? (accountPage - 1) * accountLimit + 1 : 0} -{' '}
                  {Math.min(accountPage * accountLimit, accountTotal)} dari {accountTotal} akun
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={accountPage <= 1}
                    onClick={() => setAccountPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-medium">
                    Halaman {accountPage} dari {accountTotalPages}
                  </span>
                  <button
                    disabled={accountPage >= accountTotalPages}
                    onClick={() => setAccountPage((p) => Math.min(accountTotalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
