'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBacktestSession, getStrategiesList } from '@/app/(dashboard)/backtest/actions'
import { useEffect } from 'react'
import { timezones } from '@/lib/timezones'

interface CreateSessionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [sessionType, setSessionType] = useState<'BACKTEST' | 'PROP_FIRM'>('BACKTEST')

    // Form State
    const [name, setName] = useState('')
    const [balance, setBalance] = useState('100000')
    const [asset, setAsset] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [timezone, setTimezone] = useState('America/New_York')
    const [layout, setLayout] = useState('')
    const [strategyId, setStrategyId] = useState('')
    const [strategies, setStrategies] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            getStrategiesList().then(setStrategies)
        }
    }, [open])

    const handleCreate = async () => {
        if (!name || !balance || !asset) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsLoading(true)
        try {
            const session = await createBacktestSession({
                name,
                balance: parseFloat(balance),
                asset,
                layout,
                type: sessionType,
                strategyId: strategyId === 'none' ? undefined : strategyId,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                endDate: endDate ? new Date(endDate).toISOString() : undefined,
                timezone
            })

            toast.success('Session created successfully!')
            onOpenChange(false)
            router.push(`/backtest/session/${session.id}`)
        } catch (error: any) {
            console.error('Session creation error:', error)
            toast.error(error.message || 'Failed to create session')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#0A0A0A] border-white/5 text-white p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
                    <DialogTitle className="text-xl font-bold text-white">Create a quick session</DialogTitle>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" size="sm" className="bg-[#050505] text-[#94A3B8] hover:bg-[#111] h-8 text-xs font-medium border border-white/5">
                            Advanced session
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#94A3B8] hover:text-white" onClick={() => onOpenChange(false)}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Session Type Tabs */}
                    <Tabs value={sessionType} onValueChange={(v) => setSessionType(v as any)} className="w-full">
                        <TabsList className="w-full grid grid-cols-2 bg-[#050505] border border-white/5 h-12 p-1">
                            <TabsTrigger
                                value="BACKTEST"
                                className="data-[state=active]:bg-[#0A0A0A] data-[state=active]:text-white text-[#94A3B8] h-full"
                            >
                                Backtesting Session
                            </TabsTrigger>
                            <TabsTrigger
                                value="PROP_FIRM"
                                className="data-[state=active]:bg-[#0A0A0A] data-[state=active]:text-white text-[#94A3B8] h-full gap-2"
                            >
                                Prop Firm Session
                                <span className="bg-[#00E676]/20 text-[#00E676] text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-current" /> Pro
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[#94A3B8] font-medium">Name *</Label>
                            <Input
                                placeholder="Name your session"
                                className="bg-[#050505] border-white/5 text-white placeholder:text-[#94A3B8]/50 h-11 focus-visible:ring-[#00E676]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#94A3B8] font-medium">Account Balance *</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold">$</div>
                                <Input
                                    type="number"
                                    className="bg-[#050505] border-white/5 text-white pl-8 h-11 focus-visible:ring-[#00E676]"
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#94A3B8] font-medium">Assets *</Label>
                            <Select value={asset} onValueChange={setAsset}>
                                <SelectTrigger className="bg-[#050505] border-white/5 text-white h-11 focus:ring-[#00E676]">
                                    <SelectValue placeholder="Type to search for assets" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/5 text-white">
                                    <SelectItem value="EURUSD">EURUSD</SelectItem>
                                    <SelectItem value="GBPUSD">GBPUSD</SelectItem>
                                    <SelectItem value="USDJPY">USDJPY</SelectItem>
                                    <SelectItem value="XAUUSD">XAUUSD</SelectItem>
                                    <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                                    <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                                    <SelectItem value="SOLUSDT">SOLUSDT</SelectItem>
                                    <SelectItem value="XRPUSDT">XRPUSDT</SelectItem>
                                    <SelectItem value="ADAUSDT">ADAUSDT</SelectItem>
                                    <SelectItem value="BNBUSDT">BNBUSDT</SelectItem>
                                    <SelectItem value="DOGEUSDT">DOGEUSDT</SelectItem>
                                    <SelectItem value="DOTUSDT">DOTUSDT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[#94A3B8] font-medium">Start Date</Label>
                                <Input
                                    type="date"
                                    className="bg-[#050505] border-white/5 text-white h-11 focus-visible:ring-[#00E676]"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#94A3B8] font-medium">End Date</Label>
                                <Input
                                    type="date"
                                    className="bg-[#050505] border-white/5 text-white h-11 focus-visible:ring-[#00E676]"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#94A3B8] font-medium flex items-center gap-2">
                                Select Chart Layout (Optional)
                                <InfoIcon />
                            </Label>
                            <Select value={layout} onValueChange={setLayout}>
                                <SelectTrigger className="bg-[#050505] border-white/5 text-white h-11 focus:ring-[#00E676]">
                                    <SelectValue placeholder="Select layout" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/5 text-white">
                                    <SelectItem value="split">Split Screen</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#94A3B8] font-medium">Strategy (Optional)</Label>
                            <Select value={strategyId} onValueChange={setStrategyId}>
                                <SelectTrigger className="bg-[#050505] border-white/5 text-white h-11 focus:ring-[#00E676]">
                                    <SelectValue placeholder="Select strategy to test" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/5 text-white">
                                    <SelectItem value="none">No Strategy</SelectItem>
                                    {strategies.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#94A3B8] font-medium">Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger className="bg-[#050505] border-white/5 text-white h-11 focus:ring-[#00E676]">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0A] border-white/5 text-white max-h-[200px]">
                                    {timezones.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        className="text-[#94A3B8] hover:text-white hover:bg-[#050505]"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-[#00E676] hover:bg-[#00C853] text-black font-bold min-w-[140px]"
                        disabled={!name || !balance || !asset || isLoading}
                        onClick={handleCreate}
                    >
                        {isLoading ? 'Creating...' : 'Create session'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function InfoIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}
