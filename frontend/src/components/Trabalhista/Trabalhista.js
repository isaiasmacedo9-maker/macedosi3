import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Building2,
  User,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Trabalhista = () => {
  const { user, hasAccess } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    empresa_id: '',
    empresa: '',
    tipo: '',
    descricao: '',
    data_solicitacao: '',
    prazo: '',
    responsavel: '',
    observacoes: '',
    funcionario: {
      nome: '',
      cpf: '',
      funcao: '',
      salario: '',
      data_admissao: '',
      motivo_demissao: ''
    },
    detalhes: {
      total_funcionarios: '',
      total_proventos: '',
      total_descontos: '',
      total_liquido: ''
    }
  });

  const tipoOptions = ['admissao', 'demissao', 'folha', 'afastamento', 'reclamacao'];
  const statusOptions = ['pendente', 'em_andamento', 'concluido', 'atrasado'];

  useEffect(() => {
    if (hasAccess([], ['trabalhista'])) {
      fetchSolicitacoes();
    }
  }, [searchTerm, tipoFilter, statusFilter]);

  const fetchSolicitacoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (tipoFilter) params.append('tipo', tipoFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_URL}/api/trabalhista/?${params}`);
      setSolicitacoes(response.data);
    } catch (error) {
      console.error('Error fetching solicitacoes:', error);
      toast.error('Erro ao carregar solicitações trabalhistas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        data_solicitacao: formData.data_solicitacao,
        prazo: formData.prazo,
        funcionario: formData.funcionario.nome ? {
          ...formData.funcionario,
          salario: formData.funcionario.salario ? parseFloat(formData.funcionario.salario) : null,
          data_admissao: formData.funcionario.data_admissao || null
        } : null,
        detalhes: formData.detalhes.total_funcionarios ? {
          ...formData.detalhes,
          total_funcionarios: parseInt(formData.detalhes.total_funcionarios) || 0,
          total_proventos: parseFloat(formData.detalhes.total_proventos) || 0,
          total_descontos: parseFloat(formData.detalhes.total_descontos) || 0,
          total_liquido: parseFloat(formData.detalhes.total_liquido) || 0
        } : null
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/trabalhista/${selectedSolicitacao.id}`, dataToSubmit);
        toast.success('Solicitação atualizada com sucesso!');
      } else {
        await axios.post(`${API_URL}/api/trabalhista/`, dataToSubmit);
        toast.success('Solicitação criada com sucesso!');
      }
      setShowModal(false);
      resetForm();
      fetchSolicitacoes();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao salvar solicitação';
      toast.error(message);
    }
  };

  const handleDelete = async (solicitacaoId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/trabalhista/${solicitacaoId}`);
      toast.success('Solicitação excluída com sucesso!');
      fetchSolicitacoes();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao excluir solicitação';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      empresa: '',
      tipo: '',
      descricao: '',
      data_solicitacao: '',
      prazo: '',
      responsavel: '',
      observacoes: '',
      funcionario: {
        nome: '',
        cpf: '',
        funcao: '',
        salario: '',
        data_admissao: '',
        motivo_demissao: ''
      },
      detalhes: {
        total_funcionarios: '',
        total_proventos: '',
        total_descontos: '',
        total_liquido: ''
      }
    });
    setSelectedSolicitacao(null);
    setIsEditing(false);
  };

  const openModal = (solicitacao = null) => {
    if (solicitacao) {
      setFormData({
        ...solicitacao,
        data_solicitacao: solicitacao.data_solicitacao?.split('T')[0] || '',
        prazo: solicitacao.prazo?.split('T')[0] || '',
        funcionario: solicitacao.funcionario || {
          nome: '',
          cpf: '',
          funcao: '',
          salario: '',
          data_admissao: '',
          motivo_demissao: ''
        },
        detalhes: solicitacao.detalhes || {
          total_funcionarios: '',
          total_proventos: '',
          total_descontos: '',
          total_liquido: ''
        }
      });
      setSelectedSolicitacao(solicitacao);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'admissao': 'Admissão',
      'demissao': 'Demissão',
      'folha': 'Folha de Pagamento',
      'afastamento': 'Afastamento',
      'reclamacao': 'Reclamação Trabalhista'
    };
    return labels[tipo] || tipo;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'atrasado': 'Atrasado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500/20 text-green-400';
      case 'em_andamento':
        return 'bg-blue-500/20 text-blue-400';
      case 'atrasado':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'admissao':
        return 'bg-green-500/20 text-green-400';
      case 'demissao':
        return 'bg-red-500/20 text-red-400';
      case 'folha':
        return 'bg-blue-500/20 text-blue-400';
      case 'afastamento':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'reclamacao':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!hasAccess([], ['trabalhista'])) {
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
              <Users className="w-8 h-8 mr-3 text-red-400" />
              👥 Gestão Trabalhista
            </h1>
            <p className="text-gray-400 mt-2">
              Controle de folha de pagamento e recursos humanos
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Solicitação</span>
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
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-futuristic w-full pl-10 pr-4 py-3 rounded-xl"
            />
          </div>
          
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="input-futuristic px-4 py-3 rounded-xl"
          >
            <option value="">Todos os Tipos</option>
            {tipoOptions.map(tipo => (
              <option key={tipo} value={tipo}>
                {getTipoLabel(tipo)}
              </option>
            ))}
          </select>

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

          <button
            onClick={fetchSolicitacoes}
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
              <p className="text-gray-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                {solicitacoes.filter(s => s.status === 'pendente').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-400">
                {solicitacoes.filter(s => s.status === 'em_andamento').length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Concluídas</p>
              <p className="text-2xl font-bold text-green-400">
                {solicitacoes.filter(s => s.status === 'concluido').length}
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
              <p className="text-gray-400 text-sm">Atrasadas</p>
              <p className="text-2xl font-bold text-red-400">
                {solicitacoes.filter(s => s.status === 'atrasado').length}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Solicitações Table */}
      <div className="glass-intense rounded-2xl border-cosmic overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mr-4"></div>
            <span className="text-gray-300">Carregando solicitações...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-futuristic">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-300 font-semibold">Empresa</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Descrição</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Prazo</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      Nenhuma solicitação encontrada
                    </td>
                  </tr>
                ) : (
                  solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id} className="border-t border-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{solicitacao.empresa}</p>
                          <p className="text-gray-400 text-sm">Responsável: {solicitacao.responsavel}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(solicitacao.tipo)}`}>
                          {getTipoLabel(solicitacao.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <p className="truncate max-w-xs">{solicitacao.descricao}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-300">{formatDate(solicitacao.prazo)}</p>
                          <p className="text-gray-400 text-sm">
                            Solicitado: {formatDate(solicitacao.data_solicitacao)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                          {getStatusLabel(solicitacao.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openModal(solicitacao)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(solicitacao.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                {isEditing ? 'Editar Solicitação' : 'Nova Solicitação Trabalhista'}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    <option value="">Selecione o tipo</option>
                    {tipoOptions.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {getTipoLabel(tipo)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data da Solicitação *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_solicitacao}
                    onChange={(e) => setFormData({...formData, data_solicitacao: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prazo *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.prazo}
                    onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              {/* Funcionário (para admissão/demissão) */}
              {(formData.tipo === 'admissao' || formData.tipo === 'demissao') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">
                    Dados do Funcionário
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome do Funcionário
                      </label>
                      <input
                        type="text"
                        value={formData.funcionario.nome}
                        onChange={(e) => setFormData({
                          ...formData, 
                          funcionario: {...formData.funcionario, nome: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={formData.funcionario.cpf}
                        onChange={(e) => setFormData({
                          ...formData, 
                          funcionario: {...formData.funcionario, cpf: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Função
                      </label>
                      <input
                        type="text"
                        value={formData.funcionario.funcao}
                        onChange={(e) => setFormData({
                          ...formData, 
                          funcionario: {...formData.funcionario, funcao: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Salário
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.funcionario.salario}
                        onChange={(e) => setFormData({
                          ...formData, 
                          funcionario: {...formData.funcionario, salario: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Data de Admissão
                      </label>
                      <input
                        type="date"
                        value={formData.funcionario.data_admissao}
                        onChange={(e) => setFormData({
                          ...formData, 
                          funcionario: {...formData.funcionario, data_admissao: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                  </div>
                  {formData.tipo === 'demissao' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Motivo da Demissão
                      </label>
                      <textarea
                        value={formData.funcionario.motivo_demissao}
                        onChange={(e) => setFormData({
                          ...formData, 
                          funcionario: {...formData.funcionario, motivo_demissao: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                        rows="3"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Detalhes da Folha (para folha de pagamento) */}
              {formData.tipo === 'folha' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">
                    Detalhes da Folha de Pagamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total de Funcionários
                      </label>
                      <input
                        type="number"
                        value={formData.detalhes.total_funcionarios}
                        onChange={(e) => setFormData({
                          ...formData, 
                          detalhes: {...formData.detalhes, total_funcionarios: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total de Proventos
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.detalhes.total_proventos}
                        onChange={(e) => setFormData({
                          ...formData, 
                          detalhes: {...formData.detalhes, total_proventos: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total de Descontos
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.detalhes.total_descontos}
                        onChange={(e) => setFormData({
                          ...formData, 
                          detalhes: {...formData.detalhes, total_descontos: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total Líquido
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.detalhes.total_liquido}
                        onChange={(e) => setFormData({
                          ...formData, 
                          detalhes: {...formData.detalhes, total_liquido: e.target.value}
                        })}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                  rows="4"
                  placeholder="Observações adicionais sobre a solicitação..."
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
                  {isEditing ? 'Atualizar' : 'Criar'} Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trabalhista;