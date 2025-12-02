'use client'

import { Button } from '@/components/ui/button'
import {
    Crosshair, TrendingUp, Hash,
    Magnet, Lock, EyeOff, Trash2,
    ArrowUpRight, Minus, MoveVertical, Square, Circle
} from 'lucide-react'

interface BacktestToolbarProps {
    activeTool: string | null
    onToolSelect: (tool: string | null) => void
    isMagnet: boolean
    onToggleMagnet: () => void
    isLocked: boolean
    onToggleLock: () => void
    areDrawingsHidden: boolean
    onToggleHide: () => void
    onRemoveAll: () => void
}

export function BacktestToolbar({
    activeTool,
    onToolSelect,
    isMagnet,
    onToggleMagnet,
    isLocked,
    onToggleLock,
    areDrawingsHidden,
    onToggleHide,
    onRemoveAll
}: BacktestToolbarProps) {

    const tools = [
        { id: 'cursor', icon: Crosshair, label: 'Crosshair' },
        { id: 'line', icon: TrendingUp, label: 'Trend Line' },
        { id: 'ray', icon: ArrowUpRight, label: 'Ray' },
        { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
        { id: 'vertical', icon: MoveVertical, label: 'Vertical Line' },
        { id: 'fib', icon: Hash, label: 'Fib Retracement' },
        { id: 'rect', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Circle' },
    ]

    return (
        <div className="w-full flex flex-col items-center gap-4 shrink-0">
            <div className="flex flex-col gap-1 w-full px-1">
                {tools.map((tool) => (
                    <Button
                        key={tool.id}
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-full rounded-md ${activeTool === tool.id ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2e39]'}`}
                        onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
                        title={tool.label}
                    >
                        <tool.icon className="h-4 w-4" />
                    </Button>
                ))}
            </div>

            <div className="h-px w-6 bg-[#2a2e39]" />

            <div className="flex flex-col gap-1 w-full px-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-full rounded-md ${isMagnet ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2e39]'}`}
                    onClick={onToggleMagnet}
                    title="Magnet Mode"
                >
                    <Magnet className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-full rounded-md ${isLocked ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2e39]'}`}
                    onClick={onToggleLock}
                    title="Lock All Drawings"
                >
                    <Lock className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-full rounded-md ${areDrawingsHidden ? 'text-[#2962ff] bg-[#2a2e39]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2e39]'}`}
                    onClick={onToggleHide}
                    title="Hide All Drawings"
                >
                    <EyeOff className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-full rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#2a2e39]"
                    onClick={onRemoveAll}
                    title="Remove All Drawings"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
