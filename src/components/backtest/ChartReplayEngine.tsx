'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { SmartChart, PriceLineConfig } from './SmartChart'
import { Candle } from '@/lib/binance'
import { aggregateCandles } from '@/lib/candle-utils'
import { updateBacktestSession, saveBacktestTrade, fetchMarketData } from '@/app/(dashboard)/backtest/actions'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft, Settings, SkipBack, Pause, Play, StepForward, SkipForward,
    RotateCcw, Plus, Newspaper, BookOpen, BarChart2
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { timezones } from '@/lib/timezones'

import { BacktestToolbar } from './BacktestToolbar'
import { BacktestTopBar } from './BacktestTopBar'
import { BacktestBottomBar } from './BacktestBottomBar'
import { PlaceOrderDialog } from './PlaceOrderDialog'
import { BacktestEngine, Order, Trade, ChallengeStatus } from '@/lib/backtest-engine'
import { TimeframeSelector } from './TimeframeSelector'
import { ChartContextMenu } from './ChartContextMenu'
import { ChallengeStatusWidget } from './ChallengeStatusWidget'

interface ChartReplayEngineProps {
    initialSession?: any
    initialTrades?: any[]
}

export function ChartReplayEngine({ initialSession, initialTrades = [] }: ChartReplayEngineProps) {
    const [fullData, setFullData] = useState<Candle[]>([])
    const [visibleData, setVisibleData] = useState<Candle[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState(1000)
    const [pair, setPair] = useState(initialSession?.pair || 'BTCUSDT')
    const [interval, setInterval] = useState('15m')
    const [timezone, setTimezone] = useState(initialSession?.timezone || 'Etc/UTC')
    const [isLoading, setIsLoading] = useState(false)

    // Engine State
    const engineRef = useRef<BacktestEngine | null>(null)
    const [balance, setBalance] = useState(initialSession?.current_balance || 100000)
    const [equity, setEquity] = useState(initialSession?.current_balance || 100000)
    const [trades, setTrades] = useState<Trade[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [maxDrawdown, setMaxDrawdown] = useState(0)
    const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus | undefined>(initialSession?.challenge_status)

    // Session State
    const [sessionId, setSessionId] = useState<string | null>(initialSession?.id || null)
    const [quantity, setQuantity] = useState(1)
    const [showOrderPanel, setShowOrderPanel] = useState(false)
    const [activeTool, setActiveTool] = useState<string | null>(null)
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, price: number } | null>(null)

    // Draggable Controls State
    const [controlPosition, setControlPosition] = useState({ x: 500, y: 100 })
    const [isDraggingControls, setIsDraggingControls] = useState(false)
    const dragOffsetRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        setControlPosition({ x: window.innerWidth / 2, y: 100 })
    }, [])

    const handleDragStart = (e: React.MouseEvent) => {
        setIsDraggingControls(true)
        dragOffsetRef.current = {
            x: e.clientX - controlPosition.x,
            y: e.clientY - controlPosition.y
        }
    }

    useEffect(() => {
        const handleDrag = (e: MouseEvent) => {
            if (isDraggingControls) {
                setControlPosition({
                    x: e.clientX - dragOffsetRef.current.x,
                    y: e.clientY - dragOffsetRef.current.y
                })
            }
        }

        const handleDragEnd = () => {
            setIsDraggingControls(false)
        }

        if (isDraggingControls) {
            window.addEventListener('mousemove', handleDrag)
            window.addEventListener('mouseup', handleDragEnd)
        }

        return () => {
            window.removeEventListener('mousemove', handleDrag)
            window.removeEventListener('mouseup', handleDragEnd)
        }
    }, [isDraggingControls])

    const timerRef = useRef<number | null>(null)

    // Initialize Engine
    useEffect(() => {
        if (!engineRef.current) {
            // Map DB trades to Engine trades
            const mappedTrades: Trade[] = initialTrades.map(t => ({
                id: t.id,
                orderId: 'hist', // Placeholder
                sessionId: t.backtest_session_id,
                symbol: t.pair,
                side: t.type,
                entryPrice: Number(t.entry_price),
                exitPrice: Number(t.exit_price),
                quantity: Number(t.size),
                pnl: Number(t.pnl),
                entryTime: new Date(t.entry_date).getTime(),
                exitTime: new Date(t.exit_date).getTime(),
                status: 'CLOSED',
                commission: 0,
                swap: 0
            }))

            engineRef.current = new BacktestEngine(balance, async (trade) => {
                if (sessionId) {
                    try {
                        // Save Trade
                        await saveBacktestTrade({
                            backtest_session_id: sessionId,
                            pair: trade.symbol,
                            type: trade.side,
                            entry_price: trade.entryPrice,
                            exit_price: trade.exitPrice!,
                            size: trade.quantity,
                            pnl: trade.pnl!,
                            entry_date: new Date(trade.entryTime).toISOString(),
                            exit_date: new Date(trade.exitTime!).toISOString()
                        })

                        // Update Session Balance
                        if (engineRef.current) {
                            await updateBacktestSession(sessionId, {
                                current_balance: engineRef.current.getStats().balance
                            })
                        }
                    } catch (error) {
                        console.error('Failed to save trade:', error)
                        toast.error('Failed to save trade to database')
                    }
                }
            }, mappedTrades,
                initialSession?.challenge_rules,
                initialSession?.challenge_status,
                async (status) => {
                    setChallengeStatus({ ...status }) // Force update
                    if (sessionId) {
                        try {
                            await updateBacktestSession(sessionId, {
                                challenge_status: status
                            })
                        } catch (error) {
                            console.error('Failed to update challenge status:', error)
                        }
                    }
                })
        }
    }, [sessionId, initialTrades, balance])

    // Fetch Data
    useEffect(() => {
        let isMounted = true
        const loadData = async () => {
            setIsLoading(true)
            const startTime = initialSession?.start_date ? new Date(initialSession.start_date).getTime() : undefined
            const endTime = initialSession?.end_date ? new Date(initialSession.end_date).getTime() : undefined
            const lastReplayTime = initialSession?.last_replay_time ? Number(initialSession.last_replay_time) : undefined

            // Capture current time to maintain position during interval switch
            let currentTime: number | null = null
            if (fullData.length > 0 && currentIndex < fullData.length) {
                currentTime = fullData[currentIndex].time as number
            }

            // Dynamic buffer based on interval, BUT ensure at least 1 day
            let bufferTime = 5 * 24 * 60 * 60 * 1000 // Default 5 days
            if (interval === '1h' || interval === '4h') {
                bufferTime = 60 * 24 * 60 * 60 * 1000 // 60 days
            } else if (interval === 'D' || interval === '1W') {
                bufferTime = 365 * 24 * 60 * 60 * 1000 // 365 days
            }

            // Ensure minimum 2 days buffer if start time exists
            if (startTime) {
                const minBuffer = 2 * 24 * 60 * 60 * 1000
                if (bufferTime < minBuffer) bufferTime = minBuffer
            }

            const fetchStartTime = startTime ? startTime - bufferTime : undefined

            // Fetch more data for higher timeframes to ensure we don't run out
            const limit = interval === 'D' || interval === '1W' ? 5000 : 2000

            let data: any[] = []

            try {
                // 1. Try to use pre-loaded session data
                // 1. Try to use pre-loaded session data
                // Only use if it matches the requested interval!
                let useStoredData = false
                if (initialSession?.candle_data && Array.isArray(initialSession.candle_data) && initialSession.candle_data.length > 1) {
                    // Infer interval from stored data
                    const t1 = initialSession.candle_data[0].time
                    const t2 = initialSession.candle_data[1].time
                    const deltaSec = t2 - t1

                    // Map requested interval to seconds
                    let requestedSec = 3600 // Default 1h
                    if (interval === '1m') requestedSec = 60
                    else if (interval === '5m') requestedSec = 300
                    else if (interval === '15m') requestedSec = 900
                    else if (interval === '1h') requestedSec = 3600
                    else if (interval === '4h') requestedSec = 14400
                    else if (interval === '1d' || interval === 'D') requestedSec = 86400
                    else if (interval === '1w' || interval === 'W') requestedSec = 604800

                    if (deltaSec === requestedSec) {
                        useStoredData = true
                    } else {
                        console.log(`Stored data interval (${deltaSec}s) does not match requested (${requestedSec}s). Fetching new data.`)
                    }
                }

                if (useStoredData) {
                    console.log('Using pre-loaded candle data from session')
                    data = initialSession.candle_data
                } else {
                    // 2. Fallback to fetching (or if interval mismatch)
                    data = await fetchMarketData(pair, interval, limit, fetchStartTime, endTime)
                }

                if (!isMounted) return

                if (!data || data.length === 0) {
                    toast.error("No market data found for this period")
                    setIsLoading(false)
                    return
                }

                // Calculate new index
                let newIndex = 0

                if (currentTime) {
                    // Case 1: Switching timeframe - maintain current replay time
                    const foundIndex = data.findIndex((c: any) => (c.time as number) >= currentTime!)
                    newIndex = foundIndex !== -1 ? foundIndex : data.length - 1
                } else if (lastReplayTime) {
                    // Case 2: Resuming session - go to last saved time
                    const foundIndex = data.findIndex((c: any) => (c.time as number) >= lastReplayTime)
                    newIndex = foundIndex !== -1 ? foundIndex : data.length - 1
                } else if (startTime) {
                    // Case 3: New session with start date - find index of start date
                    // Convert startTime (ms) to seconds for comparison
                    const startTimeSec = startTime / 1000
                    const foundIndex = data.findIndex((c: any) => (c.time as number) >= startTimeSec)
                    newIndex = foundIndex !== -1 ? foundIndex : 0
                } else {
                    // Case 4: No specific start - start from middle
                    newIndex = Math.floor(data.length / 2)
                }

                // Batch updates
                setFullData(data)
                setCurrentIndex(newIndex)
                setVisibleData(data.slice(0, newIndex + 1))

            } catch (error) {
                console.error("Failed to fetch data", error)
                toast.error("Failed to load chart data")
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        loadData()

        return () => { isMounted = false }
    }, [pair, interval]) // Removed initialSession to prevent loops

    // Session Persistence
    const saveSession = useCallback(async () => {
        if (!sessionId || fullData.length === 0) return

        const currentTime = fullData[currentIndex]?.time as number
        if (!currentTime) return

        try {
            await updateBacktestSession(sessionId, {
                last_replay_time: currentTime,
                current_balance: balance
            })
        } catch (error) {
            console.error('Failed to save session state', error)
        }
    }, [sessionId, fullData, currentIndex, balance])

    // Auto-save every 10 seconds
    // Auto-save every 10 seconds
    useEffect(() => {
        const timer = window.setInterval(saveSession, 10000)
        return () => window.clearInterval(timer)
    }, [saveSession])

    // Save on pause
    useEffect(() => {
        if (!isPlaying) {
            saveSession()
        }
    }, [isPlaying, saveSession])

    // Derived Data for HTF
    const data1H = useMemo(() => aggregateCandles(visibleData, '1h'), [visibleData])
    const data4H = useMemo(() => aggregateCandles(visibleData, '4h'), [visibleData])

    // Calculate Price Lines
    const priceLines = useMemo(() => {
        const lines: PriceLineConfig[] = []

        // Show Trades
        trades.forEach(trade => {
            if (trade.status === 'CLOSED') return
            lines.push({
                price: trade.entryPrice,
                color: trade.side === 'LONG' ? '#10b981' : '#ef4444',
                title: `${trade.side} ENTRY`,
                lineStyle: 1
            })
            if (trade.stopLoss) {
                lines.push({
                    price: trade.stopLoss,
                    color: '#ef4444',
                    title: 'SL',
                    lineStyle: 2
                })
            }
            if (trade.takeProfit) {
                lines.push({
                    price: trade.takeProfit,
                    color: '#3b82f6',
                    title: 'TP',
                    lineStyle: 2
                })
            }
        })

        // Show Pending Orders
        orders.filter(o => o.status === 'PENDING').forEach(order => {
            const price = order.limitPrice || order.stopPrice || 0
            lines.push({
                price: price,
                color: order.side === 'LONG' ? '#10b981' : '#ef4444',
                title: `${order.type} ${order.side}`,
                lineStyle: 2
            })
            if (order.stopLoss) {
                lines.push({
                    price: order.stopLoss,
                    color: '#ef4444',
                    title: 'SL',
                    lineStyle: 2
                })
            }
            if (order.takeProfit) {
                lines.push({
                    price: order.takeProfit,
                    color: '#3b82f6',
                    title: 'TP',
                    lineStyle: 2
                })
            }
        })

        return lines
    }, [trades, orders])

    // Replay Logic
    const stepForward = useCallback(() => {
        setCurrentIndex(prev => {
            if (prev >= fullData.length - 1) {
                setIsPlaying(false)
                return prev
            }
            return prev + 1
        })
    }, [fullData.length])

    // Sync Engine with Candle Data
    useEffect(() => {
        if (fullData.length > 0 && engineRef.current) {
            const currentCandle = fullData[currentIndex]

            setVisibleData(fullData.slice(0, currentIndex + 1))

            // Process Candle in Engine
            engineRef.current.processCandle(currentCandle)

            // Update Local State from Engine
            const stats = engineRef.current.getStats()
            setBalance(stats.balance)
            setEquity(stats.equity)
            setMaxDrawdown(stats.maxDrawdown)
            setTrades([...engineRef.current.getTrades()])
            setOrders([...engineRef.current.getOrders()])
        }
    }, [currentIndex, fullData])

    // Playback Timer
    useEffect(() => {
        if (isPlaying) {
            timerRef.current = window.setInterval(stepForward, speed)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isPlaying, speed, stepForward])

    const handlePlaceOrder = (
        side: 'LONG' | 'SHORT',
        size: number,
        sl: number,
        tp: number,
        orderType: 'MARKET' | 'LIMIT' | 'STOP' = 'MARKET',
        limitPrice?: number
    ) => {
        if (!engineRef.current) return

        engineRef.current.placeOrder({
            sessionId: sessionId || 'temp',
            symbol: pair,
            side,
            type: orderType,
            quantity: size,
            limitPrice: orderType === 'LIMIT' ? limitPrice : undefined,
            stopPrice: orderType === 'STOP' ? limitPrice : undefined,
            stopLoss: sl || undefined,
            takeProfit: tp || undefined
        })

        // Force update state immediately
        const stats = engineRef.current.getStats()
        setBalance(stats.balance)
        setEquity(stats.equity)
        setTrades([...engineRef.current.getTrades()])
        setOrders([...engineRef.current.getOrders()])

        toast.success(`${orderType} Order Placed`)
        if (showOrderPanel) setShowOrderPanel(false)
    }

    const handleQuickOrder = (side: 'LONG' | 'SHORT') => {
        handlePlaceOrder(side, quantity, 0, 0, 'MARKET')
    }

    const handleContextAction = (action: string, payload?: any) => {
        if (action === 'reset') {
            // Logic to reset view if needed
        } else if (action === 'trade') {
            if (payload) {
                setShowOrderPanel(true)
            }
        } else if (action === 'remove_drawings') {
            if (chartComponentRef.current) {
                chartComponentRef.current.clearDrawings()
                toast.success('All drawings removed')
            }
        } else if (action === 'settings') {
            // Open settings
        }
    }

    // Calculate PnL (Unrealized)
    const unrealizedPnl = equity - balance
    const realizedPnl = balance - (initialSession?.initial_balance || 100000) // Approx
    const currentPrice = visibleData.length > 0 ? visibleData[visibleData.length - 1].close : 0

    const [chartType, setChartType] = useState('candle_solid')
    const [isMagnet, setIsMagnet] = useState(false)
    const [isLocked, setIsLocked] = useState(false)
    const [areDrawingsHidden, setAreDrawingsHidden] = useState(false)
    const chartComponentRef = useRef<any>(null)

    const handleAddIndicator = (name: string) => {
        if (chartComponentRef.current) {
            chartComponentRef.current.createIndicator(name)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-[#000000] text-[#d1d4dc] overflow-hidden font-sans select-none">
            {/* Top Navigation Bar */}
            <BacktestTopBar
                sessionName={initialSession?.name || 'Untitled Session'}
                currentIndex={currentIndex}
                totalCandles={fullData.length}
                isPlaying={isPlaying}
                speed={speed}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onStepBack={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                onStepForward={stepForward}
                onSeek={setCurrentIndex}
                onSpeedChange={setSpeed}
                onPlaceOrder={() => setShowOrderPanel(true)}
            />

            {/* Secondary Toolbar (Chart Controls) */}
            <div className="h-[38px] bg-[#131722] border-b border-[#2a2e39] flex items-center px-2 gap-1 shrink-0">
                <div className="flex items-center border-r border-[#2a2e39] pr-2 mr-2">
                    <Button variant="ghost" className="h-8 px-2 text-white font-bold hover:bg-[#2a2e39] gap-2 text-sm">
                        {pair}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#d1d4dc] hover:bg-[#2a2e39]">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <TimeframeSelector value={interval} onValueChange={setInterval} />

                <div className="w-px h-4 bg-[#2a2e39] mx-1" />

                <Button variant="ghost" className="h-8 px-2 text-[#d1d4dc] hover:bg-[#2a2e39] text-sm gap-1">
                    <BarChart2 className="w-4 h-4" /> Indicators
                </Button>
            </div>

            {/* Main Workspace */}
            <div className="flex flex-1 min-h-0 relative">
                {/* Left Drawing Toolbar */}
                <div className="w-[52px] border-r border-[#2a2e39] bg-[#131722] flex flex-col items-center py-2 shrink-0 z-20">
                    <BacktestToolbar
                        activeTool={activeTool}
                        onToolSelect={setActiveTool}
                        isMagnet={isMagnet}
                        onToggleMagnet={() => setIsMagnet(!isMagnet)}
                        isLocked={isLocked}
                        onToggleLock={() => setIsLocked(!isLocked)}
                        areDrawingsHidden={areDrawingsHidden}
                        onToggleHide={() => setAreDrawingsHidden(!areDrawingsHidden)}
                        onRemoveAll={() => {
                            if (chartComponentRef.current) {
                                chartComponentRef.current.clearDrawings()
                                toast.success('All drawings removed')
                            }
                        }}
                    />
                </div>

                {/* Chart Area */}
                <div className="flex-1 relative min-w-0 bg-[#000000]">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#000000]/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2962ff]" />
                        </div>
                    )}

                    <SmartChart
                        ref={chartComponentRef}
                        data={visibleData}
                        activeTool={activeTool}
                        onDrawingComplete={() => setActiveTool(null)}
                        chartType={chartType}
                        isMagnet={isMagnet}
                        isLocked={isLocked}
                        areDrawingsHidden={areDrawingsHidden}
                        priceLines={priceLines}
                        timezone={timezone}
                        onContextMenu={setContextMenu}
                    />

                    {contextMenu && (
                        <ChartContextMenu
                            x={contextMenu.x}
                            y={contextMenu.y}
                            price={contextMenu.price}
                            pair={pair}
                            onClose={() => setContextMenu(null)}
                            onAction={handleContextAction}
                        />
                    )}

                    {/* Prop Firm Widget */}
                    {initialSession?.session_type === 'PROP_FIRM' && (
                        <div className="absolute top-4 right-16 z-30 w-80">
                            <ChallengeStatusWidget
                                rules={initialSession.challenge_rules}
                                status={challengeStatus}
                                currentBalance={balance}
                                initialBalance={initialSession.initial_balance}
                                equity={equity}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Trading Panel */}
            <BacktestBottomBar
                balance={balance}
                equity={equity}
                realizedPnl={realizedPnl}
                unrealizedPnl={unrealizedPnl}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onBuy={() => handleQuickOrder('LONG')}
                onSell={() => handleQuickOrder('SHORT')}
                onAnalytics={() => { }}
            />

            <Dialog open={showOrderPanel} onOpenChange={setShowOrderPanel}>
                <DialogContent className="sm:max-w-[400px] bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]">
                    <DialogHeader>
                        <DialogTitle>Place New Order</DialogTitle>
                    </DialogHeader>
                    <PlaceOrderDialog
                        currentPrice={currentPrice}
                        balance={balance}
                        onPlaceOrder={handlePlaceOrder}
                        onClose={() => setShowOrderPanel(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
