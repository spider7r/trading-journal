import TradingView from '@mathieuc/tradingview'

export interface Candle {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

export async function fetchHistoricalData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000
): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
        const client = new TradingView.Client()
        const chart = new client.Session.Chart()

        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: range,
        })

        chart.onUpdate(() => {
            if (!chart.periods || chart.periods.length === 0) {
                return
            }

            // Format data for Lightweight Charts
            const candles: Candle[] = chart.periods.map((p: any) => ({
                time: p.time,
                open: p.open,
                high: p.max,
                low: p.min,
                close: p.close,
                volume: p.volume
            }))

            // Sort by time ascending
            candles.sort((a, b) => a.time - b.time)

            client.end()
            resolve(candles)
        })

        chart.onError((err: any) => {
            client.end()
            reject(err)
        })
    })
}
