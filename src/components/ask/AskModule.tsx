import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ChatMessage, HelpdeskTicket, KBDocument } from '../../types';
import {
  MessageSquareCode,
  Send,
  Mic,
  MicOff,
  Volume2,
  FileCheck2,
  AlertTriangle,
  LifeBuoy,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  X,
  Ticket,
  Zap,
} from 'lucide-react';

export const AskModule: React.FC = () => {
  const { t, language, announce, speakText } = useAccessibility();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Hello ${currentUser.name}! I am your official Smart Campus Assistant. All my responses are strictly grounded in verified university documents and policies. I cite source documents directly and never guess. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 100,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Tickets & Fallback state
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketQuery, setTicketQuery] = useState('');
  const [ticketDepartment, setTicketDepartment] = useState('Academic Registrar');
  const [userTickets, setUserTickets] = useState<HelpdeskTicket[]>([]);
  const [isViewingTickets, setIsViewingTickets] = useState(false);

  // Knowledge base document drawer for browsing
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load KB documents & user tickets
  useEffect(() => {
    fetch('/api/ask/knowledge-base')
      .then(res => res.json())
      .then(data => setKbDocs(data || []))
      .catch(err => console.error('Failed to load KB docs:', err));

    fetch('/api/ask/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserTickets(data.filter(t => t.userId === currentUser.id || currentUser.role === 'admin'));
        }
      })
      .catch(err => console.error('Failed to load tickets:', err));
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Speech Recognition (Voice Input)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.warning('Browser Not Supported', 'Speech recognition is not supported. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : language === 'ta' ? 'ta-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        announce('Listening for your query...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        announce(`Voice input captured: ${transcript}`);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice recognition initialization error:', err);
      setIsListening(false);
    }
  };

  // Send Chat Query to RAG Engine with Real-Time Streaming & Ultra-Fast Response
  const handleSendMessage = async (queryText = inputText) => {
    const textToSend = queryText.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const botMsgId = `msg_bot_${Date.now()}`;
    const botPlaceholder: ChatMessage = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 100,
      isStreaming: true,
      model: 'gemini-3.6-flash',
    };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    setInputText('');
    setIsSending(true);
    announce(`Query submitted: ${textToSend}`);

    try {
      // 1. Attempt ultra-fast SSE streaming response first
      const res = await fetch('/api/ask/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming connection unavailable');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.replace('event:', '').trim();
          } else if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace('data:', '').trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (currentEvent === 'meta') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === botMsgId
                      ? {
                          ...m,
                          confidence: parsed.confidence,
                          lowConfidence: parsed.lowConfidence,
                          sources: parsed.sources || [],
                          model: parsed.model || 'gemini-3.6-flash',
                        }
                      : m
                  )
                );
                if (parsed.lowConfidence) {
                  setTicketQuery(textToSend);
                }
              } else if (currentEvent === 'chunk') {
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === botMsgId
                        ? { ...m, text: accumulatedText }
                        : m
                    )
                  );
                }
              } else if (currentEvent === 'done') {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === botMsgId
                      ? {
                          ...m,
                          isStreaming: false,
                          latencyMs: parsed.latencyMs,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Ignore malformed intermediate chunks
            }
          }
        }
      }

      setMessages(prev =>
        prev.map(m => (m.id === botMsgId ? { ...m, isStreaming: false } : m))
      );
      announce('Assistant response received.');
    } catch (streamErr) {
      console.warn('Streaming failed or was interrupted, executing fast direct fetch:', streamErr);

      // Fast synchronous fallback
      try {
        const res = await fetch('/api/ask/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            language,
          }),
        });

        const data = await res.json();
        setMessages(prev =>
          prev.map(m =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: data.text || 'No response available.',
                  confidence: data.confidence,
                  sources: data.sources || [],
                  lowConfidence: data.lowConfidence,
                  latencyMs: data.latencyMs,
                  model: data.model || 'gemini-3.6-flash',
                  isStreaming: false,
                }
              : m
          )
        );

        if (data.lowConfidence) {
          setTicketQuery(textToSend);
        }
      } catch (err) {
        console.error('Chat error:', err);
        setMessages(prev =>
          prev.map(m =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: 'A temporary network anomaly occurred. In accordance with policy, I will not generate unverified information.',
                  confidence: 0,
                  lowConfidence: true,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  // Create Helpdesk Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;

    try {
      const res = await fetch('/api/ask/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          userRole: currentUser.role,
          query: ticketQuery,
          department: ticketDepartment,
          priority: 'medium',
        }),
      });

      const newTicket: HelpdeskTicket = await res.json();
      setUserTickets(prev => [newTicket, ...prev]);
      setIsTicketModalOpen(false);
      setTicketQuery('');
      announce(`Helpdesk ticket ${newTicket.id} created successfully.`);
      toast.success('Ticket Submitted!', `Ticket #${newTicket.id} sent to ${newTicket.department}.`);

      // Add system confirmation message to chat
      const confirmMsg: ChatMessage = {
        id: `msg_ticket_confirm_${Date.now()}`,
        sender: 'bot',
        text: `Official Ticket #${newTicket.id} has been submitted to the ${newTicket.department}. A campus officer will review your query and reply to ${currentUser.email}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 100,
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      toast.error('Ticket Failed', 'Could not submit your ticket. Please try again.');
    }
  };

  const sampleQuestions = [
    'What is the Fall 2026 midterm exam schedule?',
    'What is the minimum attendance requirement to take semester exams?',
    'What are the weekend reading hours for Tagore Central Library?',
    'What are the hostel quiet hours and visitor guidelines?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquareCode className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {t.modules.ask.title}
            </h1>
            <span className="rounded-full bg-indigo-100 text-indigo-800 text-3xs font-bold px-2.5 py-0.5 border border-indigo-200">
              Zero Hallucination
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.modules.ask.subtitle}
          </p>
        </div>

        {/* Action Controls: Tickets & Verified Docs */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-view-tickets"
            type="button"
            onClick={() => setIsViewingTickets(!isViewingTickets)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
          >
            <Ticket className="h-4 w-4 text-indigo-600" />
            <span>My Helpdesk Tickets ({userTickets.length})</span>
          </button>
          <button
            id="btn-open-ticket-modal"
            type="button"
            onClick={() => {
              setTicketQuery('');
              setIsTicketModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-2xs"
          >
            <LifeBuoy className="h-4 w-4" />
            <span>{t.modules.ask.createTicket}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Workspace & Verified Documents Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Window (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-white border border-slate-200 shadow-md h-[600px] overflow-hidden">
          {/* Top Chat Subheader */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 bg-slate-50/80 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                Institutional Knowledge Base RAG
              </span>
              <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 text-amber-800 px-2 py-0.5 text-3xs font-bold border border-amber-200">
                <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>Fast Gemini Flash Active</span>
              </span>
            </div>
            <div className="text-3xs text-slate-500 font-medium">
              Grounding: 7 Verified University Circulars
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-blue-700 text-white rounded-tr-xs'
                        : 'bg-slate-100/90 text-slate-900 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {/* Bot Message Header & Confidence */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2 gap-2 flex-wrap">
                        <div className="flex items-center space-x-1.5 font-bold text-indigo-700">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Smart Campus AI</span>
                          {msg.latencyMs !== undefined && (
                            <span className="inline-flex items-center space-x-0.5 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-3xs font-semibold border border-emerald-200">
                              <Zap className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                              <span>{(msg.latencyMs / 1000).toFixed(1)}s reply</span>
                            </span>
                          )}
                          {msg.isStreaming && (
                            <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-3xs font-medium border border-indigo-200 animate-pulse">
                              <Zap className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                              <span>Streaming live...</span>
                            </span>
                          )}
                        </div>
                        {msg.confidence !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-bold ${
                              msg.confidence >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {msg.confidence}% Verified
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="whitespace-pre-line">
                      {msg.text ? (
                        <>
                          {msg.text}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-600 animate-pulse align-middle" />
                          )}
                        </>
                      ) : msg.isStreaming ? (
                        <div className="flex items-center space-x-2 text-xs text-indigo-700 py-1">
                          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                          <span className="font-medium">Connecting to Fast Gemini Flash engine...</span>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Verified Source Documents Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                        <div className="text-3xs uppercase tracking-wider font-bold text-slate-500 flex items-center space-x-1">
                          <FileCheck2 className="h-3 w-3 text-emerald-600" />
                          <span>{t.modules.ask.sourceDocument}:</span>
                        </div>
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-white p-2 border border-slate-200 text-3xs text-slate-700 space-y-0.5"
                          >
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                              <span>"{src.documentTitle}"</span>
                              <span className="text-slate-400 font-normal">Verified: {src.verifiedBy}</span>
                            </div>
                            <p className="text-slate-500 italic">"{src.excerpt}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Low Confidence Guardrail Card */}
                    {msg.lowConfidence && (
                      <div className="mt-3 rounded-xl bg-amber-50 p-3 border border-amber-200 text-amber-900 space-y-2">
                        <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>Official Policy: Zero Speculation Guardrail</span>
                        </div>
                        <p className="text-3xs text-amber-800/90 leading-relaxed">
                          This query is not covered in current verified institutional documents. Would you like to escalate this inquiry to a human administrative officer?
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setTicketQuery(messages[messages.length - 2]?.text || '');
                            setIsTicketModalOpen(true);
                          }}
                          className="w-full rounded-lg bg-amber-600 py-1.5 px-3 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <LifeBuoy className="h-3.5 w-3.5" />
                          <span>Open Verified Helpdesk Ticket</span>
                        </button>
                      </div>
                    )}

                    {/* Audio read-aloud button */}
                    {!isUser && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded-sm"
                          aria-label="Read answer aloud"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-3xs text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}

            {isSending && (!messages.length || !messages[messages.length - 1].isStreaming) && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl max-w-xs border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Searching verified institutional documents...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Suggested:
            </span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-3xs font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-700 whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              {/* Microphone Voice Dictation */}
              <button
                id="btn-voice-dictation"
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                aria-label={isListening ? 'Stop voice recording' : 'Start voice input'}
                title="Dictate query via voice"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <label htmlFor="input-chat-query" className="sr-only">
                {t.modules.ask.inputPlaceholder}
              </label>
              <input
                id="input-chat-query"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={isListening ? 'Listening...' : t.modules.ask.inputPlaceholder}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
              />

              <button
                id="btn-submit-chat-query"
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-xs"
                aria-label={t.modules.ask.askButton}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Verified Documents & Helpdesk Tickets (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* User Tickets Drawer */}
          {isViewingTickets && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <Ticket className="h-4 w-4 text-indigo-600" />
                  <span>My Helpdesk Tickets</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsViewingTickets(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs"
                >
                  Hide
                </button>
              </div>

              {userTickets.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No active tickets filed.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userTickets.map(tkt => (
                    <div key={tkt.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">#{tkt.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-bold uppercase ${
                          tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tkt.status}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium line-clamp-2">"{tkt.query}"</p>
                      <div className="text-3xs text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span>{tkt.department}</span>
                        <span>{tkt.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verified Knowledge Base Explorer */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>Verified Institutional Circulars</span>
              </h3>
              <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Official policies verified by institutional authorities powering the RAG chatbot:
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {kbDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{doc.title}</span>
                    <span className="text-3xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md">
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-3xs text-slate-500 line-clamp-2">{doc.summary}</p>
                  <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
                    <span>By: {doc.verifiedBy}</span>
                    <span>Updated: {doc.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Detail Preview Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <FileCheck2 className="h-4 w-4" />
              <span>Verified Institutional Regulation</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{selectedDoc.title}</h2>
            <div className="text-xs text-slate-500 flex items-center space-x-3 my-2 pb-2 border-b border-slate-100">
              <span>Authority: {selectedDoc.verifiedBy}</span>
              <span>•</span>
              <span>Category: {selectedDoc.category}</span>
              <span>•</span>
              <span>Last Verified: {selectedDoc.lastUpdated}</span>
            </div>
            <div className="mt-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedDoc.content}
            </div>
          </div>
        </div>
      )}

      {/* Create Helpdesk Ticket Modal */}
      {isTicketModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsTicketModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Helpdesk Ticket</h3>
                <p className="text-xs text-slate-500">
                  Escalate unanswered or specialized inquiries directly to campus staff
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
                <select
                  value={ticketDepartment}
                  onChange={e => setTicketDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="Academic Registrar">Academic Registrar & Examinations</option>
                  <option value="Student Welfare Office">Student Welfare Office</option>
                  <option value="Tagore Central Library">Tagore Central Library Staff</option>
                  <option value="Campus Estate & Facilities">Campus Estate & Facilities Management</option>
                  <option value="Hostel Administration">Hostel & Housing Administration</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Inquiry / Description</label>
                <textarea
                  rows={4}
                  required
                  value={ticketQuery}
                  onChange={e => setTicketQuery(e.target.value)}
                  placeholder="Describe your inquiry or question in detail..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-3xs text-blue-900 leading-relaxed">
                Ticket updates and staff responses will be delivered to: <strong>{currentUser.email}</strong>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Submit Official Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
