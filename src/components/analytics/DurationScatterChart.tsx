'use client'

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/format'
import { differenceInMinutes } from 'date-fns'

interface DurationScatterChartProps {
    trades: any[]
}

export function DurationScatterChart({ trades }: DurationScatterChartProps) {
    const data = trades
        .filter(t => t.status === 'CLOSED' && t.close_time)
        .map(t => ({
            duration: differenceInMinutes(new Date(t.close_time), new Date(t.open_time)),
            pnl: t.pnl || 0,
            pair: t.pair
        }))

    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <p className="text-zinc-500">No closed trades data available</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                    <XAxis
                        type="number"
                        dataKey="duration"
                        name="Duration"
                        unit="m"
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        type="number"
                        dataKey="pnl"
                        name="P&L"
                        unit="$"
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }}
                        contentStyle={{
                            backgroundColor: 'rgba(24, 24, 27, 0.8)',
                            borderColor: 'rgba(39, 39, 42, 0.5)',
                            borderRadius: '16px',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        itemStyle={{ color: '#e4e4e7' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        formatter={(value: any, name: string) => [
                            name === 'P&L' ? formatCurrency(value) : `${value} min`,
                            name
                        ]}
                    />
                    <Scatter name="Trades" data={data}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.pnl >= 0 ? '#ec4899' : '#ef4444'}
                                style={{ filter: `drop-shadow(0 0 6px ${entry.pnl >= 0 ? 'rgba(236, 72, 153, 0.5)' : 'rgba(239, 68, 68, 0.5)'})` }}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    )
}
