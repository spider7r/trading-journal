export type OrderType = 'MARKET' | 'LIMIT' | 'STOP'
export type Side = 'LONG' | 'SHORT'
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED'

export interface PriceQuote {
    time: number
    bid: number
    ask: number
    spread: number
}

export interface Order {
    id: string
    sessionId: string
    symbol: string
    side: Side
    type: OrderType
    quantity: number
    limitPrice?: number
    stopPrice?: number
    status: OrderStatus
    createdAt: number
    filledAt?: number
    fillPrice?: number
    stopLoss?: number
    takeProfit?: number
}

export interface Trade {
    id: string
    orderId: string
    sessionId: string
    symbol: string
    side: Side
    entryPrice: number
    exitPrice?: number
    quantity: number
    pnl?: number
    entryTime: number
    exitTime?: number
    status: 'OPEN' | 'CLOSED'
    commission: number
    swap: number
    stopLoss?: number
    takeProfit?: number
}

export class BacktestEngine {
    private balance: number
    private equity: number
    private orders: Order[] = []
    private trades: Trade[] = []
    private currentQuote: PriceQuote | null = null

    private onTradeClosed?: (trade: Trade) => void

    private maxEquity: number
    private maxDrawdown: number = 0

    constructor(initialBalance: number, onTradeClosed?: (trade: Trade) => void, initialTrades: Trade[] = []) {
        this.balance = initialBalance
        this.equity = initialBalance
        this.maxEquity = initialBalance
        this.onTradeClosed = onTradeClosed
        this.trades = initialTrades
    }

    private calculateFillPrice(basePrice: number, side: Side, type: OrderType): number {
        // Simple spread model: Buy at Ask, Sell at Bid
        let price = basePrice
        if (type === 'MARKET') {
            price = side === 'LONG' ? this.currentQuote!.ask : this.currentQuote!.bid

            // Slippage Simulation (Random 0-2 bps adverse excursion)
            const slippage = price * (Math.random() * 0.0002)
            price = side === 'LONG' ? price + slippage : price - slippage
        }
        return price
    }

    public placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>) {
        const newOrder: Order = {
            ...order,
            id: Math.random().toString(36).substr(2, 9),
            status: 'PENDING',
            createdAt: Date.now()
        }
        this.orders.push(newOrder)
        this.checkOrders() // Check immediate fill for Market orders
        return newOrder
    }

    public processCandle(candle: { open: number, high: number, low: number, close: number, time: number }) {
        // 1. Update Quote (Synthetic Bid/Ask based on Close)
        // In a real tick simulation, we'd use tick data. For candles, we simulate price movement.
        // We assume Close is the last Mid price.
        const spread = 0.0002 * candle.close // 2 bps spread assumption
        const bid = candle.close - (spread / 2)
        const ask = candle.close + (spread / 2)

        this.currentQuote = {
            time: candle.time,
            bid,
            ask,
            spread
        }

        // 2. Check Orders against Candle High/Low
        // We check if the price range [Low, High] hit our Limit/Stop levels
        this.checkOrders(candle)

        // 3. Update Equity
        this.updateEquity()
    }

    private checkOrders(candle?: { high: number, low: number }) {
        if (!this.currentQuote) return

        const { bid, ask } = this.currentQuote
        const high = candle ? candle.high : ask
        const low = candle ? candle.low : bid

        // Check Pending Orders
        this.orders.filter(o => o.status === 'PENDING').forEach(order => {
            let triggered = false
            let fillPrice = 0

            if (order.type === 'MARKET') {
                triggered = true
                fillPrice = this.calculateFillPrice(0, order.side, 'MARKET')
            } else if (order.type === 'LIMIT') {
                if (order.side === 'LONG' && low <= (order.limitPrice || 0)) {
                    triggered = true
                    fillPrice = order.limitPrice!
                } else if (order.side === 'SHORT' && high >= (order.limitPrice || 0)) {
                    triggered = true
                    fillPrice = order.limitPrice!
                }
            } else if (order.type === 'STOP') {
                if (order.side === 'LONG' && high >= (order.stopPrice || 0)) {
                    triggered = true
                    // Stop triggers market order, so we apply slippage/spread
                    fillPrice = this.calculateFillPrice(order.stopPrice!, order.side, 'MARKET')
                } else if (order.side === 'SHORT' && low <= (order.stopPrice || 0)) {
                    triggered = true
                    fillPrice = this.calculateFillPrice(order.stopPrice!, order.side, 'MARKET')
                }
            }

            if (triggered) {
                this.fillOrder(order, fillPrice)
            }
        })

        // Check Open Trades (SL/TP)
        this.trades.filter(t => t.status === 'OPEN').forEach(trade => {
            let close = false
            let exitPrice = 0

            if (trade.side === 'LONG') {
                if (trade.stopLoss && low <= trade.stopLoss) {
                    close = true
                    exitPrice = trade.stopLoss
                } else if (trade.takeProfit && high >= trade.takeProfit) {
                    close = true
                    exitPrice = trade.takeProfit
                }
            } else {
                if (trade.stopLoss && high >= trade.stopLoss) {
                    close = true
                    exitPrice = trade.stopLoss
                } else if (trade.takeProfit && low <= trade.takeProfit) {
                    close = true
                    exitPrice = trade.takeProfit
                }
            }

            if (close) {
                this.closeTrade(trade, exitPrice)
            }
        })
    }

    private fillOrder(order: Order, price: number) {
        order.status = 'FILLED'
        order.filledAt = this.currentQuote?.time || Date.now()
        order.fillPrice = price

        const trade: Trade = {
            id: Math.random().toString(36).substr(2, 9),
            orderId: order.id,
            sessionId: order.sessionId,
            symbol: order.symbol,
            side: order.side,
            entryPrice: price,
            quantity: order.quantity,
            entryTime: order.filledAt,
            status: 'OPEN',
            commission: 0,
            swap: 0,
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit
        }
        this.trades.push(trade)
    }

    private closeTrade(trade: Trade, price: number) {
        trade.status = 'CLOSED'
        trade.exitPrice = price
        trade.exitTime = this.currentQuote?.time || Date.now()

        const multiplier = trade.side === 'LONG' ? 1 : -1
        trade.pnl = (price - trade.entryPrice) * trade.quantity * multiplier

        this.balance += trade.pnl
        this.updateEquity()

        if (this.onTradeClosed) {
            this.onTradeClosed(trade)
        }
    }

    private updateEquity() {
        if (!this.currentQuote) return

        const unrealizedPnl = this.trades
            .filter(t => t.status === 'OPEN')
            .reduce((acc, t) => {
                const currentPrice = t.side === 'LONG' ? this.currentQuote!.bid : this.currentQuote!.ask
                const multiplier = t.side === 'LONG' ? 1 : -1
                return acc + (currentPrice - t.entryPrice) * t.quantity * multiplier
            }, 0)

        this.equity = this.balance + unrealizedPnl

        // Update Drawdown Stats
        if (this.equity > this.maxEquity) {
            this.maxEquity = this.equity
        }
        const currentDrawdown = (this.maxEquity - this.equity) / this.maxEquity * 100
        if (currentDrawdown > this.maxDrawdown) {
            this.maxDrawdown = currentDrawdown
        }
    }

    public getStats() {
        return {
            balance: this.balance,
            equity: this.equity,
            openTrades: this.trades.filter(t => t.status === 'OPEN').length,
            closedTrades: this.trades.filter(t => t.status === 'CLOSED').length,
            maxDrawdown: this.maxDrawdown
        }
    }

    public getTrades(): Trade[] {
        return this.trades
    }

    public getOrders(): Order[] {
        return this.orders
    }
}
