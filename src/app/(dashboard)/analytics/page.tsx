'use client'

import { useState, useEffect } from 'react'
import { getAnalyticsData } from './actions'
import { EquityCurveChart } from '@/components/analytics/EquityCurveChart'
import { SessionSplitChart } from '@/components/analytics/SessionSplitChart'
import { WinRateByDayChart } from '@/components/analytics/WinRateByDayChart'
import { DirectionalPerformanceChart } from '@/components/analytics/DirectionalPerformanceChart'
import { MetricCard } from '@/components/analytics/MetricCard'
import { BarChart3, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react'

export default function AnalyticsPage() {
    const [mode, setMode] = useState<'Live' | 'Backtest' | 'Paper'>('Live')
    const [data, setData] = useState<{
        equityCurve: any[]
        sessionData: any[]
        dayData: any[]
        directionData: any[]
        advancedStats: any
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            const res = await getAnalyticsData(mode)
            if (res.success && res.data) {
                setData(res.data)
            }
            setIsLoading(false)
        }
        loadData()
    }, [mode])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[600px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <BarChart3 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Performance Analytics</h1>
                        <p className="text-zinc-400">Deep dive into your trading metrics and growth.</p>
                    </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    {['Live', 'Backtest', 'Paper'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m as any)}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mode === m
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Net P&L"
                    value={`$${data?.equityCurve[data.equityCurve.length - 1]?.pnl.toLocaleString() || 0}`}
                    icon={TrendingUp}
                    trend={data?.equityCurve[data.equityCurve.length - 1]?.pnl >= 0 ? 'up' : 'down'}
                />
                <MetricCard
                    title="Profit Factor"
                    value={data?.advancedStats?.profitFactor || 0}
                    icon={Activity}
                    subValue="Target: > 1.5"
                />
                <MetricCard
                    title="Win Rate"
                    value={`${data?.advancedStats?.winRate || 0}%`}
                    icon={Target}
                    subValue={`${data?.advancedStats?.totalTrades || 0} Trades`}
                />
                <MetricCard
                    title="Max Drawdown"
                    value={`$${data?.advancedStats?.maxDrawdown.toLocaleString() || 0}`}
                    icon={TrendingDown}
                    trend="down"
                    className="border-red-500/20 bg-red-500/5"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-8">
                {/* Equity Curve - Full Width */}
                <EquityCurveChart data={data?.equityCurve || []} />

                {/* Secondary Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SessionSplitChart data={data?.sessionData || []} />
                    <WinRateByDayChart data={data?.dayData || []} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <DirectionalPerformanceChart data={data?.directionData || []} />
                    </div>
                    {/* Detailed Stats Table */}
                    <div className="lg:col-span-2 bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Detailed Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Average Win</p>
                                <p className="text-xl font-bold text-emerald-400">${data?.advancedStats?.avgWin.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Average Loss</p>
                                <p className="text-xl font-bold text-red-400">${data?.advancedStats?.avgLoss.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Expectancy</p>
                                <p className="text-xl font-bold text-blue-400">
                                    ${data?.advancedStats?.expectancy?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Avg R:R</p>
                                <p className="text-xl font-bold text-white">
                                    1:{data?.advancedStats?.avgRR || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Max Cons. Wins</p>
                                <p className="text-xl font-bold text-emerald-400">{data?.advancedStats?.maxConsecutiveWins || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Max Cons. Losses</p>
                                <p className="text-xl font-bold text-red-400">{data?.advancedStats?.maxConsecutiveLosses || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 mb-1">Total Trades</p>
                                <p className="text-xl font-bold text-white">{data?.advancedStats?.totalTrades || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
