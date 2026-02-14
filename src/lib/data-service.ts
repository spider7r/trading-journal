import TradingView from '@mathieuc/tradingview'
import { Candle } from '@/lib/types'
import { fetchBinanceData } from './binance'
import { fetchDukascopyData } from './dukascopy-service'
import { AssetCategory } from './assets'

/**
 * Enhanced Data Fetcher that routes to the correct API based on Asset Category.
 * 
 * Routing Logic:
 * - FOREX, METALS -> Dukascopy (Tick data)
 * - CRYPTO -> Binance (Direct API)
 * - INDICES, STOCKS -> TradingView (Wrapper)
 */
export async function fetchHistoricalData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000,
    endTime?: number,
    category?: AssetCategory
): Promise<Candle[]> {

    // 1. DUKASCOPY (Forex & Metals)
    if (category === 'FOREX' || category === 'METALS') {
        return await fetchDukascopyData(symbol, timeframe, range, endTime)
    }

    // 2. BINANCE (Crypto)
    if (category === 'CRYPTO') {
        return await fetchBinanceData(symbol, timeframe, range, undefined, endTime)
    }

    // 3. TRADINGVIEW (Indices, Stocks, & Fallback)
    return await fetchTradingViewData(symbol, timeframe, range, endTime)
}

/**
 * TradingView Data Fetcher (Unofficial Wrapper)
 */
async function fetchTradingViewData(
    symbol: string,
    timeframe: string = '1D',
    range: number = 1000,
    endTime?: number
): Promise<Candle[]> {
    return new Promise((resolve, reject) => {
        const client = new TradingView.Client()
        const chart = new client.Session.Chart()

        chart.setMarket(symbol, {
            timeframe: timeframe,
            range: range,
            to: endTime ? Math.floor(endTime / 1000) : undefined
        } as any)

        chart.onUpdate(() => {
            if (!chart.periods || chart.periods.length === 0) {
                return
            }

            const candles: Candle[] = chart.periods.map((p: any) => ({
                time: p.time,
                open: p.open,
                high: p.max,
                low: p.min,
                close: p.close,
                volume: p.volume
            }))

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

export interface SymbolInfo {
    symbol: string
    description: string
    exchange: string
    type: string
}

export async function searchSymbols(query: string): Promise<SymbolInfo[]> {
    try {
        const results = await (TradingView as any).searchMarket(query)
        return results.map((r: any) => ({
            symbol: r.symbol || r.id || r,
            description: r.description || '',
            exchange: r.exchange || '',
            type: r.type || ''
        }))
    } catch (e) {
        console.error('Search error', e)
        return []
    }
}

export const fetchHistoricalCandles = fetchHistoricalData
