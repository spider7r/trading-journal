'use client'

import { useState } from 'react'
import { signup } from '@/app/login/actions'
import { validatePassword, validateEmail } from '@/utils/validation'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, User, Phone, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        // Validate Email
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
            setError(emailValidation.error || 'Invalid email')
            setLoading(false)
            return
        }

        // Validate Password
        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || 'Invalid password')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 text-zinc-50 overflow-hidden relative">
            {/* Rich Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse delay-1000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[100px] animate-pulse delay-2000" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-2xl"
            >
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 mb-4">
                        <User className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white">
                        Create Account
                    </h2>
                    <p className="text-zinc-400">
                        Join the ultimate trading journal platform
                    </p>
                </div>

                <AnimatePresence>
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-4"
                        >
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Check your email</h3>
                                <p className="text-sm text-zinc-400 mt-1">
                                    We've sent a confirmation link to your email address. Please click it to verify your account.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Back to Login <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </motion.div>
                    ) : (
                        <form action={handleSubmit} className="mt-8 space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium flex items-center gap-2"
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div className="group relative">
                                    <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="group relative">
                                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div className="group relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Email address"
                                    />
                                </div>
                                <div className="group relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Password"
                                    />
                                </div>
                                <div className="group relative">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Confirm Password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>

                            <div className="text-center text-sm">
                                <span className="text-zinc-500">Already have an account? </span>
                                <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
