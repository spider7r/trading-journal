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
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 p-4 text-zinc-50">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md space-y-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
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
                                className="inline-flex items-center text-sm font-medium text-emerald-500 hover:text-emerald-400"
                            >
                                Back to Login <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </motion.div>
                    ) : (
                        <form action={handleSubmit} className="mt-8 space-y-6">
                            {error && (
                                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="Email address"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="Password"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                        placeholder="Confirm Password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                            </button>

                            <div className="text-center text-sm">
                                <span className="text-zinc-400">Already have an account? </span>
                                <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-400">
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
