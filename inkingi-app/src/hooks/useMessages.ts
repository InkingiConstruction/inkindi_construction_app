import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'm1', sender: 'Eric (Engineer)', text: 'Hello! Foundation concrete has fully cured. Ready for framing.',     time: '10:15 AM' },
  { id: 'm2', sender: 'You',             text: 'Great. Let me review the inspection report in the portal.',           time: '10:20 AM' },
  { id: 'm3', sender: 'Aline (Supervisor)', text: 'Inspection verified! Rebar & concrete depth meet IER specs.',    time: '11:05 AM' },
  { id: 'm4', sender: 'You',             text: 'Excellent — releasing foundation escrow funds now.',                  time: '11:30 AM' },
];

export function useMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const sendMessage = useCallback((text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: `m-${Date.now()}`, sender: 'You', text, time: now }]);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `m-${Date.now() + 1}`,
        sender: 'Eric (Engineer)',
        text: 'Received! Construction is on track. Will update tonight.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1200);
  }, []);

  return {
    messages,
    sendMessage,
  };
}
