import { getHistoricalRates, Timeframe } from 'dukascopy-node'
import { Candle } from '@/lib/types'

// Map app intervals AND TradingView intervals to Dukascopy timeframes
const intervalMap: Record<string, any> = {
    // App format
    '1m': Timeframe.m1,
    '5m': Timeframe.m5,
    '15m': Timeframe.m15,
    '30m': Timeframe.m30,
    '1h': Timeframe.h1,
    '4h': Timeframe.h4,
    '1d': Timeframe.d1,
    // TradingView format (same values, different keys)
    '1': Timeframe.m1,
    '5': Timeframe.m5,
    '15': Timeframe.m15,
    '30': Timeframe.m30,
    '60': Timeframe.h1,
    '240': Timeframe.h4,
    'D': Timeframe.d1,
    '1D': Timeframe.d1,
}

export async function fetchDukascopyData(
    pair: string,
    interval: string,
    limit: number = 1000,
    endTime?: number // ms
): Promise<Candle[]> {
    try {
        console.log(`[Dukascopy] Fetching ${pair} ${interval} limit=${limit}...`)

        // 1. Normalize Symbol
        // Remove prefixes like "FX:", "OANDA:", "FOREX:" and lower case
        let instrument = pair
            .replace('FX:', '')
            .replace('OANDA:', '')
            .replace('FOREX:', '')
            .toLowerCase()

        // Handle common metal symbols
        if (instrument === 'xauusd') instrument = 'xauusd' // explicit check just in case

        // 2. Resolve Timeframe
        const timeFrame = intervalMap[interval] || Timeframe.h1

        // 3. Calculate Date Range
        // Dukascopy fetching is date-based. We need 'from' and 'to'.
        // 'to' is endTime or now.
        // 'from' is calculated based on limit * interval (approx).

        const toDate = endTime ? new Date(endTime) : new Date()

        // Estimate 'from' date based on limit and interval
        // Use a lookup that handles both app format ('1m') and TV format ('1')
        const msPerCandleMap: Record<string, number> = {
            '1m': 60000, '1': 60000,
            '5m': 300000, '5': 300000,
            '15m': 900000, '15': 900000,
            '30m': 1800000, '30': 1800000,
            '1h': 3600000, '60': 3600000,
            '4h': 14400000, '240': 14400000,
            '1d': 86400000, 'D': 86400000, '1D': 86400000,
        }
        const msPerCandle = msPerCandleMap[interval] || 60000
        const rangeMs = limit * msPerCandle
        // Add buffer to ensure we get enough candles
        const fromDate = new Date(toDate.getTime() - (rangeMs * 1.5))

        console.log(`[Dukascopy] Range: ${fromDate.toISOString()} -> ${toDate.toISOString()}`)

        const data = await getHistoricalRates({
            instrument: instrument as any,
            dates: {
                from: fromDate,
                to: toDate,
            },
            timeframe: timeFrame,
            format: 'json',
            useCache: false
        })

        console.log(`[Dukascopy] Fetched ${data.length} candles`)

        // 4. Transform to Candle interface
        // Dukascopy returns: { timestamp, open, high, low, close, volume }
        const candles: Candle[] = data.map((d: any) => ({
            time: d.timestamp / 1000, // Convert ms to seconds
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume
        }))

        // Sort ascending
        candles.sort((a, b) => a.time - b.time)

        // Trim to limit from the end
        return candles.slice(-limit)

    } catch (error) {
        console.error('[Dukascopy] Error fetching data:', error)
        return []
    }
}
