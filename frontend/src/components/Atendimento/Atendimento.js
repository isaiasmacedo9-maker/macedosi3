import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'sonner';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Phone,
  Mail,
  FileText,
  Building2
} from 'lucide-react';

const Atendimento = () => {
  const { user, hasAccess } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showConversaModal, setShowConversaModal] = useState(false);
  const [novaConversa, setNovaConversa] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    empresa_id: '',
    empresa: '',
    titulo: '',
    descricao: '',
    prioridade: 'media',
    responsavel: '',
    canal: 'telefone',
    data_abertura: new Date().toISOString().split('T')[0]
  });

  const statusOptions = ['aberto', 'em_andamento', 'resolvido', 'fechado', 'aguardando_cliente'];
  const prioridadeOptions = ['baixa', 'media', 'alta', 'urgente'];
  const canalOptions = ['telefone', 'email', 'whatsapp', 'chat', 'presencial'];

  useEffect(() => {
    if (hasAccess([], ['atendimento'])) {
      fetchTickets();
    }
  }, [searchTerm, statusFilter, prioridadeFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (prioridadeFilter) params.append('prioridade', prioridadeFilter);

      const response = await axios.get(`${API_URL}/api/atendimento/?${params}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar tickets de atendimento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        data_abertura: formData.data_abertura
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/atendimento/${selectedTicket.id}`, dataToSubmit);
        toast.success('Ticket atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/api/atendimento/`, dataToSubmit);
        toast.success('Ticket criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      fetchTickets();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao salvar ticket';
      toast.error(message);
    }
  };

  const handleAddConversa = async (e) => {
    e.preventDefault();
    if (!novaConversa.trim()) return;

    try {
      const conversaData = {
        data: new Date().toISOString(),
        usuario: user.name,
        mensagem: novaConversa
      };

      // Simular adição de conversa (implementação específica dependeria da API)
      const updatedConversas = [...(selectedTicket.conversas || []), conversaData];
      setSelectedTicket({...selectedTicket, conversas: updatedConversas});
      setNovaConversa('');
      toast.success('Conversa adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar conversa');
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      empresa: '',
      titulo: '',
      descricao: '',
      prioridade: 'media',
      responsavel: '',
      canal: 'telefone',
      data_abertura: new Date().toISOString().split('T')[0]
    });
    setSelectedTicket(null);
    setIsEditing(false);
  };

  const openModal = (ticket = null) => {
    if (ticket) {
      setFormData({
        ...ticket,
        data_abertura: ticket.data_abertura?.split('T')[0] || ''
      });
      setSelectedTicket(ticket);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const openConversaModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowConversaModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'aberto': 'Aberto',
      'em_andamento': 'Em Andamento',
      'resolvido': 'Resolvido',
      'fechado': 'Fechado',
      'aguardando_cliente': 'Aguardando Cliente'
    };
    return labels[status] || status;
  };

  const getPrioridadeLabel = (prioridade) => {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return labels[prioridade] || prioridade;
  };

  const getCanalLabel = (canal) => {
    const labels = {
      'telefone': 'Telefone',
      'email': 'Email',
      'whatsapp': 'WhatsApp',
      'chat': 'Chat',
      'presencial': 'Presencial'
    };
    return labels[canal] || canal;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'fechado':
      case 'resolvido':
        return 'bg-green-500/20 text-green-400';
      case 'em_andamento':
        return 'bg-blue-500/20 text-blue-400';
      case 'aguardando_cliente':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'aberto':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'urgente':
        return 'bg-red-500/20 text-red-400';
      case 'alta':
        return 'bg-orange-500/20 text-orange-400';
      case 'media':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'baixa':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCanalIcon = (canal) => {
    switch (canal) {
      case 'telefone':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      case 'presencial':
        return <User className="w-4 h-4" />;
      default:
        return <Headphones className="w-4 h-4" />;
    }
  };

  const isSLAVencido = (sla) => {
    if (!sla) return false;
    return new Date(sla) < new Date();
  };

  if (!hasAccess([], ['atendimento'])) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Você não tem acesso a este módulo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-intense rounded-2xl p-6 border-cosmic">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold neon-text flex items-center">
              <Headphones className="w-8 h-8 mr-3 text-red-400" />
              📞 Sistema de Atendimento
            </h1>
            <p className="text-gray-400 mt-2">
              Gestão de tickets e atendimento ao cliente
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Ticket</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-intense rounded-2xl p-6 border-cosmic">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-futuristic w-full pl-10 pr-4 py-3 rounded-xl"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-futuristic px-4 py-3 rounded-xl"
          >
            <option value="">Todos os Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>

          <select
            value={prioridadeFilter}
            onChange={(e) => setPrioridadeFilter(e.target.value)}
            className="input-futuristic px-4 py-3 rounded-xl"
          >
            <option value="">Todas as Prioridades</option>
            {prioridadeOptions.map(prioridade => (
              <option key={prioridade} value={prioridade}>
                {getPrioridadeLabel(prioridade)}
              </option>
            ))}
          </select>

          <button
            onClick={fetchTickets}
            className="glass-light py-3 px-4 rounded-xl text-gray-300 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tickets Abertos</p>
              <p className="text-2xl font-bold text-purple-400">
                {tickets.filter(t => t.status === 'aberto').length}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-400">
                {tickets.filter(t => t.status === 'em_andamento').length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolvidos</p>
              <p className="text-2xl font-bold text-green-400">
                {tickets.filter(t => t.status === 'resolvido').length}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">SLA Vencido</p>
              <p className="text-2xl font-bold text-red-400">
                {tickets.filter(t => isSLAVencido(t.sla) && !['resolvido', 'fechado'].includes(t.status)).length}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass-intense rounded-2xl border-cosmic overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mr-4"></div>
            <span className="text-gray-300">Carregando tickets...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-futuristic">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-300 font-semibold">Empresa</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Título</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Prioridade</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Canal</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">SLA</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      Nenhum ticket encontrado
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-t border-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{ticket.empresa}</p>
                          <p className="text-gray-400 text-sm">Responsável: {ticket.responsavel}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{ticket.titulo}</p>
                          <p className="text-gray-400 text-sm truncate max-w-xs">{ticket.descricao}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(ticket.prioridade)}`}>
                          {getPrioridadeLabel(ticket.prioridade)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getCanalIcon(ticket.canal)}
                          <span className="text-gray-300 text-sm">{getCanalLabel(ticket.canal)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`text-sm ${
                            isSLAVencido(ticket.sla) && !['resolvido', 'fechado'].includes(ticket.status)
                              ? 'text-red-400' 
                              : 'text-gray-300'
                          }`}>
                            {formatDateTime(ticket.sla)}
                          </p>
                          {isSLAVencido(ticket.sla) && !['resolvido', 'fechado'].includes(ticket.status) && (
                            <span className="text-xs text-red-400">Vencido</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openConversaModal(ticket)}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                            title="Ver Conversas"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(ticket)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                {isEditing ? 'Editar Ticket' : 'Novo Ticket de Atendimento'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.empresa_id}
                    onChange={(e) => setFormData({...formData, empresa_id: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                  rows="4"
                  placeholder="Descreva o problema ou solicitação..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {prioridadeOptions.map(prioridade => (
                      <option key={prioridade} value={prioridade}>
                        {getPrioridadeLabel(prioridade)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Canal *
                  </label>
                  <select
                    required
                    value={formData.canal}
                    onChange={(e) => setFormData({...formData, canal: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {canalOptions.map(canal => (
                      <option key={canal} value={canal}>
                        {getCanalLabel(canal)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Abertura *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_abertura}
                    onChange={(e) => setFormData({...formData, data_abertura: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsavel}
                  onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium"
                >
                  {isEditing ? 'Atualizar' : 'Criar'} Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conversas */}
      {showConversaModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                Conversas - {selectedTicket.titulo}
              </h2>
              <button
                onClick={() => setShowConversaModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Ticket Info */}
            <div className="mb-6 p-4 glass-light rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Empresa:</p>
                  <p className="text-white">{selectedTicket.empresa}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status:</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400">Prioridade:</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(selectedTicket.prioridade)}`}>
                    {getPrioridadeLabel(selectedTicket.prioridade)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400">Canal:</p>
                  <div className="flex items-center space-x-2">
                    {getCanalIcon(selectedTicket.canal)}
                    <span className="text-white">{getCanalLabel(selectedTicket.canal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversas */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {selectedTicket.conversas && selectedTicket.conversas.length > 0 ? (
                selectedTicket.conversas.map((conversa, index) => (
                  <div key={index} className="glass-light p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{conversa.usuario}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{formatDateTime(conversa.data)}</span>
                    </div>
                    <p className="text-gray-300">{conversa.mensagem}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nenhuma conversa registrada
                </div>
              )}
            </div>

            {/* Nova Conversa */}
            <form onSubmit={handleAddConversa} className="border-t border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adicionar Conversa
              </label>
              <div className="flex space-x-4">
                <textarea
                  value={novaConversa}
                  onChange={(e) => setNovaConversa(e.target.value)}
                  className="input-futuristic flex-1 px-4 py-3 rounded-xl"
                  rows="3"
                  placeholder="Digite sua mensagem..."
                />
                <button
                  type="submit"
                  className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium self-end"
                >
                  Enviar
                </button>
              </div>
            </form>

            <div className="flex items-center justify-end pt-6 border-t border-gray-700 mt-6">
              <button
                onClick={() => setShowConversaModal(false)}
                className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Atendimento;