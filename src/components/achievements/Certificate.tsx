'use client'

import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Trophy, ShieldCheck, Calendar } from 'lucide-react'

interface CertificateProps {
    accountName: string
    type: 'TARGET_HIT' | 'PASSED'
    date: string
    amount?: number
    currency?: string
    certificateId?: string
}

export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ accountName, type, date, amount, currency = 'USD', certificateId }, ref) => {
    return (
        <div ref={ref} className="w-[800px] h-[600px] bg-zinc-950 relative overflow-hidden flex flex-col p-12 border-[16px] border-zinc-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-zinc-950 to-zinc-950" />

            {/* Decorative Circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-16">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Trophy className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Trading Journal</h1>
                        <p className="text-emerald-500 text-sm font-medium tracking-wider uppercase">Certificate of Achievement</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-sm">Certificate ID</p>
                    <p className="text-zinc-300 font-mono text-sm">{certificateId || 'CERT-PREVIEW'}</p>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <p className="text-zinc-400 text-lg uppercase tracking-widest">This certifies that</p>

                <h2 className="text-5xl font-black text-white mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    {accountName}
                </h2>

                <div className="h-px w-32 bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-6" />

                <p className="text-zinc-300 text-xl max-w-lg leading-relaxed">
                    Has successfully completed the trading objectives and demonstrated exceptional discipline and consistency.
                </p>

                <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-emerald-400 font-bold text-lg">
                        {type === 'TARGET_HIT' ? 'PROFIT TARGET HIT' : 'CHALLENGE PASSED'}
                    </span>
                </div>

                {amount && (
                    <p className="text-zinc-500 mt-4 font-mono">
                        Total Profit: <span className="text-white">{currency} {amount.toLocaleString()}</span>
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-auto flex justify-between items-end pt-12 border-t border-zinc-900">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg">
                        <QRCodeSVG value="https://trading-journal.com" size={64} />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Verified By</p>
                        <p className="text-white font-semibold">Trading Journal AI</p>
                        <p className="text-xs text-zinc-600">trading-journal.com</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-zinc-400 mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm" suppressHydrationWarning>{date}</span>
                    </div>
                    <div className="h-px w-48 bg-zinc-800 mt-4 mb-2" />
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Authorized Signature</p>
                </div>
            </div>
        </div>
    )
})

Certificate.displayName = 'Certificate'
