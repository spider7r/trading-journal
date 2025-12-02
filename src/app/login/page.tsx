import { login } from './actions'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 p-4 text-zinc-50">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Sign in to your trading journal
                    </p>
                </div>

                {params?.error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                        {params.error}
                    </div>
                )}

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 p-3 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/forgot-password" className="text-sm font-medium text-zinc-400 hover:text-emerald-500 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        formAction={login}
                        className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all"
                    >
                        Sign in
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-zinc-400">Don't have an account? </span>
                        <Link href="/signup" className="font-medium text-emerald-500 hover:text-emerald-400">
                            Create one
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
