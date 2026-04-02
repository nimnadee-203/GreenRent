import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft, SendHorizontal, UserRound, Megaphone, X, Search } from "lucide-react";
import Navbar from "../../components/Home/Navbar";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - d) / (1000 * 60 * 60);
  
  if (diffInHours < 24 && now.getDate() === d.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffInHours < 48) {
    return "Yesterday";
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatPage() {
  const { backendUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastError, setBroadcastError] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  const canUseChat = backendUser?.role === "admin" || backendUser?.role === "seller";

  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/chat/contacts`, {
        withCredentials: true,
      });
      const nextContacts = Array.isArray(response.data?.contacts) ? response.data.contacts : [];
      setContacts(nextContacts);
      setSelectedContactId((previousId) => {
        if (previousId && nextContacts.some((contact) => contact.id === previousId)) return previousId;
        return nextContacts[0]?.id || "";
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load chat contacts.");
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    if (!contactId) {
      setMessages([]);
      return;
    }

    try {
      setMessagesLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/api/chat/messages`, {
        params: { contactId },
        withCredentials: true,
      });
      setMessages(Array.isArray(response.data?.messages) ? response.data.messages : []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load chat messages.");
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (!canUseChat) return;
    fetchContacts();
    const timer = setInterval(fetchContacts, 12000);
    return () => clearInterval(timer);
  }, [canUseChat]);

  useEffect(() => {
    if (!canUseChat || !selectedContactId) {
      setMessages([]);
      return;
    }

    fetchMessages(selectedContactId);
    const timer = setInterval(() => fetchMessages(selectedContactId), 6000);
    return () => clearInterval(timer);
  }, [canUseChat, selectedContactId]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setError("");
      await axios.post(
        `${API_BASE_URL}/api/chat/messages`,
        { recipientId: selectedContactId, text: trimmed },
        { withCredentials: true }
      );
      setText("");
      await fetchMessages(selectedContactId);
      await fetchContacts();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async (event) => {
    event.preventDefault();
    const trimmed = broadcastText.trim();
    if (!trimmed || broadcasting) return;

    try {
      setBroadcasting(true);
      setBroadcastError("");
      setBroadcastSuccess("");
      await axios.post(
        `${API_BASE_URL}/api/chat/broadcast`,
        { text: trimmed },
        { withCredentials: true }
      );
      setBroadcastSuccess("Broadcast sent successfully to all landlords.");
      setBroadcastText("");
      await fetchContacts();
      setTimeout(() => {
        setBroadcastModalOpen(false);
        setBroadcastSuccess("");
      }, 2000);
    } catch (err) {
      setBroadcastError(err?.response?.data?.message || "Failed to send broadcast message.");
    } finally {
      setBroadcasting(false);
    }
  };

  const roleLabel = useMemo(() => {
    if (backendUser?.role === "admin") return "Admin";
    if (backendUser?.role === "seller") return "Landlord";
    return "User";
  }, [backendUser?.role]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const lowerQuery = searchQuery.toLowerCase();
    return contacts.filter(contact => contact.name.toLowerCase().includes(lowerQuery));
  }, [contacts, searchQuery]);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact.id === selectedContactId) || null,
    [contacts, selectedContactId]
  );

  if (!canUseChat) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-xl font-bold">Chat access denied</h1>
            <p className="mt-2 text-sm">Only admins and landlords can use this chat.</p>
            <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold border border-red-200 hover:bg-red-100">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Admin • Landlord Chat</h1>
            <p className="text-slate-600 mt-1 text-sm">Use this space for moderation and listing communication.</p>
          </div>
          <div className="flex items-center flex-wrap justify-end gap-2">
            {backendUser?.role === "admin" && (
              <>
                <button
                  onClick={() => setBroadcastModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 mr-2"
                >
                  <Megaphone className="w-4 h-4" /> Message All Landlords
                </button>
                <Link to="/admin/listings" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Listings View
                </Link>
                <Link to="/admin/reviews" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                  Review Management
                </Link>
              </>
            )}
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[600px] h-[calc(100vh-250px)] max-h-[800px]">
            {/* Sidebar */}
            <aside className="border-r border-slate-200 bg-white flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Messages</h2>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow transition-colors"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {contactsLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                    <p className="text-xs font-medium">Loading contacts...</p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center h-40">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <UserRound className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">No contacts found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? "Try a different search term" : "When users join, they will appear here."}
                    </p>
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const active = selectedContactId === contact.id;
                    const initial = getInitials(contact.name);
                    const timeAgo = getRelativeTime(contact.lastMessageAt);
                    
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => {
                          setSelectedContactId(contact.id);
                          setSearchQuery("");
                        }}
                        className={`w-full flex items-center gap-3 text-left rounded-xl px-3 py-3 transition-colors ${
                          active 
                            ? "bg-emerald-50" 
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${
                          active 
                            ? "bg-emerald-600 text-white border-emerald-700" 
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {initial}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm font-bold truncate ${active ? "text-slate-900" : "text-slate-800"}`}>
                              {contact.name || "Anonymous"}
                            </p>
                            {timeAgo && (
                              <p className={`text-[10px] font-medium whitespace-nowrap ml-2 ${active ? "text-emerald-700" : "text-slate-400"}`}>
                                {timeAgo}
                              </p>
                            )}
                          </div>
                          <p className={`text-xs truncate ${active ? "text-emerald-800 font-medium" : "text-slate-500"}`}>
                            {contact.lastMessage ? contact.lastMessage : (
                              <span className="italic opacity-80 mt-0.5 inline-block">
                                {backendUser?.role === "admin" ? "No messages yet" : "Start the conversation"}
                              </span>
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Chat Area */}
            <section className="flex flex-col bg-slate-50/30">
              {/* Chat Header */}
              <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                {selectedContact ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-sm border border-emerald-600/20">
                      {getInitials(selectedContact.name)}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900 tracking-tight">{selectedContact.name}</p>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                        {selectedContact.role === "admin" ? "Admin Support" : "Landlord Account"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserRound className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Select a Conversation</p>
                      <p className="text-xs text-slate-500">Pick a contact from the sidebar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
                {!selectedContactId ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                      <SendHorizontal className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">Your Messages</p>
                    <p className="text-sm mt-1 max-w-sm">
                      Select a conversation off the left panel, or start a new thread by searching.
                    </p>
                  </div>
                ) : messagesLoading && messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                      <SendHorizontal className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Say Hello!</p>
                    <p className="text-xs text-slate-500 mt-1">Start the conversation below.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center my-4 opacity-50">
                       <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/60 text-slate-500 px-3 py-1 rounded-full">
                         Beginning of chat history
                       </span>
                    </div>
                    {messages.map((message, i) => {
                      const mine = String(message.senderId) === String(backendUser?.id || backendUser?._id || "");
                      
                      return (
                        <div key={message._id} className={`flex flex-col ${mine ? "items-end" : "items-start"} fade-in`}>
                          <div 
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
                              mine 
                                ? "bg-emerald-600 text-white rounded-br-sm shadow-emerald-600/10" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-slate-200/50"
                            }`}
                          >
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 mt-1 mx-1 flex items-center gap-1">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Area */}
              <div className="border-t border-slate-200 bg-white p-4">
                <form onSubmit={(e) => { sendMessage(e); setTimeout(scrollToBottom, 50); }} className="relative flex items-center">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <UserRound className="w-5 h-5 text-slate-300" />
                  </div>
                  <input
                    type="text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={selectedContact ? `Message ${selectedContact.name}...` : "Select a contact first"}
                    className="w-full pl-11 pr-14 py-3.5 bg-slate-100 hover:bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-500 rounded-full text-sm transition-colors text-slate-800 placeholder-slate-400 font-medium"
                    maxLength={1000}
                    disabled={!selectedContactId}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!selectedContactId || sending || !text.trim()}
                    className="absolute right-2 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-transform active:scale-95 disabled:opacity-0 disabled:scale-75 shadow-sm flex items-center justify-center transform group"
                  >
                    <SendHorizontal className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
      </main>
    </div>

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex border-b border-slate-200 px-6 py-4 justify-between items-center bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                Notify All Landlords
              </h3>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBroadcast} className="p-6">
              {broadcastError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{broadcastError}</div>}
              {broadcastSuccess && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{broadcastSuccess}</div>}

              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Broadcast Message
                </label>
                <textarea
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-32"
                  placeholder="Type a message that will be sent individually to every landlord's direct chat..."
                  maxLength={1000}
                  required
                />
                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                  <span>This text will appear as a normal message in each landlord's inbox.</span>
                  <span>{broadcastText.length}/1000</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                  disabled={broadcasting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting || !broadcastText.trim()}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
                >
                  {broadcasting ? "Sending..." : <><SendHorizontal className="w-4 h-4" /> Send Broadcast</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
