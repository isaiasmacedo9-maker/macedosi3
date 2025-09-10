import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Users,
  Settings,
  X,
  User,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Hash
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // New chat form
  const [newChatData, setNewChatData] = useState({
    nome: '',
    descricao: '',
    tipo: 'grupo',
    participantes: []
  });

  const tipoOptions = ['grupo', 'privado', 'suporte'];

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/chat/`);
      setChats(response.data);
      if (response.data.length > 0 && !selectedChat) {
        setSelectedChat(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Erro ao carregar chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/${chatId}`);
      setMessages(response.data.mensagens || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await axios.post(`${API_URL}/api/chat/${selectedChat.id}/message`, {
        mensagem: newMessage,
        tipo: 'text'
      });

      // Add message locally for immediate UI update
      const newMsg = {
        id: Date.now().toString(),
        usuario_id: user.id,
        usuario_nome: user.name,
        mensagem: newMessage,
        timestamp: new Date().toISOString(),
        tipo: 'text'
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      // Update chat list with new message
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, updated_at: new Date().toISOString() }
          : chat
      ));

      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/chat/`, newChatData);
      toast.success('Chat criado com sucesso!');
      setShowNewChatModal(false);
      resetNewChatForm();
      fetchChats();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao criar chat';
      toast.error(message);
    }
  };

  const resetNewChatForm = () => {
    setNewChatData({
      nome: '',
      descricao: '',
      tipo: 'grupo',
      participantes: []
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLastMessageTime = (chat) => {
    if (!chat.mensagens || chat.mensagens.length === 0) return '';
    const lastMessage = chat.mensagens[chat.mensagens.length - 1];
    return formatTime(lastMessage.timestamp);
  };

  const getLastMessage = (chat) => {
    if (!chat.mensagens || chat.mensagens.length === 0) return 'Nenhuma mensagem';
    const lastMessage = chat.mensagens[chat.mensagens.length - 1];
    return lastMessage.mensagem.length > 50 
      ? lastMessage.mensagem.substring(0, 50) + '...'
      : lastMessage.mensagem;
  };

  const getChatIcon = (tipo) => {
    switch (tipo) {
      case 'privado':
        return <User className="w-5 h-5" />;
      case 'suporte':
        return <Phone className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'grupo': 'Grupo',
      'privado': 'Privado',
      'suporte': 'Suporte'
    };
    return labels[tipo] || tipo;
  };

  const filteredChats = chats.filter(chat =>
    chat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-transparent">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 glass-intense rounded-l-2xl border-cosmic border-r-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold neon-text flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-red-400" />
              💬 Chat
            </h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
              title="Novo Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-futuristic w-full pl-10 pr-4 py-2 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-gray-300 text-sm">Carregando chats...</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum chat encontrado</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedChat?.id === chat.id
                      ? 'bg-gradient-to-r from-red-600/20 to-red-500/20 border-l-4 border-red-500'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        chat.tipo === 'suporte' 
                          ? 'bg-green-500/20 text-green-400'
                          : chat.tipo === 'privado'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {getChatIcon(chat.tipo)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium truncate">{chat.nome}</h3>
                        <span className="text-xs text-gray-400">{getLastMessageTime(chat)}</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{getLastMessage(chat)}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{getTipoLabel(chat.tipo)}</span>
                        <span className="text-xs text-gray-500">
                          {chat.participantes?.length || 0} participantes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-intense rounded-r-2xl border-cosmic border-l-0 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedChat.tipo === 'suporte' 
                      ? 'bg-green-500/20 text-green-400'
                      : selectedChat.tipo === 'privado'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {getChatIcon(selectedChat.tipo)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedChat.nome}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedChat.participantes?.length || 0} participantes • {getTipoLabel(selectedChat.tipo)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {selectedChat.descricao && (
                <p className="text-sm text-gray-400 mt-2">{selectedChat.descricao}</p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isOwn = message.usuario_id === user.id;
                    const showDate = index === 0 || 
                      formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
                    
                    return (
                      <div key={message.id || index}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                              : 'glass-light text-white'
                          }`}>
                            {!isOwn && (
                              <p className="text-xs text-gray-400 mb-1">{message.usuario_nome}</p>
                            )}
                            <p className="text-sm">{message.mensagem}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-red-100' : 'text-gray-400'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700/50">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="input-futuristic w-full px-4 py-3 pr-12 rounded-xl"
                    disabled={!selectedChat}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !selectedChat}
                  className="btn-futuristic p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-24 h-24 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Selecione um chat</h3>
              <p>Escolha uma conversa para começar a enviar mensagens</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-md border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold neon-text">Novo Chat</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateChat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Chat *
                </label>
                <input
                  type="text"
                  required
                  value={newChatData.nome}
                  onChange={(e) => setNewChatData({...newChatData, nome: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                  placeholder="Digite o nome do chat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newChatData.descricao}
                  onChange={(e) => setNewChatData({...newChatData, descricao: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                  rows="3"
                  placeholder="Descrição opcional do chat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Chat
                </label>
                <select
                  value={newChatData.tipo}
                  onChange={(e) => setNewChatData({...newChatData, tipo: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                >
                  {tipoOptions.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {getTipoLabel(tipo)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-futuristic px-6 py-2 rounded-xl text-white font-medium"
                >
                  Criar Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;