import { getHistoricalRates, Timeframe } from 'dukascopy-node'
import { Candle } from '@/lib/types'

// Map app intervals to Dukascopy timeframes
const intervalMap: Record<string, any> = {
    '1m': Timeframe.m1,
    '5m': Timeframe.m5,
    '15m': Timeframe.m15,
    '30m': Timeframe.m30,
    '1h': Timeframe.h1,
    '4h': Timeframe.h4,
    '1d': Timeframe.d1,
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
        // 1m = 60000ms
        let msPerCandle = 60 * 1000
        if (interval === '5m') msPerCandle *= 5
        if (interval === '15m') msPerCandle *= 15
        if (interval === '1h') msPerCandle *= 60
        if (interval === '4h') msPerCandle *= 240
        if (interval === '1d') msPerCandle *= 1440

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
