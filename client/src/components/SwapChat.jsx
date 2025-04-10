import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function SwapChat({ swapId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch messages on component mount
    useEffect(() => {
        fetchMessages();
    }, [swapId]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/api/swaps/${swapId}/messages`,
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );

            if (response.data.success) {
                setMessages(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/swaps/${swapId}/messages`,
                { content: newMessage },
                { headers: { 'x-auth-token': localStorage.getItem('token') } }
            );

            if (response.data.success) {
                setMessages([...messages, response.data.data]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message');
        }
    };

    return (
        <div className="mt-4 border rounded-lg">
            <h3 className="font-medium p-3 border-b">Chat</h3>
            <div className="h-48 overflow-y-auto p-4 space-y-2">
                {loading ? (
                    <p className="text-center text-gray-500">Loading messages...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((message) => (
                        <div key={message._id} className="flex items-start space-x-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                    src={message.sender?.profileImage || "/placeholder.svg"}
                                    alt={message.sender?.fullName || "User"}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder.svg?height=40&width=40";
                                    }}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{message.sender?.fullName || "Unknown User"}</p>
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={sendMessage} className="border-t p-2 flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-1 border rounded-l focus:outline-none"
                />
                <button
                    type="submit"
                    className="px-4 py-1 bg-black text-white rounded-r"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}