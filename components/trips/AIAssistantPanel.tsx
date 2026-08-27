'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { parseSuggestions, type ItinerarySuggestion } from '@/lib/utils/parse-suggestions'
import { parseLocalDate } from '@/lib/dates'

interface AIAssistantPanelProps {
  tripId: string
  tripTitle: string
  tripDestination: string
  tripType: string | null
  open: boolean
  onClose: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function AIAssistantPanel({
  tripId,
  tripTitle,
  tripDestination,
  tripType,
  open,
  onClose,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Seed welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hey! I'm your AI trip planner for **${tripTitle}**. I know you're heading to **${tripDestination}** — I can help you find activities, restaurants, and build out your itinerary.\n\nWhat would you like to plan?`,
        },
      ])
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open, messages.length, tripTitle, tripDestination])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isStreaming) return

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content: messageText,
    }

    const assistantId = nanoid()
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ])
    setInput('')
    setIsStreaming(true)

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch(`/api/trips/${tripId}/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history }),
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMsg = `Error ${response.status}`
        try {
          const errData = JSON.parse(text)
          errorMsg = errData.error || errorMsg
        } catch {
          errorMsg = text || errorMsg
        }
        throw new Error(errorMsg)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
        )
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error'
      console.error('AI assistant error:', errorMessage)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Sorry, something went wrong: ${errorMessage}` }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleAddToItinerary = async (suggestion: ItinerarySuggestion) => {
    const key = `${suggestion.title}-${suggestion.date}`
    setAddingItems((prev) => new Set(prev).add(key))

    try {
      const response = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestion.title,
          date: suggestion.date,
          time: suggestion.time || null,
          location: suggestion.location || null,
          description: suggestion.description || null,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to add item')
      }

      toast.success(`Added "${suggestion.title}" to itinerary`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to itinerary')
    } finally {
      setAddingItems((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const starterPrompts = getStarterPrompts(tripType)

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-[#DAD2BC] bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.08)] sm:w-[440px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DAD2BC] px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#3B6D11]" />
            <div>
              <h2 className="text-base font-semibold text-[#1C1A17]">AI Trip Planner</h2>
              <p className="text-xs text-[#6B6460]">{tripDestination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[5px] p-1.5 text-[#6B6460] transition-colors hover:bg-[#F5F1ED] hover:text-[#1C1A17]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  <div className="ml-12 rounded-[5px] bg-[#3B6D11] px-4 py-3 text-sm text-white">
                    {message.content}
                  </div>
                ) : (
                  <div className="mr-4">
                    <MessageContent
                      content={message.content}
                      onAddToItinerary={handleAddToItinerary}
                      addingItems={addingItems}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Starter prompts - show after welcome message only */}
            {messages.length === 1 && messages[0].id === 'welcome' && !isStreaming && (
              <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-[#DAD2BC] bg-white px-3 py-1.5 text-xs font-medium text-[#3B6D11] transition-colors hover:border-[#3B6D11] hover:bg-[#F5F1ED]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#DAD2BC] px-6 py-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'Thinking...' : 'Ask about your trip...'}
              disabled={isStreaming}
              className="flex-1 rounded-[5px] border border-[#DAD2BC] bg-white px-4 py-2.5 text-sm text-[#1C1A17] placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17]/15 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              className="rounded-[5px] bg-[#3B6D11] p-2.5 text-white transition-colors hover:bg-[#2F5A0E] disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Render assistant message content with parsed suggestions
function MessageContent({
  content,
  onAddToItinerary,
  addingItems,
}: {
  content: string
  onAddToItinerary: (suggestion: ItinerarySuggestion) => void
  addingItems: Set<string>
}) {
  if (!content) {
    return (
      <div className="rounded-[5px] bg-[#F5F1ED] px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-[#6B6460]">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3B6D11]" />
          Thinking...
        </div>
      </div>
    )
  }

  const segments = parseSuggestions(content)

  return (
    <div className="space-y-3">
      {segments.map((segment, i) => {
        if (segment.type === 'text') {
          const trimmed = segment.content.trim()
          if (!trimmed) return null
          return (
            <div
              key={i}
              className="rounded-[5px] bg-[#F5F1ED] px-4 py-3 text-sm leading-relaxed text-[#1C1A17]"
            >
              <SimpleMarkdown text={trimmed} />
            </div>
          )
        }

        const { data } = segment
        const key = `${data.title}-${data.date}`
        const isAdding = addingItems.has(key)

        return (
          <div
            key={i}
            className="rounded-[5px] border border-[#DAD2BC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <h4 className="text-sm font-semibold text-[#1C1A17]">{data.title}</h4>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6B6460]">
              {data.date && (
                <span>
                  {parseLocalDate(data.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
              {data.time && <span>{formatTime(data.time)}</span>}
              {data.location && <span>{data.location}</span>}
            </div>
            {data.description && (
              <p className="mt-2 text-xs leading-relaxed text-[#6B6460]">
                {data.description}
              </p>
            )}
            <button
              onClick={() => onAddToItinerary(data)}
              disabled={isAdding}
              className="mt-3 flex items-center gap-1 rounded-[5px] bg-[#3B6D11] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3d6a4a] disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {isAdding ? 'Adding...' : 'Add to Itinerary'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Simple markdown-ish renderer for bold and newlines
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        // Replace **bold** with <strong>
        const parts = line.split(/(\*\*.*?\*\*)/g)
        return (
          <span key={i}>
            {i > 0 && <br />}
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={j} className="font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return <span key={j}>{part}</span>
            })}
          </span>
        )
      })}
    </>
  )
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getStarterPrompts(tripType: string | null): string[] {
  switch (tripType) {
    case 'golf':
      return [
        'Suggest a 3-day golf itinerary',
        'Best golf courses nearby',
        'Top restaurants after golf',
      ]
    case 'ski':
      return [
        'Suggest a ski weekend schedule',
        'Best runs for our group',
        'Top apres-ski spots',
      ]
    case 'bachelor_party':
      return [
        'Plan a full bachelor weekend',
        'Best group activities',
        'Top nightlife spots',
      ]
    case 'bachelorette_party':
      return [
        'Plan a bachelorette weekend',
        'Best brunch spots',
        'Spa & wine experiences',
      ]
    default:
      return [
        'Suggest a 3-day itinerary',
        'Best restaurants nearby',
        'Top group activities',
      ]
  }
}
