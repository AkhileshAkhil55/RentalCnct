import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Send, MessageSquare, ArrowLeft, ArrowUpRight, ShieldAlert } from 'lucide-react';

const ChatWindow = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const messageEndRef = useRef();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const fetchChats = async (selectId = null) => {
    try {
      const res = await api.get('/api/chats');
      setChats(res.data);
      
      // Auto select a chat if requested
      if (selectId) {
        const found = res.data.find(c => c.id === selectId);
        if (found) {
          setSelectedChat(found);
          fetchMessages(found.id);
        }
      } else if (res.data.length > 0 && !selectedChat) {
        // select first chat by default if none selected
        setSelectedChat(res.data[0]);
        fetchMessages(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load chat conversations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoadingMsgs(true);
    try {
      const res = await api.get(`/api/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if redirect state requested specific chat
    const targetChatId = location.state?.activeChatId;
    fetchChats(targetChatId);
    
    // Poll for new messages every 8 seconds
    const interval = setInterval(() => {
      if (selectedChat) {
        fetchMessages(selectedChat.id);
      }
      // Refresh chats list too
      api.get('/api/chats').then(res => setChats(res.data)).catch(console.error);
    }, 8000);

    return () => clearInterval(interval);
  }, [user, selectedChat?.id]);

  useEffect(() => {
    // Scroll messages list to bottom
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedChat) return;

    const messageContent = text.trim();
    setText(''); // clear input immediately for snappy UX

    // optimistic update local UI
    const tempMsg = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.fullName,
      messageText: messageContent,
      sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.post(`/api/chats/${selectedChat.id}/messages`, {
        messageText: messageContent
      });
      
      // reload message history
      fetchMessages(selectedChat.id);
    } catch (err) {
      showToast('Failed to deliver message.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500">Loading your inbox...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left h-[80vh] flex flex-col">
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/30 overflow-hidden shadow-glass backdrop-blur-md">
        
        {/* Left sidebar: conversations list */}
        <div className={`md:col-span-4 border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col h-full ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Conversations</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Inbox messages from gear owners</p>
          </div>
          
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 no-scrollbar">
            {chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2 mt-10">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No conversations found.</p>
                <p className="text-[10px]">Start chats on details pages of rental items.</p>
              </div>
            ) : (
              chats.map((c) => {
                const isSeller = c.sellerId === user.id;
                const otherPartyName = isSeller ? c.buyerName : c.sellerName;
                const active = selectedChat?.id === c.id;
                
                return (
                  <div 
                    key={c.id}
                    onClick={() => handleSelectChat(c)}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors text-left hover:bg-slate-50/50 dark:hover:bg-slate-850/10 ${active ? 'bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-primary-500' : ''}`}
                  >
                    <img 
                      src={c.firstImageUrl} 
                      alt="product" 
                      className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/30"
                    />
                    <div className="flex-grow overflow-hidden text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-950 dark:text-white truncate max-w-[120px]">
                          {otherPartyName}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(c.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-medium text-primary-600 dark:text-cyan-400 mt-0.5 truncate">{c.productTitle}</p>
                      <p className="text-slate-400 mt-1 truncate line-clamp-1">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right sidebar: message logs */}
        <div className={`md:col-span-8 flex flex-col h-full bg-white/20 dark:bg-slate-950/10 ${!selectedChat ? 'hidden md:flex justify-center items-center' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                      {selectedChat.sellerId === user.id ? selectedChat.buyerName : selectedChat.sellerName}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rental Listing Negotiation</p>
                  </div>
                </div>

                <Link 
                  to={`/product/${selectedChat.productId}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  View Product <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Product Context Floating Bar */}
              <div className="px-4 py-2 bg-blue-50/30 dark:bg-blue-950/10 border-b border-blue-100/10 flex justify-between items-center text-[11px] text-slate-500">
                <span className="font-semibold truncate max-w-[70%]">🏷️ Item: {selectedChat.productTitle}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">P2P Escrow Protection active</span>
              </div>

              {/* Message History Bubble Feed */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
                {messages.map((msg) => {
                  const mine = msg.senderId === user.id;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-3.5 rounded-3xl text-xs relative ${mine ? 'bg-primary-600 text-white rounded-br-none shadow-sm' : 'bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/30 dark:border-slate-800/30'}`}>
                        {!mine && (
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
                            {msg.senderName}
                          </span>
                        )}
                        <p className="leading-relaxed break-words text-left">{msg.messageText}</p>
                        <span className={`block text-[8px] text-right mt-1.5 opacity-60 ${mine ? 'text-white' : 'text-slate-400'}`}>
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              {/* Message input bar */}
              <form 
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2"
              >
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 text-xs rounded-2xl glass-input border border-slate-350 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Select a Conversation</h3>
              <p className="max-w-xs mx-auto">Choose a seller from the left conversation threads to manage handovers or negotiate prices.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ChatWindow;
