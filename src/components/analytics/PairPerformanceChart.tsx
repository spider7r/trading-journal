'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/format'

interface PairPerformanceChartProps {
    trades: any[]
}

export function PairPerformanceChart({ trades }: PairPerformanceChartProps) {
    const pairStats = trades.reduce((acc: any, trade) => {
        if (!trade.pair) return acc

        if (!acc[trade.pair]) {
            acc[trade.pair] = { pair: trade.pair, pnl: 0, count: 0 }
        }
        acc[trade.pair].pnl += trade.pnl || 0
        acc[trade.pair].count += 1
        return acc
    }, {})

    const data = Object.values(pairStats)
        .sort((a: any, b: any) => b.pnl - a.pnl)
        .slice(0, 10) // Top 10 pairs

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <p className="text-zinc-500">No data available</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
                    <defs>
                        <linearGradient id="colorPairWin" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="colorPairLoss" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} opacity={0.5} />
                    <XAxis
                        type="number"
                        stroke="#52525b"
                        fontSize={12}
                        tickFormatter={(value) => `$${value}`}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        dataKey="pair"
                        type="category"
                        stroke="#52525b"
                        fontSize={12}
                        width={60}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#27272a', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: 'rgba(24, 24, 27, 0.8)',
                            borderColor: 'rgba(39, 39, 42, 0.5)',
                            borderRadius: '16px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#e4e4e7' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        formatter={(value: number) => [formatCurrency(value), 'P&L']}
                    />
                    <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'url(#colorPairWin)' : 'url(#colorPairLoss)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
