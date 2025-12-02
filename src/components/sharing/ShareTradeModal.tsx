'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share2, Download, Copy } from 'lucide-react'
import html2canvas from 'html2canvas'
import { cn } from '@/lib/utils'

interface ShareTradeModalProps {
    trade: any
}

export function ShareTradeModal({ trade }: ShareTradeModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const handleDownload = async () => {
        if (!cardRef.current) return
        setIsGenerating(true)

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#09090b', // zinc-950
                scale: 2, // Higher quality
            })

            const image = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.href = image
            link.download = `trade-${trade.pair}-${trade.entry_date}.png`
            link.click()
        } catch (error) {
            console.error('Error generating image:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const pnlColor = trade.pnl > 0 ? 'text-emerald-400' : trade.pnl < 0 ? 'text-red-400' : 'text-zinc-400'
    const bgColor = trade.pnl > 0 ? 'bg-emerald-500/10' : trade.pnl < 0 ? 'bg-red-500/10' : 'bg-zinc-500/10'
    const borderColor = trade.pnl > 0 ? 'border-emerald-500/20' : trade.pnl < 0 ? 'border-red-500/20' : 'border-zinc-500/20'

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Share Trade</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Share Card Preview */}
                    <div
                        ref={cardRef}
                        className={cn(
                            "w-full aspect-[4/3] rounded-xl border p-6 flex flex-col justify-between relative overflow-hidden",
                            bgColor,
                            borderColor
                        )}
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{trade.pair}</h3>
                                <span className={cn("text-sm font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-zinc-700",
                                    trade.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'
                                )}>
                                    {trade.direction}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-zinc-400">Result</p>
                                <p className={cn("text-3xl font-bold", pnlColor)}>
                                    {trade.pnl > 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-zinc-400">Entry</p>
                                <p className="font-mono text-white">{trade.entry_price}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400">Exit</p>
                                <p className="font-mono text-white">{trade.exit_price}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400">R:R</p>
                                <p className="font-mono text-white">1:{trade.rr || '-'}</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                                    <span className="font-bold text-white text-xs">TJ</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Trading Journal</p>
                                    <p className="text-[10px] text-zinc-400">AI-Powered Analytics</p>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500">
                                {new Date(trade.entry_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button
                            className="flex-1 gap-2"
                            onClick={handleDownload}
                            disabled={isGenerating}
                        >
                            <Download className="h-4 w-4" />
                            {isGenerating ? 'Generating...' : 'Download Image'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
