// @ts-ignore
import TradingView from '@mathieuc/tradingview'

interface Candle {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume?: number
}

async function fetchHistoricalData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000
): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
        console.log(`Connecting to TradingView for ${symbol}...`);
        const client = new TradingView.Client()
        const chart = new client.Session.Chart()

        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: range,
        })

        chart.onUpdate(() => {
            console.log('Chart update received');
            if (!chart.periods || chart.periods.length === 0) {
                console.log('No periods found yet...');
                return
            }

            console.log(`Received ${chart.periods.length} periods`);

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
            console.error('Chart Error:', err);
            client.end()
            reject(err)
        })
    })
}

async function test() {
    try {
        console.log('Fetching EURUSD data...');
        const data = await fetchHistoricalData('FX:EURUSD', '1D', 10);
        console.log('Success! Received', data.length, 'candles.');
        console.log('First candle:', data[0]);
        console.log('Last candle:', data[data.length - 1]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

test();
