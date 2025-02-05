import React, { useState } from 'react';

const AiChat = () => {
  const [messages, setMessages] = useState<Array<{
    text: string;
    sender: 'user' | 'ai';
  }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    setInputMessage('');
    setIsLoading(true);
 
    try {
      const response = await fetch('http://localhost:3000/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let hasAddedAiMessage = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'context') {
                console.log('Context:', data.content);
              } else if (data.type === 'token') {
                content += data.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  
                  if (!hasAddedAiMessage) {
                    hasAddedAiMessage = true;
                    return [...newMessages, { text: content, sender: 'ai' }];
                  } else {
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage?.sender === 'ai') {
                      lastMessage.text = content;
                    }
                    return [...newMessages];
                  }
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: error instanceof Error ? error.message : 'Xin lỗi, đã có lỗi xảy ra.',
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Chat header */}
      <div className="px-6 py-4 bg-secondary text-white rounded-t-lg">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin hover:scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-secondary text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input container */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }
            }}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat; 