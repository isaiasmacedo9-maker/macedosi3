import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'sonner';
import {
  Scale,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Building2
} from 'lucide-react';

const Fiscal = () => {
  const { user, hasAccess } = useAuth();
  const [obrigacoes, setObrigacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedObrigacao, setSelectedObrigacao] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    empresa_id: '',
    empresa: '',
    tipo: '',
    nome: '',
    periodicidade: '',
    vencimento: '',
    responsavel: '',
    observacoes: '',
    valor: ''
  });

  const tipoOptions = ['pgdas', 'dctf', 'sped', 'defis', 'darf'];
  const statusOptions = ['pendente', 'em_andamento', 'entregue', 'atrasado'];
  const periodicidadeOptions = ['mensal', 'trimestral', 'semestral', 'anual', 'evento'];

  useEffect(() => {
    if (hasAccess([], ['fiscal'])) {
      fetchObrigacoes();
    }
  }, [searchTerm, tipoFilter, statusFilter]);

  const fetchObrigacoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (tipoFilter) params.append('tipo', tipoFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_URL}/api/fiscal/?${params}`);
      setObrigacoes(response.data);
    } catch (error) {
      console.error('Error fetching obrigacoes:', error);
      toast.error('Erro ao carregar obrigações fiscais');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        vencimento: formData.vencimento,
        valor: formData.valor ? parseFloat(formData.valor) : null
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/fiscal/${selectedObrigacao.id}`, dataToSubmit);
        toast.success('Obrigação atualizada com sucesso!');
      } else {
        await axios.post(`${API_URL}/api/fiscal/`, dataToSubmit);
        toast.success('Obrigação criada com sucesso!');
      }
      setShowModal(false);
      resetForm();
      fetchObrigacoes();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao salvar obrigação';
      toast.error(message);
    }
  };

  const handleDelete = async (obrigacaoId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta obrigação?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/fiscal/${obrigacaoId}`);
      toast.success('Obrigação excluída com sucesso!');
      fetchObrigacoes();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao excluir obrigação';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      empresa: '',
      tipo: '',
      nome: '',
      periodicidade: '',
      vencimento: '',
      responsavel: '',
      observacoes: '',
      valor: ''
    });
    setSelectedObrigacao(null);
    setIsEditing(false);
  };

  const openModal = (obrigacao = null) => {
    if (obrigacao) {
      setFormData({
        ...obrigacao,
        vencimento: obrigacao.vencimento?.split('T')[0] || '',
        valor: obrigacao.valor?.toString() || ''
      });
      setSelectedObrigacao(obrigacao);
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
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'pgdas': 'PGDAS',
      'dctf': 'DCTF',
      'sped': 'SPED',
      'defis': 'DEFIS',
      'darf': 'DARF'
    };
    return labels[tipo] || tipo.toUpperCase();
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'entregue': 'Entregue',
      'atrasado': 'Atrasado'
    };
    return labels[status] || status;
  };

  const getPeriodicidadeLabel = (periodicidade) => {
    const labels = {
      'mensal': 'Mensal',
      'trimestral': 'Trimestral',
      'semestral': 'Semestral',
      'anual': 'Anual',
      'evento': 'Por Evento'
    };
    return labels[periodicidade] || periodicidade;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'entregue':
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
      case 'pgdas':
        return 'bg-blue-500/20 text-blue-400';
      case 'dctf':
        return 'bg-purple-500/20 text-purple-400';
      case 'sped':
        return 'bg-green-500/20 text-green-400';
      case 'defis':
        return 'bg-orange-500/20 text-orange-400';
      case 'darf':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const isVencimentoAtrasado = (vencimento) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataVencimento = new Date(vencimento);
    dataVencimento.setHours(0, 0, 0, 0);
    return dataVencimento < hoje;
  };

  if (!hasAccess([], ['fiscal'])) {
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
              <Scale className="w-8 h-8 mr-3 text-red-400" />
              📋 Gestão Fiscal
            </h1>
            <p className="text-gray-400 mt-2">
              Controle de obrigações fiscais e tributárias
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Obrigação</span>
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
              placeholder="Buscar obrigações..."
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
            onClick={fetchObrigacoes}
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
                {obrigacoes.filter(o => o.status === 'pendente').length}
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
                {obrigacoes.filter(o => o.status === 'em_andamento').length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Entregues</p>
              <p className="text-2xl font-bold text-green-400">
                {obrigacoes.filter(o => o.status === 'entregue').length}
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
                {obrigacoes.filter(o => o.status === 'atrasado' || (o.status === 'pendente' && isVencimentoAtrasado(o.vencimento))).length}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Obrigações Table */}
      <div className="glass-intense rounded-2xl border-cosmic overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mr-4"></div>
            <span className="text-gray-300">Carregando obrigações...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-futuristic">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-300 font-semibold">Empresa</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Tipo</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Nome</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Vencimento</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Periodicidade</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {obrigacoes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      Nenhuma obrigação encontrada
                    </td>
                  </tr>
                ) : (
                  obrigacoes.map((obrigacao) => (
                    <tr key={obrigacao.id} className="border-t border-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{obrigacao.empresa}</p>
                          <p className="text-gray-400 text-sm">Responsável: {obrigacao.responsavel}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(obrigacao.tipo)}`}>
                          {getTipoLabel(obrigacao.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        <p className="font-medium">{obrigacao.nome}</p>
                        {obrigacao.valor && (
                          <p className="text-green-400 text-sm">{formatCurrency(obrigacao.valor)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`font-medium ${
                            isVencimentoAtrasado(obrigacao.vencimento) && obrigacao.status !== 'entregue'
                              ? 'text-red-400' 
                              : 'text-gray-300'
                          }`}>
                            {formatDate(obrigacao.vencimento)}
                          </p>
                          {obrigacao.data_entrega && (
                            <p className="text-green-400 text-sm">
                              Entregue: {formatDate(obrigacao.data_entrega)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {getPeriodicidadeLabel(obrigacao.periodicidade)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(obrigacao.status)}`}>
                          {getStatusLabel(obrigacao.status)}
                        </span>
                        {isVencimentoAtrasado(obrigacao.vencimento) && obrigacao.status !== 'entregue' && (
                          <div className="flex items-center mt-1">
                            <AlertTriangle className="w-3 h-3 text-red-400 mr-1" />
                            <span className="text-xs text-red-400">Vencido</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openModal(obrigacao)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(obrigacao.id)}
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
          <div className="glass-intense rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                {isEditing ? 'Editar Obrigação' : 'Nova Obrigação Fiscal'}
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
                    Nome da Obrigação *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Periodicidade *
                  </label>
                  <select
                    required
                    value={formData.periodicidade}
                    onChange={(e) => setFormData({...formData, periodicidade: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    <option value="">Selecione</option>
                    {periodicidadeOptions.map(periodicidade => (
                      <option key={periodicidade} value={periodicidade}>
                        {getPeriodicidadeLabel(periodicidade)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.vencimento}
                    onChange={(e) => setFormData({...formData, vencimento: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor (se aplicável)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="0,00"
                  />
                </div>
              </div>

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
                  placeholder="Observações adicionais sobre a obrigação..."
                />
              </div>

              {/* Status para edição */}
              {isEditing && (
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Status da Obrigação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status Atual
                      </label>
                      <select
                        value={selectedObrigacao?.status || 'pendente'}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setSelectedObrigacao({...selectedObrigacao, status: newStatus});
                        }}
                        className="input-futuristic w-full px-4 py-3 rounded-xl"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedObrigacao?.data_entrega && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Data de Entrega
                        </label>
                        <p className="text-green-400 bg-gray-800 px-4 py-3 rounded-xl">
                          {formatDate(selectedObrigacao.data_entrega)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {selectedObrigacao?.documentos && selectedObrigacao.documentos.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Documentos Anexados
                      </label>
                      <div className="space-y-2">
                        {selectedObrigacao.documentos.map((doc, index) => (
                          <div key={index} className="flex items-center p-3 glass-light rounded-xl">
                            <FileCheck className="w-5 h-5 text-green-400 mr-3" />
                            <span className="text-gray-300">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  {isEditing ? 'Atualizar' : 'Criar'} Obrigação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fiscal;