'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts'
import {
    Clock, BarChart2, Info, Award,
    Plus, TrendingUp, History, Trash2, Play
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getRecentBacktestSessions, deleteBacktestSession } from '@/app/(dashboard)/backtest/actions'
import { toast } from 'sonner'

// Mock Data
const winRateData = [
    { name: 'Jan', rate: 45 },
    { name: 'Feb', rate: 52 },
    { name: 'Mar', rate: 38 },
    { name: 'Apr', rate: 65 },
    { name: 'May', rate: 48 },
    { name: 'Jun', rate: 72 },
    { name: 'Jul', rate: 60 },
]

const timeInvestedData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 1.5 },
    { name: 'Wed', hours: 3 },
    { name: 'Thu', hours: 2.5 },
    { name: 'Fri', hours: 4 },
    { name: 'Sat', hours: 1 },
    { name: 'Sun', hours: 0.5 },
]

const tradesBySymbol = [
    { symbol: 'EURUSD', count: 145, winRate: 55 },
    { symbol: 'GBPUSD', count: 89, winRate: 48 },
    { symbol: 'XAUUSD', count: 62, winRate: 60 },
    { symbol: 'BTCUSD', count: 34, winRate: 42 },
]

import { CreateSessionDialog } from './CreateSessionDialog'
import { useState, useEffect } from 'react'

export function BacktestDashboard() {
    const router = useRouter()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [recentSessions, setRecentSessions] = useState<any[]>([])

    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        const sessions = await getRecentBacktestSessions()
        setRecentSessions(sessions)
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await deleteBacktestSession(id)
            toast.success('Session deleted')
            loadSessions()
        } catch (error) {
            toast.error('Failed to delete session')
        }
    }

    return (
        <div className="p-6 h-full overflow-auto bg-[#050505] text-white font-sans">
            <CreateSessionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                    {/* Top Stats Row 1 */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-[#0A0A0A] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-[#94A3B8]">Time Invested</CardTitle>
                                <BarChart2 className="w-4 h-4 text-[#94A3B8]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">48.5 hrs</div>
                                <p className="text-xs text-[#94A3B8] mt-1">+12% from last month</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#0A0A0A] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-[#94A3B8]">Historical Time</CardTitle>
                                <Clock className="w-4 h-4 text-[#94A3B8]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">3.2 yrs</div>
                                <p className="text-xs text-[#94A3B8] mt-1">Replayed market data</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Stats Row 2 */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-[#0A0A0A] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-[#94A3B8]">Trades Taken</CardTitle>
                                <Info className="w-4 h-4 text-[#94A3B8]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">1,248</div>
                                <p className="text-xs text-[#94A3B8] mt-1">Total executions</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#0A0A0A] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-[#94A3B8]">Overall Win Rate</CardTitle>
                                <Award className="w-4 h-4 text-[#94A3B8]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-[#00E676]">52.4%</div>
                                <p className="text-xs text-[#94A3B8] mt-1">Average across all sessions</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Win Rate Chart */}
                    <Card className="bg-[#0A0A0A] border-white/5 flex-1 min-h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-white">Win Rate Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={winRateData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94A3B8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94A3B8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
                                        itemStyle={{ color: '#FFFFFF' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="rate" fill="#00E676" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    {/* Recent Sessions */}
                    <Card className="bg-[#0A0A0A] border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <History className="w-4 h-4 text-[#00E676]" />
                                Recent Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentSessions.length === 0 ? (
                                <div className="text-center py-8 text-[#94A3B8] text-sm">
                                    No recent sessions found. Start a new one!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-[#050505] border border-white/5 hover:border-[#00E676]/30 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/backtest/session/${session.id}`)}
                                        >
                                            <div>
                                                <div className="font-medium text-white text-sm">{session.name}</div>
                                                <div className="text-xs text-[#94A3B8] flex items-center gap-2">
                                                    <span>{session.pair}</span>
                                                    <span>•</span>
                                                    <span>${session.current_balance?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#00E676] hover:text-[#00C853] hover:bg-[#00E676]/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(`/backtest/session/${session.id}`)
                                                    }}
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-[#ef4444] hover:text-[#dc2626] hover:bg-[#ef4444]/10"
                                                    onClick={(e) => handleDelete(session.id, e)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Time Invested Chart */}
                    <Card className="bg-[#0A0A0A] border-white/5 h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-white">Time Invested (This Week)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeInvestedData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94A3B8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94A3B8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}h`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
                                        itemStyle={{ color: '#FFFFFF' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="hours"
                                        stroke="#00E676"
                                        strokeWidth={2}
                                        dot={{ fill: '#00E676', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Trades by Symbol */}
                    <Card className="bg-[#0A0A0A] border-white/5 flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-white">Trades by Symbol</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-4">
                                {tradesBySymbol.map((item) => (
                                    <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg bg-[#050505] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-xs font-bold text-[#94A3B8]">
                                                {item.symbol.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{item.symbol}</div>
                                                <div className="text-xs text-[#94A3B8]">{item.count} trades</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-white">{item.winRate}% WR</div>
                                            <div className="w-24 h-1.5 bg-[#0A0A0A] rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#00E676] rounded-full"
                                                    style={{ width: `${item.winRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0 mt-auto">
                            <Button
                                className="w-full bg-[#00E676] hover:bg-[#00C853] text-black h-12 text-lg font-bold shadow-lg shadow-[#00E676]/20"
                                onClick={() => setIsCreateOpen(true)}
                            >
                                Start New Session
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
