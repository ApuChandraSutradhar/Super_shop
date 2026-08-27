import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = "http://127.0.0.1:8000/api/chat/assistant";
const CATALOG_PATHS = new Set(["/", "/shop", "/offers", "/coupons"]);

export default function AIChatbot() {
  const location = useLocation();
  const { isCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I can help with products, prices, stock, categories, and current offers.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const historyRef = useRef(null);

  const isVisible = CATALOG_PATHS.has(location.pathname) && !isCartOpen;

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isVisible) {
    return null;
  }

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", text: trimmedMessage },
    ]);
    setMessage("");
    setIsTyping(true);

    try {
      const { data } = await axios.post(API_URL, { message: trimmedMessage });
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", text: data.reply },
      ]);
    } catch (error) {
      const fallback = error.response?.data?.reply || error.response?.data?.message || "I couldn't reach the assistant right now. Please try again.";
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: "assistant", text: fallback },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {isOpen && (
        <section className="mb-4 flex h-[min(32rem,70vh)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-[#064e3b] px-4 py-3 text-white">
            <div>
              <h2 className="font-bold">SuperShop AI Assistant</h2>
              <p className="text-xs text-emerald-100">Live catalog support</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-white/15" aria-label="Close assistant">
              <FiX size={20} />
            </button>
          </header>

          <div ref={historyRef} className="flex-1 space-y-3 overflow-y-auto bg-emerald-50/40 p-4">
            {messages.map((chatMessage, index) => (
              <div key={`${chatMessage.role}-${index}`} className={`flex ${chatMessage.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${chatMessage.role === "user" ? "bg-[#064e3b] text-white" : "bg-white text-gray-700 shadow-sm"}`}>
                  {chatMessage.text}
                </p>
              </div>
            ))}
            {isTyping && <p className="text-sm italic text-gray-500">AI is typing...</p>}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-100 p-3">
            <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Ask about products or offers..." className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#064e3b]" aria-label="Message the assistant" />
            <button type="submit" disabled={!message.trim() || isTyping} className="rounded-xl bg-[#064e3b] px-3 text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message">
              <FiSend />
            </button>
          </form>
        </section>
      )}

      <button onClick={() => setIsOpen((open) => !open)} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#064e3b] text-white shadow-lg transition hover:scale-105 hover:bg-emerald-900" aria-label={isOpen ? "Close SuperShop AI Assistant" : "Open SuperShop AI Assistant"}>
        {isOpen ? <FiX size={25} /> : <FiMessageCircle size={26} />}
      </button>
    </div>
  );
}
