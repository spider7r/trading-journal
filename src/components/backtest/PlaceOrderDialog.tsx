'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, Save, BookOpen, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlaceOrderDialogProps {
    currentPrice: number
    balance: number
    onPlaceOrder: (
        side: 'LONG' | 'SHORT',
        size: number,
        sl: number,
        tp: number,
        orderType: 'MARKET' | 'LIMIT' | 'STOP',
        limitPrice?: number
    ) => void
    onClose: () => void
}

export function PlaceOrderDialog({ currentPrice, balance, onPlaceOrder, onClose }: PlaceOrderDialogProps) {
    // Order State
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG')
    const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET')
    const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toString())

    // Risk Management
    const [riskType, setRiskType] = useState<'PERCENT' | 'AMOUNT'>('PERCENT')
    const [riskValue, setRiskValue] = useState<string>('1') // 1% or $100
    const [positionSize, setPositionSize] = useState<string>('0')

    // SL/TP - Closed by default
    const [hasSL, setHasSL] = useState(false)
    const [stopLoss, setStopLoss] = useState<string>('')
    const [slPips, setSlPips] = useState<string>('')

    const [hasTP, setHasTP] = useState(false)
    const [takeProfit, setTakeProfit] = useState<string>('')
    const [tpPips, setTpPips] = useState<string>('')

    // Helper: Get Entry Price
    const getEntryPrice = () => orderType === 'MARKET' ? currentPrice : parseFloat(limitPrice) || currentPrice

    // Helper: Calculate Pips (Assuming Forex standard for now: 0.0001)
    // TODO: Make this dynamic based on asset class
    const PIP_SIZE = 0.0001

    // Update SL/TP when Pips change
    const handleSlPipsChange = (pips: string) => {
        setSlPips(pips)
        const entry = getEntryPrice()
        const pipsVal = parseFloat(pips)
        if (!isNaN(pipsVal)) {
            const priceDiff = pipsVal * PIP_SIZE
            const newSl = side === 'LONG' ? entry - priceDiff : entry + priceDiff
            setStopLoss(newSl.toFixed(5))
        }
    }

    const handleTpPipsChange = (pips: string) => {
        setTpPips(pips)
        const entry = getEntryPrice()
        const pipsVal = parseFloat(pips)
        if (!isNaN(pipsVal)) {
            const priceDiff = pipsVal * PIP_SIZE
            const newTp = side === 'LONG' ? entry + priceDiff : entry - priceDiff
            setTakeProfit(newTp.toFixed(5))
        }
    }

    // Update Pips when Price changes
    const handleSlPriceChange = (price: string) => {
        setStopLoss(price)
        const entry = getEntryPrice()
        const priceVal = parseFloat(price)
        if (!isNaN(priceVal)) {
            const diff = Math.abs(entry - priceVal)
            setSlPips((diff / PIP_SIZE).toFixed(1))
        }
    }

    const handleTpPriceChange = (price: string) => {
        setTakeProfit(price)
        const entry = getEntryPrice()
        const priceVal = parseFloat(price)
        if (!isNaN(priceVal)) {
            const diff = Math.abs(entry - priceVal)
            setTpPips((diff / PIP_SIZE).toFixed(1))
        }
    }

    // Calculate Position Size based on Risk
    useEffect(() => {
        const entry = getEntryPrice()
        const sl = parseFloat(stopLoss)

        if (!hasSL || isNaN(sl) || sl === entry) {
            // Fallback or manual size logic could go here
            return
        }

        let riskAmount = 0
        if (riskType === 'PERCENT') {
            const pct = parseFloat(riskValue)
            if (!isNaN(pct)) riskAmount = balance * (pct / 100)
        } else {
            const amt = parseFloat(riskValue)
            if (!isNaN(amt)) riskAmount = amt
        }

        const priceDiff = Math.abs(entry - sl)
        if (priceDiff > 0) {
            const size = riskAmount / priceDiff
            setPositionSize(size.toFixed(2))
        }
    }, [riskType, riskValue, stopLoss, limitPrice, orderType, side, balance, hasSL, currentPrice])

    // Calculate Estimated PnL
    const estimatedLoss = riskType === 'PERCENT'
        ? balance * (parseFloat(riskValue) / 100)
        : parseFloat(riskValue)

    const estimatedProfit = hasTP && takeProfit && positionSize
        ? Math.abs(parseFloat(takeProfit) - getEntryPrice()) * parseFloat(positionSize)
        : 0

    const handleSubmit = () => {
        onPlaceOrder(
            side,
            parseFloat(positionSize),
            hasSL ? parseFloat(stopLoss) : 0,
            hasTP ? parseFloat(takeProfit) : 0,
            orderType,
            orderType !== 'MARKET' ? parseFloat(limitPrice) : undefined
        )
        onClose()
    }

    return (
        <div className="space-y-4">
            {/* Header with Logo */}
            <div className="flex items-center justify-center pb-2">
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto opacity-80" />
            </div>

            {/* Header Stats */}
            <div className="flex items-center justify-between bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                <div className="text-center">
                    <div className="text-[10px] text-[#787b86] uppercase font-bold mb-1">Risk / Loss</div>
                    <div className="text-[#ef4444] font-mono font-bold text-sm">-${estimatedLoss.toFixed(2)}</div>
                </div>
                <div className="h-8 w-px bg-[#2a2e39]" />
                <div className="text-center">
                    <div className="text-[10px] text-[#787b86] uppercase font-bold mb-1">Reward / Profit</div>
                    <div className="text-[#00bfa5] font-mono font-bold text-sm">${estimatedProfit.toFixed(2)}</div>
                </div>
            </div>

            {/* Risk Settings */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-[#d1d4dc] text-xs font-medium">Risk Percentage</Label>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                    {[0.3, 0.5, 0.7, 1, 2, 3].map((pct) => (
                        <button
                            key={pct}
                            onClick={() => {
                                setRiskType('PERCENT')
                                setRiskValue(pct.toString())
                            }}
                            className={cn(
                                "text-xs py-1.5 rounded transition-all font-medium",
                                riskType === 'PERCENT' && parseFloat(riskValue) === pct
                                    ? "bg-[#2962ff] text-white shadow-lg shadow-blue-900/20"
                                    : "bg-[#1e222d] text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]"
                            )}
                        >
                            {pct}%
                        </button>
                    ))}
                </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[#787b86] text-xs">Side</Label>
                    <Select value={side} onValueChange={(v: any) => setSide(v)}>
                        <SelectTrigger className={`bg-[#1e222d] border-[#2a2e39] h-9 font-bold ${side === 'LONG' ? 'text-[#00bfa5]' : 'text-[#ef4444]'}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]">
                            <SelectItem value="LONG" className="text-[#00bfa5]">Buy / Long</SelectItem>
                            <SelectItem value="SHORT" className="text-[#ef4444]">Sell / Short</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[#787b86] text-xs">Type</Label>
                    <Select value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                        <SelectTrigger className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]">
                            <SelectItem value="MARKET">Market</SelectItem>
                            <SelectItem value="LIMIT">Limit</SelectItem>
                            <SelectItem value="STOP">Stop</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Position Size & Entry */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[#787b86] text-xs">Position Size</Label>
                    <Input
                        type="number"
                        value={positionSize}
                        onChange={(e) => setPositionSize(e.target.value)}
                        className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-9 focus-visible:ring-[#2962ff]"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[#787b86] text-xs">Entry Price</Label>
                    <Input
                        type="number"
                        value={orderType === 'MARKET' ? currentPrice : limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        readOnly={orderType === 'MARKET'}
                        className={cn(
                            "bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-9 focus-visible:ring-[#2962ff]",
                            orderType === 'MARKET' && "opacity-50 cursor-not-allowed"
                        )}
                        step="0.00001"
                    />
                </div>
            </div>

            {/* Stop Loss */}
            <div className="space-y-2 bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Switch checked={hasSL} onCheckedChange={setHasSL} className="data-[state=checked]:bg-[#ef4444]" />
                        <Label className="text-[#d1d4dc] text-sm font-medium">Stop Loss</Label>
                    </div>
                </div>
                {hasSL && (
                    <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                            <Label className="text-[#787b86] text-[10px] uppercase">Price</Label>
                            <Input
                                value={stopLoss}
                                onChange={(e) => handleSlPriceChange(e.target.value)}
                                className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-8 text-xs focus-visible:ring-[#ef4444]"
                                step="0.00001"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[#787b86] text-[10px] uppercase">Pips</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={slPips}
                                    onChange={(e) => handleSlPipsChange(e.target.value)}
                                    className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-8 text-xs pr-8 focus-visible:ring-[#ef4444]"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#787b86] text-[10px]">pips</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Take Profit */}
            <div className="space-y-2 bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Switch checked={hasTP} onCheckedChange={setHasTP} className="data-[state=checked]:bg-[#00bfa5]" />
                        <Label className="text-[#d1d4dc] text-sm font-medium">Take Profit</Label>
                    </div>
                </div>
                {hasTP && (
                    <div className="grid grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                            <Label className="text-[#787b86] text-[10px] uppercase">Price</Label>
                            <Input
                                value={takeProfit}
                                onChange={(e) => handleTpPriceChange(e.target.value)}
                                className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-8 text-xs focus-visible:ring-[#00bfa5]"
                                step="0.00001"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[#787b86] text-[10px] uppercase">Pips</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={tpPips}
                                    onChange={(e) => handleTpPipsChange(e.target.value)}
                                    className="bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc] h-8 text-xs pr-8 focus-visible:ring-[#00bfa5]"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#787b86] text-[10px]">pips</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <Button
                    variant="ghost"
                    className="flex-1 text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#2a2e39]"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    className={`flex-[2] font-bold text-white shadow-lg transition-all ${side === 'LONG'
                            ? 'bg-[#00bfa5] hover:bg-[#00897b] shadow-emerald-900/20'
                            : 'bg-[#ef4444] hover:bg-[#d32f2f] shadow-red-900/20'
                        }`}
                    onClick={handleSubmit}
                >
                    {side === 'LONG' ? 'Buy / Long' : 'Sell / Short'}
                </Button>
            </div>
        </div>
    )
}
