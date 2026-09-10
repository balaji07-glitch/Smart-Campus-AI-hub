import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Sparkles, Bot } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface TranscriptLine {
  role: 'user' | 'assistant';
  text: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const stateConfig: Record<AssistantState, { color: string; ringColor: string; label: string }> = {
  idle:      { color: 'from-indigo-600 to-blue-600',    ringColor: 'ring-indigo-400/40', label: 'AI Voice Assistant' },
  listening: { color: 'from-rose-500 to-pink-600',      ringColor: 'ring-rose-400/60',   label: 'Listening…' },
  thinking:  { color: 'from-amber-500 to-orange-500',   ringColor: 'ring-amber-400/60',  label: 'Thinking…' },
  speaking:  { color: 'from-emerald-500 to-teal-500',   ringColor: 'ring-emerald-400/60',label: 'Speaking…' },
  error:     { color: 'from-red-500 to-rose-600',       ringColor: 'ring-red-400/60',    label: 'Error – tap to retry' },
};

function timeAgo(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export const VoiceAssistant: React.FC = () => {
  const { language, speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const { currentUser } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [statusLabel, setStatusLabel] = useState('');
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Alt+V
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript]);

  const getLangCode = () => {
    if (language === 'hi') return 'hi-IN';
    if (language === 'ta') return 'ta-IN';
    if (language === 'es') return 'es-ES';
    return 'en-US';
  };

  const sendToAI = useCallback(async (userText: string) => {
    setAssistantState('thinking');
    setStatusLabel('Contacting AI…');

    try {
      const res = await fetch('/api/ask/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          language,
          history: transcript.slice(-6).map(l => ({ role: l.role, content: l.text })),
        }),
      });

      const data = await res.json();
      const reply: string = data.reply || data.response || data.answer || 'I could not find a verified answer. Please check the Ask module.';

      // Trim reply for speech (remove markdown)
      const spokenReply = reply.replace(/\*\*/g, '').replace(/#+\s/g, '').replace(/\n/g, '. ').slice(0, 600);

      setTranscript(prev => [...prev, { role: 'assistant', text: reply }]);
      setAssistantState('speaking');
      setStatusLabel('Speaking…');

      speakText(spokenReply, getLangCode());
    } catch {
      const errMsg = 'Sorry, I could not reach the server. Please try again.';
      setTranscript(prev => [...prev, { role: 'assistant', text: errMsg }]);
      setAssistantState('error');
      speakText(errMsg, getLangCode());
    }
  }, [currentUser, language, transcript, speakText]);

  useEffect(() => {
    if (!isSpeaking && assistantState === 'speaking') {
      setAssistantState('idle');
      setStatusLabel('');
    }
  }, [isSpeaking, assistantState]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(prev => [...prev, { role: 'assistant', text: '⚠️ Your browser does not support voice input. Please use Chrome or Edge.' }]);
      setAssistantState('error');
      return;
    }

    if (isSpeaking) stopSpeaking();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = getLangCode();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setAssistantState('listening');
      setStatusLabel('Listening… speak now');
    };

    recognition.onresult = (event: any) => {
      const text: string = event.results[0][0].transcript;
      setTranscript(prev => [...prev, { role: 'user', text }]);
      sendToAI(text);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setAssistantState('idle');
        setStatusLabel('No speech detected. Tap mic to try again.');
      } else {
        setAssistantState('error');
        setStatusLabel(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (assistantState === 'listening') setAssistantState('idle');
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setAssistantState('idle');
    setStatusLabel('');
  };

  const handleMicClick = () => {
    if (assistantState === 'listening') {
      stopListening();
    } else if (assistantState === 'thinking' || assistantState === 'speaking') {
      stopSpeaking();
      stopListening();
      setAssistantState('idle');
    } else {
      startListening();
    }
  };

  const cfg = stateConfig[assistantState];
  const isActive = assistantState !== 'idle' && assistantState !== 'error';

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-[9998] w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-400/20 flex flex-col overflow-hidden"
          style={{ maxHeight: 'min(520px, 80vh)' }}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${cfg.color} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2 text-white">
              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={15} />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">AI Voice Assistant</p>
                <p className="text-3xs text-white/80 leading-tight">
                  {statusLabel || (language === 'ta' ? 'கேம்பஸ் AI உதவியாளர்' : 'Smart Campus AI')}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                stopListening();
                stopSpeaking();
              }}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close voice assistant"
            >
              <X size={16} />
            </button>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50" style={{ minHeight: '160px' }}>
            {transcript.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${cfg.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Sparkles size={22} className="text-white" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Tap the mic and ask anything!</p>
                <p className="text-xs text-slate-400 mt-1">Try: "What is the exam schedule?" or "Show events this week"</p>
                {language === 'ta' && (
                  <p className="text-xs text-indigo-500 mt-1">தமிழிலும் பேசலாம்!</p>
                )}
                <p className="text-3xs text-slate-300 mt-3">Keyboard shortcut: <kbd className="bg-slate-100 px-1 rounded text-slate-500">Alt + V</kbd></p>
              </div>
            )}
            {transcript.map((line, i) => (
              <div key={i} className={`flex ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    line.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-xs'
                  }`}
                >
                  {line.text}
                </div>
              </div>
            ))}
            {assistantState === 'thinking' && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-sm shadow-xs flex items-center gap-1.5">
                  <Loader2 size={12} className="text-amber-500 animate-spin" />
                  <span className="text-xs text-slate-400">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex-1">
              {assistantState === 'listening' && (
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  Listening…
                </span>
              )}
              {assistantState === 'speaking' && (
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Volume2 size={12} />
                  Speaking…
                </span>
              )}
              {(assistantState === 'idle' || assistantState === 'error') && (
                <span className="text-slate-400">
                  {transcript.length > 0 ? 'Tap mic to continue' : 'Tap mic to start'}
                </span>
              )}
            </div>

            {/* Stop speech button */}
            {isSpeaking && (
              <button
                onClick={() => { stopSpeaking(); setAssistantState('idle'); }}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                aria-label="Stop speaking"
              >
                <VolumeX size={14} />
              </button>
            )}

            {/* Clear */}
            {transcript.length > 0 && (
              <button
                onClick={() => setTranscript([])}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2"
              >
                Clear
              </button>
            )}

            {/* Main Mic Button */}
            <button
              onClick={handleMicClick}
              aria-label={assistantState === 'listening' ? 'Stop listening' : 'Start voice assistant'}
              className={`
                relative h-11 w-11 rounded-full bg-gradient-to-br ${cfg.color}
                text-white shadow-lg flex items-center justify-center
                transition-all duration-200 hover:scale-105 active:scale-95
                ${isActive ? `ring-4 ${cfg.ringColor}` : ''}
              `}
            >
              {assistantState === 'listening' ? (
                <MicOff size={18} />
              ) : assistantState === 'thinking' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Mic size={18} />
              )}
              {assistantState === 'listening' && (
                <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/40" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(prev => {
            if (prev) { stopListening(); stopSpeaking(); }
            return !prev;
          });
        }}
        aria-label="Toggle AI Voice Assistant (Alt+V)"
        title="AI Voice Assistant (Alt+V)"
        className={`
          fixed bottom-5 right-5 z-[9997]
          h-14 w-14 rounded-full
          bg-gradient-to-br ${cfg.color}
          text-white shadow-xl shadow-indigo-500/30
          flex items-center justify-center
          transition-all duration-200 hover:scale-110 active:scale-95
          ${isActive ? `ring-4 ${cfg.ringColor}` : ''}
        `}
      >
        {isOpen ? (
          <X size={22} />
        ) : assistantState === 'listening' ? (
          <MicOff size={22} />
        ) : (
          <Mic size={22} />
        )}
        {assistantState === 'listening' && (
          <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/30" />
        )}
        {/* Unread badge if assistant has spoken */}
        {!isOpen && isSpeaking && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  );
};
