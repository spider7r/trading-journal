'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCheckoutUrl } from '../actions/billing'
import { Loader2, Check, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function CheckoutPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planParam = searchParams.get('plan') || 'starter'

    const [loading, setLoading] = useState(false)
    const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
    const [user, setUser] = useState<any>(null)

    // Plans Configuration
    const plans = {
        starter: {
            name: 'Starter',
            price: interval === 'monthly' ? 19 : 185,
            features: ['Unlimited Trades', 'Basic Analytics', '3 AI Analysis / Day'],
            trial: false
        },
        growth: {
            name: 'Growth',
            price: interval === 'monthly' ? 29 : 280,
            features: ['Unlimited Auto-Sync', 'Full AI Coach Access', 'Prop Firm Guardian'],
            trial: true
        },
        enterprise: {
            name: 'Enterprise',
            price: interval === 'monthly' ? 59 : 570,
            features: ['Multi-Account Aggregation', 'Mentor Access', 'API Access'],
            trial: true
        }
    }

    const selectedPlan = plans[planParam as keyof typeof plans] || plans.starter

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user)
            } else {
                // Optional: Redirect to login if user must be logged in
                // router.push(`/login?next=/checkout?plan=${planParam}`)
            }
        })
    }, [planParam])


    const handleCheckout = async () => {
        if (!user) {
            router.push(`/login?next=/checkout?plan=${planParam}`)
            return
        }

        setLoading(true)
        try {
            const result = await getCheckoutUrl(planParam, interval)
            if (result.url) {
                window.location.href = result.url
            } else {
                alert('Failed to start checkout. Please try again.')
            }
        } catch (error) {
            console.error(error)
            alert('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-white/10 py-4 px-6 flex justify-between items-center">
                <Link href="/" className="font-bold text-lg tracking-tight">TRADAL</Link>
                {user ? (
                    <div className="text-sm text-slate-400">Logged in as <span className="text-white">{user.email}</span></div>
                ) : (
                    <Link href="/login" className="text-sm text-brand-500 hover:text-brand-400">Sign In</Link>
                )}
            </header>

            <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-6 gap-12 mt-8">

                {/* Left Column: Order Summary */}
                <div className="flex-1 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Complete your purchase</h1>
                        <p className="text-slate-400">Unlock the full potential of your trading journal today.</p>
                    </div>

                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold mb-1">{selectedPlan.name} Plan</h3>
                                <p className="text-slate-400 text-sm">Billed {interval}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black">${selectedPlan.price}</div>
                                <div className="text-slate-500 text-xs uppercase font-bold">Total due today</div>
                            </div>
                        </div>

                        {/* Billing Toggle */}
                        <div className="flex bg-black p-1 rounded-lg border border-white/10 mb-6 w-fit">
                            <button
                                onClick={() => setInterval('monthly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${interval === 'monthly' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setInterval('yearly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${interval === 'yearly' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'}`}
                            >
                                Yearly <span className="text-brand-500 ml-1">-20%</span>
                            </button>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-white/10">
                            {selectedPlan.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Check className="w-4 h-4 text-brand-500" />
                                    {feature}
                                </div>
                            ))}
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <ShieldCheck className="w-4 h-4 text-brand-500" />
                                Secure Payment via Lemon Squeezy
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Checkout Action */}
                <div className="w-full md:w-[400px] space-y-6">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold mb-4">Payment Details</h3>

                        {/* User Info (Read Only if Logged In) */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || 'Please Sign In'}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-slate-300 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={loading || !user}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-black font-black py-4 h-auto text-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <Zap className="w-5 h-5 mr-2 fill-black" />
                            )}
                            {loading ? 'Redirecting...' : (selectedPlan.trial ? 'Start 7-Day Free Trial' : `Pay $${selectedPlan.price}`)}
                        </Button>

                        {!user && (
                            <p className="text-xs text-center text-red-400 mt-2">
                                You must sign in to upgrade your account.
                            </p>
                        )}

                        <p className="text-xs text-center text-slate-500 mt-4">
                            By confirming, you agree to our Terms of Service.
                            Payments are processed securely by Lemon Squeezy.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
