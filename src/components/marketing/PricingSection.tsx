'use client'

import { Check, Shield, Zap, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ManualPaymentDialog } from '@/components/upgrade/ManualPaymentDialog'

interface PricingSectionProps {
    user?: any // Pass user if available (server or client side)
}

export function PricingSection({ user }: PricingSectionProps) {
    const router = useRouter()
    const [showPayment, setShowPayment] = useState(false)

    const handleUpgrade = () => {
        if (user) {
            // User is logged in, show payment dialog immediately
            setShowPayment(true)
        } else {
            // User is not logged in, redirect to signup with intent
            // After signup, we should redirect them to /dashboard?upgrade=true
            router.push('/signup?intent=upgrade')
        }
    }

    return (
        <section className="py-24 bg-black relative overflow-hidden" id="pricing">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Weapon</span>
                    </h2>
                    <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
                        Stop gambling. Start trading like a professional instiution.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* STARTER */}
                    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col hover:border-zinc-700 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest mb-4">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-zinc-500 font-medium">/month</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-4 font-medium">For beginners just starting their journey.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Basic Journaling', '3 AI Analysis / Day', 'Standard Analytics', 'Community Access'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <div className="p-1 rounded-full bg-zinc-800">
                                        <Check className="h-3 w-3 text-zinc-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => router.push('/signup')}
                            className="w-full py-4 rounded-xl bg-zinc-800 text-white font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* PROFESSIONAL (Featured) */}
                    <div className="relative rounded-[2rem] border border-amber-500/30 bg-zinc-900 p-8 flex flex-col shadow-2xl shadow-amber-900/20 transform md:-translate-y-4">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1 rounded-full text-xs font-black text-black uppercase tracking-widest shadow-lg">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Crown className="h-5 w-5 fill-current" />
                                Professional
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">$49</span>
                                <span className="text-zinc-500 font-medium">/month</span>
                            </div>
                            <p className="text-zinc-400 text-sm mt-4 font-medium">For serious traders who want an edge.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                'Run Unlimited AI Analysis',
                                'Advanced Market Structure AI',
                                'Psychology Coashing',
                                'Unlimited Vision Requests',
                                'Priority Support'
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-white font-medium">
                                    <div className="p-1 rounded-full bg-amber-500/20">
                                        <Zap className="h-3 w-3 text-amber-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleUpgrade}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-900/20"
                        >
                            Upgrade Now
                        </button>
                    </div>

                    {/* ELITE */}
                    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col hover:border-zinc-700 transition-colors">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest mb-4">Elite</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">$99</span>
                                <span className="text-zinc-500 font-medium">/month</span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-4 font-medium">For prop firm traders and mentors.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            {['Everything in Pro', 'Mentor Dashboard', 'Team Management', 'API Access', 'White Label Reports'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <div className="p-1 rounded-full bg-zinc-800">
                                        <Shield className="h-3 w-3 text-zinc-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => router.push('/book-demo')}
                            className="w-full py-4 rounded-xl bg-zinc-800 text-white font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                        >
                            Contact Sales
                        </button>
                    </div>

                </div>
            </div>

            {/* Payment Modal (Only opens if user is logged in) */}
            <ManualPaymentDialog open={showPayment} onOpenChange={setShowPayment} />
        </section>
    )
}
