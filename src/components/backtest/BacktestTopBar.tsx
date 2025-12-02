'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
    Play, Pause, SkipBack, SkipForward,
    ChevronLeft, ChevronRight, Settings,
    Newspaper, BookOpen, PlusCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BacktestTopBarProps {
    sessionName: string
    currentIndex: number
    totalCandles: number
    isPlaying: boolean
    speed: number
    onPlayPause: () => void
    onStepBack: () => void
    onStepForward: () => void
    onSeek: (value: number) => void
    onSpeedChange: (speed: number) => void
    onPlaceOrder: () => void
}

export function BacktestTopBar({
    sessionName,
    currentIndex,
    totalCandles,
    isPlaying,
    speed,
    onPlayPause,
    onStepBack,
    onStepForward,
    onSeek,
    onSpeedChange,
    onPlaceOrder
}: BacktestTopBarProps) {
    return (
        <div className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
            {/* Left: Navigation & Session Info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-zinc-400">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100">{sessionName || 'Untitled Session'}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500">
                        <Settings className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Center: Replay Controls */}
            <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl">
                {/* Playback Controls */}
                <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100" onClick={onStepBack}>
                        <SkipBack className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${isPlaying ? 'text-emerald-500' : 'text-zinc-100'}`}
                        onClick={onPlayPause}
                    >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100" onClick={onStepForward}>
                        <SkipForward className="h-3 w-3" />
                    </Button>
                </div>

                {/* Progress Slider */}
                <div className="flex-1 mx-2">
                    <Slider
                        value={[currentIndex]}
                        max={totalCandles - 1}
                        step={1}
                        onValueChange={(vals) => onSeek(vals[0])}
                        className="cursor-pointer"
                    />
                </div>

                {/* Speed Selector */}
                <Select value={speed.toString()} onValueChange={(v) => onSpeedChange(parseInt(v))}>
                    <SelectTrigger className="w-[70px] h-8 bg-zinc-900 border-zinc-800 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1000">1x</SelectItem>
                        <SelectItem value="500">2x</SelectItem>
                        <SelectItem value="100">10x</SelectItem>
                        <SelectItem value="10">Max</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white"
                    onClick={onPlaceOrder}
                >
                    <PlusCircle className="mr-2 h-3 w-3" />
                    Place Order
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-zinc-400">
                    <Newspaper className="mr-2 h-3 w-3" />
                    News
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-zinc-400">
                    <BookOpen className="mr-2 h-3 w-3" />
                    Journal
                </Button>
            </div>
        </div>
    )
}
