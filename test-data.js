// Quick test: Does Dukascopy actually return data?
const { getHistoricalRates, Timeframe } = require('dukascopy-node')

async function test() {
    console.log('Testing Dukascopy data fetch...')

    const toDate = new Date()
    const fromDate = new Date(toDate.getTime() - (24 * 60 * 60 * 1000 * 7)) // 7 days back

    console.log(`From: ${fromDate.toISOString()}`)
    console.log(`To: ${toDate.toISOString()}`)

    try {
        const data = await getHistoricalRates({
            instrument: 'eurusd',
            dates: {
                from: fromDate,
                to: toDate,
            },
            timeframe: Timeframe.m1,
            format: 'json',
            useCache: false
        })

        console.log(`✅ Dukascopy returned ${data.length} candles`)
        if (data.length > 0) {
            console.log('First candle:', data[0])
            console.log('Last candle:', data[data.length - 1])
        }
    } catch (err) {
        console.error('❌ Dukascopy ERROR:', err.message)
        console.error(err)
    }
}

test()
