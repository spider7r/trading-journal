import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AccountProvider } from '@/context/AccountContext'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user accounts
    const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    return (
        <AccountProvider initialAccounts={accounts || []}>
            <div className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-50">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                <div className="relative z-10 flex h-full w-full">
                    <Sidebar />
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <Topbar />
                        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            <div className="mx-auto max-w-7xl">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </AccountProvider>
    )
}
