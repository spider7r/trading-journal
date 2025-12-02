'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Bot, Send, Sparkles, User, BrainCircuit, TrendingUp, Zap, ChevronRight, Loader2, Paperclip, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sendChatMessage } from '@/app/(dashboard)/ai-coach/actions'
import { TradesTable } from '@/components/trades/TradesTable'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    image?: string
    timestamp: Date
}

interface AICoachInterfaceProps {
    initialTrades: any[]
    initialReports: any[]
}

export function AICoachInterface({ initialTrades, initialReports }: AICoachInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm TJP Buddy, your AI trading assistant. I can analyze your trades, provide psychological tips, or discuss market concepts. How can I help you today?",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [selectedMode, setSelectedMode] = useState<'coach' | 'analyst' | 'psychologist'>('coach')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSend = async () => {
        if (!input.trim() && !selectedImage) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            image: selectedImage || undefined,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setSelectedImage(null)
        setIsTyping(true)

        // Context for the AI
        const context = {
            mode: selectedMode,
            recentTrades: initialTrades.slice(0, 5), // Pass last 5 trades for context
            lastReport: initialReports[0]
        }

        const response = await sendChatMessage(userMsg.content, context, selectedImage || undefined)

        setIsTyping(false)

        if (response.success && response.message) {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMsg])
        } else {
            // Error handling
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting to the server right now. Please try again.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        }
    }

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt)
        // Optional: auto-send
        // handleSend() 
    }

    const handleClearChat = () => {
        setMessages([messages[0]])
    }

    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-6rem)]">
            {/* Top Section: Chat Area (Full Width) */}
            <div className="flex-1 flex flex-col rounded-[2rem] border border-zinc-800 bg-zinc-900 overflow-hidden shadow-2xl min-h-[500px]">
                {/* Chat Header */}
                <div className="p-3 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-2xl bg-gradient-to-br from-[#00E676]/20 to-blue-500/20 border border-[#00E676]/30 shadow-lg shadow-[#00E676]/10">
                            <Bot className="h-5 w-5 text-[#00E676]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase italic tracking-tight bg-gradient-to-r from-white via-[#00E676]/50 to-[#00E676] bg-clip-text text-transparent">TJP Buddy</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E676]"></span>
                                </span>
                                <span className="text-[9px] font-bold text-[#00E676] uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mode Selector */}
                        <div className="hidden md:flex bg-zinc-950 p-0.5 rounded-xl border border-zinc-800">
                            {(['coach', 'analyst', 'psychologist'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setSelectedMode(mode)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        selectedMode === mode
                                            ? "bg-zinc-800 text-white shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-zinc-800 mx-1" />

                        <button
                            onClick={handleClearChat}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Clear Chat"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-3 max-w-4xl mx-auto w-full",
                                msg.role === 'user' ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border",
                                msg.role === 'user'
                                    ? "bg-zinc-800 border-zinc-700"
                                    : "bg-[#00E676]/10 border-[#00E676]/20"
                            )}>
                                {msg.role === 'user' ? <User className="h-4 w-4 text-zinc-400" /> : <Bot className="h-4 w-4 text-[#00E676]" />}
                            </div>

                            <div className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%]",
                                msg.role === 'user'
                                    ? "bg-zinc-800 text-zinc-100 rounded-tr-none"
                                    : "bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-tl-none"
                            )}>
                                {msg.image && (
                                    <div className="mb-3 rounded-xl overflow-hidden border border-zinc-700/50">
                                        <img src={msg.image} alt="User upload" className="w-full h-auto max-h-80 object-cover" />
                                    </div>
                                )}
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mb-2 mt-3 border-b border-zinc-800 pb-1" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold text-[#00E676] mb-1 mt-3 uppercase tracking-wide flex items-center gap-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-zinc-200 mb-1 mt-2" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-1 mb-2 text-zinc-300" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 space-y-1 mb-2 text-zinc-300" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-bold text-[#00E676]" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed text-zinc-300" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[#00E676]/30 pl-3 italic text-zinc-400 my-2" {...props} />,
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                                    <span className="text-[9px] text-zinc-500 opacity-50">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.role === 'assistant' && (
                                        <button
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            className="text-[9px] text-zinc-500 hover:text-[#00E676] transition-colors uppercase tracking-wider font-bold"
                                        >
                                            Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 max-w-4xl mx-auto w-full"
                        >
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-[#00E676]" />
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[#00E676]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-[#00E676]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-[#00E676]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-zinc-950 border-t border-zinc-800">
                    {/* Quick Prompts */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            "Analyze my last trade",
                            "Calculate Position Size (Risk 1%)",
                            "Review my Win Rate vs Risk/Reward",
                            "Give me a Psychology Checklist",
                            "Explain Market Structure Shift",
                            "What is ICT Silver Bullet?"
                        ].map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleQuickPrompt(prompt)}
                                className="flex-shrink-0 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 hover:text-[#00E676] hover:border-[#00E676]/30 hover:bg-zinc-800 transition-all whitespace-nowrap shadow-sm"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    <div className="relative max-w-4xl mx-auto w-full">
                        {selectedImage && (
                            <div className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-start gap-2 shadow-xl">
                                <img src={selectedImage || ""} alt="Preview" className="h-24 w-auto rounded-lg object-cover" />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-400 hover:text-[#00E676] hover:bg-[#00E676]/10 transition-colors"
                            title="Upload Chart"
                        >
                            <Paperclip className="h-5 w-5" />
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask TJP Buddy anything..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-14 pr-16 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#00E676]/50 focus:ring-1 focus:ring-[#00E676]/50 transition-all shadow-inner"
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedImage) || isTyping}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#00E676] text-black hover:bg-[#00E676]/90 disabled:opacity-50 disabled:hover:bg-[#00E676] transition-all shadow-lg shadow-[#00E676]/20"
                        >
                            {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Stats & Actions (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Coach's Memory */}
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="h-5 w-5 text-[#00E676]" />
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Coach's Memory</h3>
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Last Trade Analysis</div>
                        <div className="text-sm text-zinc-300 font-medium">
                            {initialReports[0] ? (
                                <span className="line-clamp-3 leading-relaxed">
                                    {initialReports[0].content?.review || initialReports[0].report_content || 'Analysis available'}
                                </span>
                            ) : (
                                <span className="text-zinc-600 italic">No recent analysis found.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Performance Stats */}
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Live Performance</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">
                                    {initialTrades.length > 0
                                        ? `${Math.round((initialTrades.filter(t => t.pnl > 0).length / initialTrades.length) * 100)}%`
                                        : '0%'}
                                </div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Win Rate</div>
                            </div>
                            <div className="h-12 w-px bg-zinc-800" />
                            <div className="text-center">
                                <div className={cn(
                                    "text-3xl font-black",
                                    initialTrades.reduce((acc, t) => acc + (t.pnl || 0), 0) >= 0 ? "text-[#00E676]" : "text-red-400"
                                )}>
                                    ${initialTrades.reduce((acc, t) => acc + (t.pnl || 0), 0).toFixed(0)}
                                </div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Net P&L</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Quick Actions */}
                <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Quick Actions</h3>
                    </div>
                    <div className="flex-1 space-y-3">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#00E676]/30 hover:bg-zinc-900 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#00E676]/10 text-[#00E676] group-hover:bg-[#00E676] group-hover:text-black transition-colors">
                                    <BrainCircuit className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-zinc-300 group-hover:text-white">Full Account Audit</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-[#00E676]" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#00E676]/30 hover:bg-zinc-900 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-zinc-300 group-hover:text-white">Generate Weekly Plan</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-purple-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
