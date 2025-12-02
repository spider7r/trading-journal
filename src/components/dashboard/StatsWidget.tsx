import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsWidgetProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: string
    trendUp?: boolean
    color?: 'emerald' | 'cyan' | 'blue' | 'violet'
}

export function StatsWidget({ title, value, icon: Icon, trend, trendUp, color = 'emerald' }: StatsWidgetProps) {
    const colorStyles = {
        emerald: {
            border: 'border-zinc-800 hover:border-emerald-500/50',
            bar: 'bg-emerald-500',
            shadow: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]',
            icon: 'text-emerald-500',
            iconBg: 'bg-emerald-500/10',
            trend: 'text-emerald-400'
        },
        cyan: {
            border: 'border-zinc-800 hover:border-cyan-500/50',
            bar: 'bg-cyan-500',
            shadow: 'hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]',
            icon: 'text-cyan-500',
            iconBg: 'bg-cyan-500/10',
            trend: 'text-cyan-400'
        },
        blue: {
            border: 'border-zinc-800 hover:border-blue-500/50',
            bar: 'bg-blue-500',
            shadow: 'hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]',
            icon: 'text-blue-500',
            iconBg: 'bg-blue-500/10',
            trend: 'text-blue-400'
        },
        violet: {
            border: 'border-zinc-800 hover:border-violet-500/50',
            bar: 'bg-violet-500',
            shadow: 'hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.2)]',
            icon: 'text-violet-500',
            iconBg: 'bg-violet-500/10',
            trend: 'text-violet-400'
        },
    }

    const styles = colorStyles[color]

    return (
        <div className={cn(
            "relative overflow-hidden rounded-[2rem] border bg-zinc-900 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 group",
            styles.border,
            styles.shadow
        )}>
            {/* Neon Bottom Bar */}
            <div className={cn("absolute bottom-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity", styles.bar)} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "rounded-2xl p-3.5 border border-zinc-800 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                        styles.iconBg
                    )}>
                        <Icon className={cn("h-6 w-6", styles.icon)} />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider",
                            trendUp ? "text-emerald-400" : "text-red-400"
                        )}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{title}</h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none truncate" title={value.toString()}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    )
}
