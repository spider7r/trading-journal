'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getStrategiesList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('strategies')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name')

    return data || []
}

import { fetchHistoricalData } from '@/lib/data-service'

export async function createBacktestSession(formData: {
    name: string
    balance: number
    asset: string
    layout: string
    type: 'BACKTEST' | 'PROP_FIRM'
    strategyId?: string
    startDate?: string
    endDate?: string
    timezone?: string
    challengeRules?: any // Using any for now to avoid strict type issues, ideally define interface
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // 1. Calculate Range & Fetch Data
    let candleData: any[] = []
    try {
        const timeframe = '60' // Default to 1H for now (TradingView uses '60' for 1H, 'D' for 1D)
        let range = 1000 // Default

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate).getTime()
            const end = new Date(formData.endDate).getTime()
            const diffHours = (end - start) / (1000 * 60 * 60)
            range = Math.ceil(diffHours) + 100 // Add buffer
        }

        // Format symbol (e.g., "EURUSD" -> "FX:EURUSD" if needed, but library might handle it)
        // The library usually expects "EXCHANGE:SYMBOL" or just "SYMBOL" if unique.
        // Let's try to guess exchange or just pass symbol.
        // Common pairs: EURUSD, BTCUSDT.
        // For Forex, "FX:EURUSD" is safer. For Crypto, "BINANCE:BTCUSDT".
        let symbol = formData.asset
        if (!symbol.includes(':')) {
            if (symbol.includes('USDT')) symbol = `BINANCE:${symbol}`
            else symbol = `FX:${symbol}`
        }

        console.log(`Fetching ${range} candles for ${symbol}...`)
        candleData = await fetchHistoricalData(symbol, timeframe, range)
        console.log(`Fetched ${candleData.length} candles`)

    } catch (err) {
        console.error('Failed to fetch real data, falling back to empty:', err)
        // We allow creation even if fetch fails, user can maybe retry later or use generated data
    }

    // Prepare Challenge Status if Prop Firm
    let challengeStatus = null
    if (formData.type === 'PROP_FIRM' && formData.challengeRules) {
        challengeStatus = {
            state: 'ACTIVE',
            start_date: new Date().toISOString(),
            current_daily_drawdown: 0,
            max_drawdown_reached: 0,
            days_traded: 0
        }
    }

    const { data, error } = await supabase
        .from('backtest_sessions')
        .insert({
            user_id: user.id,
            name: formData.name,
            initial_balance: formData.balance,
            current_balance: formData.balance,
            pair: formData.asset,
            chart_layout: formData.layout || 'default',
            session_type: formData.type,
            strategy_id: formData.strategyId || null,
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            timezone: formData.timezone || 'Etc/UTC',
            candle_data: candleData, // Store the fetched JSON
            challenge_rules: formData.challengeRules || null,
            challenge_status: challengeStatus
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating session:', error)
        throw new Error(error.message)
    }

    revalidatePath('/backtest')
    return { id: data.id }
}

export async function updateBacktestSession(sessionId: string, data: {
    current_balance?: number
    name?: string
    notes?: string
    challenge_status?: any
    last_replay_time?: number
}) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('backtest_sessions')
        .update(data)
        .eq('id', sessionId)

    if (error) {
        console.error('Error updating session:', error)
        throw new Error('Failed to update session')
    }
    // revalidatePath('/backtest') // Removed to prevent page reload on auto-save
}

export async function saveBacktestTrade(tradeData: {
    backtest_session_id: string
    pair: string
    type: 'LONG' | 'SHORT'
    entry_price: number
    exit_price: number
    size: number
    pnl: number
    entry_date: string
    exit_date: string
}) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('backtest_trades') // Assuming you have this table or will create it
        .insert(tradeData)

    if (error) {
        console.error('Error saving trade:', error)
        // Don't throw here to avoid blocking UI, just log
    }
}

export async function fetchMarketData(pair: string, interval: string, limit: number = 1000, startTime?: number, endTime?: number) {
    console.log(`Fetching market data for ${pair} ${interval} (Limit: ${limit})`)

    // Map intervals to TradingView format
    // TradingView uses '1', '5', '15', '60', '240', 'D', 'W'
    const intervalMap: Record<string, string> = {
        '1m': '1',
        '5m': '5',
        '15m': '15',
        '1h': '60',
        '4h': '240',
        '1d': 'D',
        '1w': 'W',
        // Add fallbacks
        'D': 'D',
        'W': 'W'
    }

    const tvInterval = intervalMap[interval] || '60'

    // Format symbol
    let symbol = pair
    if (!symbol.includes(':')) {
        if (symbol.includes('USDT')) symbol = `BINANCE:${symbol}`
        else symbol = `FX:${symbol}`
    }

    try {
        // Calculate range (TradingView API takes 'range' as number of candles)
        // If startTime is provided, we might need to fetch enough candles to cover it.
        // But fetchHistoricalData takes 'range' (count).
        // If we want specific dates, we might need to adjust the library or just fetch a large buffer.
        // For now, let's use the limit as range.

        let range = limit

        // If startTime is provided, try to estimate range needed
        if (startTime && !endTime) {
            // This is tricky with just 'range'. 
            // Ideally we'd pass start/end to the service if supported.
            // The current service only supports 'range'.
            // Let's just fetch a large amount if start time is old.
            range = Math.max(limit, 2000)
        }

        const data = await fetchHistoricalData(symbol, tvInterval, range)

        // Filter by time if needed (since we fetched by count)
        let filteredData = data
        if (startTime) {
            filteredData = filteredData.filter((c: any) => c.time >= startTime / 1000)
        }
        if (endTime) {
            filteredData = filteredData.filter((c: any) => c.time <= endTime / 1000)
        }

        return filteredData

    } catch (error) {
        console.error('Failed to fetch market data:', error)
        return []
    }
}

export async function deleteBacktestSession(sessionId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('backtest_sessions')
        .delete()
        .eq('id', sessionId)

    if (error) {
        console.error('Error deleting session:', error)
        throw new Error('Failed to delete session')
    }
    revalidatePath('/backtest')
}

export async function getRecentBacktestSessions(limit: number = 5) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('backtest_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    return data || []
}

export async function getBacktestStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Fetch all backtest sessions for the user
    const { data: sessions } = await supabase
        .from('backtest_sessions')
        .select('id, initial_balance, current_balance, created_at')
        .eq('user_id', user.id)

    if (!sessions || sessions.length === 0) {
        return {
            totalSessions: 0,
            totalTrades: 0,
            winRate: 0,
            totalTimeInvested: 0,
            winRateTrend: [],
            tradesBySymbol: []
        }
    }

    const sessionIds = sessions.map(s => s.id)

    // Fetch all trades for these sessions
    const { data: trades } = await supabase
        .from('backtest_trades')
        .select('*')
        .in('backtest_session_id', sessionIds)

    const totalTrades = trades?.length || 0
    const winningTrades = trades?.filter((t: any) => t.pnl > 0).length || 0
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0

    // Calculate trades by symbol
    const symbolMap = new Map<string, { count: number, wins: number }>()
    trades?.forEach((t: any) => {
        const current = symbolMap.get(t.pair) || { count: 0, wins: 0 }
        symbolMap.set(t.pair, {
            count: current.count + 1,
            wins: current.wins + (t.pnl > 0 ? 1 : 0)
        })
    })

    const tradesBySymbol = Array.from(symbolMap.entries()).map(([symbol, stats]) => ({
        symbol,
        count: stats.count,
        winRate: Math.round((stats.wins / stats.count) * 100)
    })).sort((a, b) => b.count - a.count).slice(0, 5)

    // Mock trend data for now (requires complex time-series query)
    const winRateTrend = [
        { name: 'Jan', rate: 45 },
        { name: 'Feb', rate: 52 },
        { name: 'Mar', rate: 38 },
        { name: 'Apr', rate: 65 },
        { name: 'May', rate: 48 },
        { name: 'Jun', rate: 72 },
        { name: 'Jul', rate: 60 },
    ]

    return {
        totalSessions: sessions.length,
        totalTrades,
        winRate,
        totalTimeInvested: 12.5, // Placeholder until we track session duration
        winRateTrend,
        tradesBySymbol
    }
}
