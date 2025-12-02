'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart2, Maximize2, Settings2 } from 'lucide-react'

interface BacktestBottomBarProps {
    balance: number
    equity: number
    realizedPnl: number
    unrealizedPnl: number
    quantity: number
    onQuantityChange: (val: number) => void
    onBuy: () => void
    onSell: () => void
    onAnalytics: () => void
}

export function BacktestBottomBar({
    balance,
    equity,
    realizedPnl,
    unrealizedPnl,
    quantity,
    onQuantityChange,
    onBuy,
    onSell,
    onAnalytics
}: BacktestBottomBarProps) {
    return (
        <div className="h-14 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between px-4 shrink-0">
            {/* Left: Trading Controls */}
            <div className="flex items-center gap-3">
                <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold w-20"
                    onClick={onBuy}
                >
                    Buy
                </Button>
                <Button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold w-20"
                    onClick={onSell}
                >
                    Sell
                </Button>

                <div className="flex items-center gap-2 bg-zinc-900 rounded-md border border-zinc-800 px-3 py-1.5">
                    <span className="text-xs text-zinc-500 font-medium uppercase">Quantity</span>
                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => onQuantityChange(parseFloat(e.target.value))}
                        className="h-6 w-24 bg-transparent border-none text-right text-zinc-100 focus-visible:ring-0 p-0"
                    />
                </div>
            </div>

            {/* Center: Analytics */}
            <Button variant="outline" size="sm" onClick={onAnalytics} className="border-zinc-800 bg-zinc-900 text-zinc-300">
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
            </Button>

            {/* Right: Account Stats */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Account Balance</span>
                    <span className="font-mono text-zinc-100">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Realized PnL</span>
                    <span className={`font-mono ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${realizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Unrealized PnL</span>
                    <span className={`font-mono ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="h-8 w-px bg-zinc-800 mx-2" />

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
