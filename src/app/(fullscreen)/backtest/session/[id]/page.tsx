import { ChartReplayEngine } from '@/components/backtest/ChartReplayEngine'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Verify session exists and belongs to user
    const { data: session, error } = await supabase
        .from('backtest_sessions')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !session) {
        notFound()
    }

    // Fetch historical trades
    const { data: trades } = await supabase
        .from('backtest_trades')
        .select('*')
        .eq('backtest_session_id', id)
        .order('entry_date', { ascending: true })

    return (
        <div className="h-full flex flex-col">
            {/* Pass session data and trades to engine */}
            <ChartReplayEngine initialSession={session} initialTrades={trades || []} />
        </div>
    )
}
