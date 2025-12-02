export type Candle = {
    time: number // Unix timestamp in seconds
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export async function fetchBinanceData(
    pair: string,
    interval: string,
    limit: number = 1000
): Promise<Candle[]> {
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
    const symbol = pair.toUpperCase().replace('/', '') // e.g., BTC/USDT -> BTCUSDT

    try {
        const response = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`
        )

        if (!response.ok) {
            throw new Error(`Binance API Error: ${response.statusText}`)
        }

        const data = await response.json()

        // Binance returns array of arrays: [time, open, high, low, close, volume, ...]
        return data.map((d: any[]) => ({
            time: d[0] / 1000, // Convert ms to seconds for Lightweight Charts
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
        }))
    } catch (error) {
        console.error('Failed to fetch Binance data:', error)
        return []
    }
}
