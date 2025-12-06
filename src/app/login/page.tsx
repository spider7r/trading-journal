'use client'

import { login } from './actions'
import Link from 'next/link'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-2xl"
        >
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 mb-4">
                    <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                    Welcome Back
                </h2>
                <p className="text-zinc-400">
                    Enter your credentials to access your journal
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium flex items-center gap-2"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                </motion.div>
            )}

            <form className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div className="group relative">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            placeholder="Email address"
                        />
                    </div>
                    <div className="group relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="block w-full rounded-xl border border-zinc-800 bg-black/40 pl-12 p-3.5 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500/50 focus:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            placeholder="Password"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <Link href="/forgot-password" className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <button
                    formAction={login}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Sign in
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="text-center text-sm">
                    <span className="text-zinc-500">Don't have an account? </span>
                    <Link href="/signup" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                        Create one now
                    </Link>
                </div>
            </form>
        </motion.div>
    )
}

export default function LoginPage() {
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

            <Suspense fallback={null}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
