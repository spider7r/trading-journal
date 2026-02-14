'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Check, Star, Zap, Crown, Shield, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ManualPaymentDialog } from './ManualPaymentDialog'
import { cn } from '@/lib/utils'

interface OnboardingPricingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function OnboardingPricingDialog({ open, onOpenChange }: OnboardingPricingDialogProps) {
    const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PROFESSIONAL' | 'ELITE' | null>(null)
    const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes

    // Urgency Timer
    useEffect(() => {
        if (!open) return
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(timer)
    }, [open])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (selectedPlan === 'PROFESSIONAL' || selectedPlan === 'ELITE') {
        return (
            <ManualPaymentDialog
                open={true}
                onOpenChange={(isOpen) => {
                    if (!isOpen) setSelectedPlan(null)
                }}
            // In future: pass plan context to dialog
            />
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl border-0 bg-transparent p-0 overflow-hidden shadow-2xl focus:outline-none">
                <div className="relative bg-[#09090b] border border-amber-500/20 rounded-3xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px] w-full shadow-2xl shadow-amber-900/40">

                    {/* Urgency Banner */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 animate-pulse z-50"></div>

                    {/* Left Panel: Pitch */}
                    <div className="md:w-1/3 bg-[#0D1117] relative p-8 flex flex-col justify-between border-r border-zinc-800">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest mb-6 animate-pulse">
                                <Clock className="h-3 w-3" />
                                Offer Ends in {formatTime(timeLeft)}
                            </div>
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                                Unlock <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">God Mode</span>
                            </h2>
                            <p className="text-zinc-400 font-medium leading-relaxed">
                                Join the top 1% of traders who use AI to eliminate emotional errors and scale their capital.
                            </p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                                    <Crown className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <div className="text-white font-bold">Unlimited AI Analysis</div>
                                    <div className="text-xs text-zinc-500">No daily caps. Full power.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                                    <Shield className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-white font-bold">Capital Protection</div>
                                    <div className="text-xs text-zinc-500">Risk management guardrails.</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 pt-8 border-t border-zinc-800">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-6 w-6 rounded-full bg-zinc-800 border-2 border-[#0D1117]" />
                                    ))}
                                </div>
                                <span>+1,240 traders upgraded this week</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Plans */}
                    <div className="flex-1 p-8 bg-[#09090b] relative">
                        {/* Close Button */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-20"
                        >
                            Skip for now
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-center pt-8">

                            {/* Professional Plan (Hero) */}
                            <button
                                onClick={() => setSelectedPlan('PROFESSIONAL')}
                                className="relative group rounded-3xl border-2 border-amber-500 bg-zinc-900/50 p-6 text-left hover:bg-zinc-900 transition-all hover:scale-[1.02] shadow-2xl shadow-amber-900/20"
                            >
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                                <div className="mb-4">
                                    <div className="text-amber-500 font-black uppercase tracking-wider text-xs mb-1">Professional</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">$49</span>
                                        <span className="text-zinc-500 font-medium">/mo</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 line-through decoration-red-500">$99/mo</div>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {['Unlimited AI Chat', 'Vision Analysis (50/day)', 'Advanced Reports', 'Priority Support'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                                            <Check className="h-3.5 w-3.5 text-amber-500" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <div className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-center text-sm transition-colors">
                                    Start Pro Trial
                                </div>
                            </button>

                            {/* Elite Plan */}
                            <button
                                onClick={() => setSelectedPlan('ELITE')}
                                className="relative group rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 text-left hover:border-zinc-600 transition-all hover:scale-[1.02]"
                            >
                                <div className="mb-4">
                                    <div className="text-purple-500 font-black uppercase tracking-wider text-xs mb-1">Elite</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-white">$99</span>
                                        <span className="text-zinc-500 font-medium">/mo</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {['Everything in Pro', 'Unlimited Vision', '1-on-1 Strategy Call', 'Dedicated Account Mgr'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-zinc-300">
                                            <Check className="h-3.5 w-3.5 text-purple-500" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <div className="w-full py-3 rounded-xl bg-zinc-800 group-hover:bg-white group-hover:text-black text-white font-black uppercase tracking-wider text-center text-sm transition-colors">
                                    Get Elite
                                </div>
                            </button>

                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                                By upgrading, you agree to our Terms of Service. Cancel anytime.
                                <span className="block mt-2 text-amber-500 font-bold">30-Day Money Back Guarantee</span>
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
