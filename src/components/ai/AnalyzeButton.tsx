'use client'

import { useFormStatus } from 'react-dom'
import { Bot, Loader2 } from 'lucide-react'
import { analyzeTrade } from '@/app/(dashboard)/ai-coach/actions'

export function AnalyzeButton({ tradeId }: { tradeId: string }) {
    return (
        <form action={async () => await analyzeTrade(tradeId)}>
            <SubmitButton />
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Bot className="h-4 w-4" />
            )}
            {pending ? 'Analyzing...' : 'Analyze'}
        </button>
    )
}
