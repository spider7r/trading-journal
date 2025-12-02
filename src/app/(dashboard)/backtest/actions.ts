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
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
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
            timezone: formData.timezone || 'Etc/UTC'
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
    // Map common intervals to Binance format
    const intervalMap: Record<string, string> = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d',
    }

    const binanceInterval = intervalMap[interval] || '1h'
    const symbol = pair.toUpperCase().replace('/', '')

    let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`
    if (startTime) url += `&startTime=${startTime}`
    if (endTime) url += `&endTime=${endTime}`

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        const response = await fetch(
            url,
            {
                cache: 'no-store',
                signal: controller.signal
            }
        )
        clearTimeout(timeoutId)

        if (!response.ok) {
            console.error(`Binance API Error: ${response.status} ${response.statusText}`)
            throw new Error(`Binance API Error: ${response.statusText}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
            console.error('Binance API returned invalid format', data)
            return []
        }

        // Binance returns array of arrays: [time, open, high, low, close, volume, ...]
        return data.map((d: any[]) => ({
            time: d[0] / 1000,
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
        }))
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
