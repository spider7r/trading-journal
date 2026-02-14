'use client'

import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function OnboardingPage() {
    const router = useRouter()

    const handlePlanSelect = (plan: string) => {
        if (plan === 'STARTER') {
            // For starter, we just mark onboarding complete? Or do we require checkout?
            // Since price is $0, maybe just redirect to dashboard directly?
            // But let's assume valid flow for now.
            // Actually user asked for "Checkout page".
            router.push(`/checkout?plan=${plan}`)
        } else {
            router.push(`/checkout?plan=${plan}`)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* STARTER */}
                <div className="bg-[#0b0b0b] rounded-[30px] p-8 border border-zinc-900 flex flex-col h-full hover:border-zinc-800 transition-colors">
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Starter</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-5xl font-bold text-white tracking-tighter">$0</span>
                            <span className="text-zinc-500 font-medium">/mo</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            For beginners learning the ropes.
                        </p>
                    </div>

                    <button
                        onClick={() => handlePlanSelect('STARTER')}
                        className="w-full py-4 rounded-xl border border-zinc-800 text-white font-bold hover:bg-zinc-900 transition-colors mb-8"
                    >
                        Start Free
                    </button>

                    <div className="space-y-4">
                        {['Manual Journaling', 'Basic Analytics', '50 Trades / Month', 'No AI Analysis'].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-zinc-600" />
                                <span className="text-sm text-zinc-400">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PROFESSIONAL (Green) */}
                <div className="bg-[#0b0b0b] rounded-[30px] p-8 border-2 border-[#1DB954] relative flex flex-col h-full transform lg:-translate-y-4 lg:z-10 shadow-2xl shadow-[#1DB954]/10">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1DB954] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Most Popular
                    </div>

                    <div className="mb-8 mt-2">
                        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Professional</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-5xl font-bold text-white tracking-tighter">$29</span>
                            <span className="text-zinc-500 font-medium">/mo</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            For serious traders seeking consistency.
                        </p>
                    </div>

                    <button
                        onClick={() => handlePlanSelect('PROFESSIONAL')}
                        className="w-full py-4 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black uppercase tracking-wider transition-colors mb-8 shadow-lg shadow-green-900/20"
                    >
                        Start 14-Day Trial
                    </button>

                    <div className="space-y-4 flex-1">
                        {['Unlimited Auto-Sync', 'Full AI Coach Access', 'Prop Firm Guardian', 'Advanced Strategy Tracking', 'Priority Support'].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-[#1DB954]" />
                                <span className="text-sm text-white font-medium">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ELITE */}
                <div className="bg-[#0b0b0b] rounded-[30px] p-8 border border-zinc-900 flex flex-col h-full hover:border-zinc-800 transition-colors">
                    <div className="mb-8">
                        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">Elite</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-5xl font-bold text-white tracking-tighter">$59</span>
                            <span className="text-zinc-500 font-medium">/mo</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            For funded traders managing multi-accounts.
                        </p>
                    </div>

                    <button
                        onClick={() => handlePlanSelect('ELITE')}
                        className="w-full py-4 rounded-xl border border-zinc-800 text-white font-bold hover:bg-zinc-900 transition-colors mb-8 hover:border-zinc-700"
                    >
                        Get Elite Access
                    </button>

                    <div className="space-y-4">
                        {['Everything in Pro', 'Multi-Account Aggregation', 'Mentor Access (Discord)', 'Risk Model Templates', 'API Access'].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-zinc-500" />
                                <span className="text-sm text-zinc-400">{feat}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
