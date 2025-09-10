import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'sonner';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Building2,
  CreditCard,
  Receipt
} from 'lucide-react';

const ContasReceber = () => {
  const { user, hasAccess } = useAuth();
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [situacaoFilter, setSituacaoFilter] = useState('');
  const [cidadeFilter, setCidadeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedConta, setSelectedConta] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDarBaixaModal, setShowDarBaixaModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    empresa_id: '',
    empresa: '',
    descricao: '',
    documento: '',
    forma_pagamento: '',
    conta: '',
    centro_custo: '',
    plano_custo: '',
    data_emissao: '',
    data_vencimento: '',
    valor_original: '',
    observacao: '',
    cidade_atendimento: '',
    usuario_responsavel: user?.name || ''
  });

  // Dar baixa form
  const [baixaData, setBaixaData] = useState({
    valor_recebido: '',
    data_recebimento: '',
    desconto: 0,
    acrescimo: 0,
    observacao: ''
  });

  const cities = ['jacobina', 'ourolandia', 'umburanas', 'uberlandia'];
  const situacaoOptions = ['em_aberto', 'pago', 'atrasado', 'renegociado', 'cancelado'];
  const formasPagamento = ['boleto', 'pix', 'transferencia', 'dinheiro', 'cartao_credito', 'cartao_debito'];

  useEffect(() => {
    if (hasAccess([], ['financeiro'])) {
      fetchContas();
    }
  }, [searchTerm, situacaoFilter, cidadeFilter]);

  const fetchContas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (situacaoFilter) params.append('situacao', situacaoFilter);
      if (cidadeFilter) params.append('cidade', cidadeFilter);

      const response = await axios.get(`${API_URL}/api/financial/contas-receber?${params}`);
      setContas(response.data);
    } catch (error) {
      console.error('Error fetching contas:', error);
      toast.error('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        valor_original: parseFloat(formData.valor_original),
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento
      };

      await axios.post(`${API_URL}/api/financial/contas-receber`, dataToSubmit);
      toast.success('Conta a receber criada com sucesso!');
      setShowModal(false);
      resetForm();
      fetchContas();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao salvar conta';
      toast.error(message);
    }
  };

  const handleDarBaixa = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('valor_recebido', baixaData.valor_recebido);
      params.append('data_recebimento', baixaData.data_recebimento);
      params.append('desconto', baixaData.desconto);
      params.append('acrescimo', baixaData.acrescimo);
      params.append('observacao', baixaData.observacao);

      await axios.put(`${API_URL}/api/financial/contas-receber/${selectedConta.id}/baixa?${params}`);
      toast.success('Baixa realizada com sucesso!');
      setShowDarBaixaModal(false);
      resetBaixaForm();
      fetchContas();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao dar baixa';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: '',
      empresa: '',
      descricao: '',
      documento: '',
      forma_pagamento: '',
      conta: '',
      centro_custo: '',
      plano_custo: '',
      data_emissao: '',
      data_vencimento: '',
      valor_original: '',
      observacao: '',
      cidade_atendimento: '',
      usuario_responsavel: user?.name || ''
    });
    setSelectedConta(null);
    setIsEditing(false);
  };

  const resetBaixaForm = () => {
    setBaixaData({
      valor_recebido: '',
      data_recebimento: '',
      desconto: 0,
      acrescimo: 0,
      observacao: ''
    });
    setSelectedConta(null);
  };

  const openModal = (conta = null) => {
    if (conta) {
      setFormData({
        ...conta,
        data_emissao: conta.data_emissao?.split('T')[0] || '',
        data_vencimento: conta.data_vencimento?.split('T')[0] || '',
        valor_original: conta.valor_original?.toString() || ''
      });
      setSelectedConta(conta);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const openDarBaixaModal = (conta) => {
    setSelectedConta(conta);
    setBaixaData({
      ...baixaData,
      valor_recebido: conta.valor_original?.toString() || '',
      data_recebimento: new Date().toISOString().split('T')[0]
    });
    setShowDarBaixaModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSituacaoColor = (situacao) => {
    switch (situacao) {
      case 'pago':
        return 'bg-green-500/20 text-green-400';
      case 'atrasado':
        return 'bg-red-500/20 text-red-400';
      case 'renegociado':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelado':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getSituacaoLabel = (situacao) => {
    const labels = {
      'em_aberto': 'Em Aberto',
      'pago': 'Pago',
      'atrasado': 'Atrasado',
      'renegociado': 'Renegociado',
      'cancelado': 'Cancelado'
    };
    return labels[situacao] || situacao;
  };

  if (!hasAccess([], ['financeiro'])) {
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
              <DollarSign className="w-8 h-8 mr-3 text-red-400" />
              💸 Contas a Receber
            </h1>
            <p className="text-gray-400 mt-2">
              Controle de pagamentos e recebimentos
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Conta</span>
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
              placeholder="Buscar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-futuristic w-full pl-10 pr-4 py-3 rounded-xl"
            />
          </div>
          
          <select
            value={situacaoFilter}
            onChange={(e) => setSituacaoFilter(e.target.value)}
            className="input-futuristic px-4 py-3 rounded-xl"
          >
            <option value="">Todas as Situações</option>
            {situacaoOptions.map(situacao => (
              <option key={situacao} value={situacao}>
                {getSituacaoLabel(situacao)}
              </option>
            ))}
          </select>

          <select
            value={cidadeFilter}
            onChange={(e) => setCidadeFilter(e.target.value)}
            className="input-futuristic px-4 py-3 rounded-xl"
          >
            <option value="">Todas as Cidades</option>
            {cities.map(city => (
              <option key={city} value={city}>
                {city.charAt(0).toUpperCase() + city.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={fetchContas}
            className="glass-light py-3 px-4 rounded-xl text-gray-300 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total em Aberto</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(contas.filter(c => c.situacao === 'em_aberto').reduce((sum, c) => sum + (c.total_liquido || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Recebido</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(contas.filter(c => c.situacao === 'pago').reduce((sum, c) => sum + (c.valor_quitado || 0), 0))}
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
              <p className="text-gray-400 text-sm">Contas Ativas</p>
              <p className="text-2xl font-bold text-blue-400">
                {contas.filter(c => c.situacao !== 'cancelado').length}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Receipt className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Contas Table */}
      <div className="glass-intense rounded-2xl border-cosmic overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mr-4"></div>
            <span className="text-gray-300">Carregando contas...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-futuristic">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-300 font-semibold">Empresa</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Documento</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Valor</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Vencimento</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Situação</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      Nenhuma conta encontrada
                    </td>
                  </tr>
                ) : (
                  contas.map((conta) => (
                    <tr key={conta.id} className="border-t border-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{conta.empresa}</p>
                          <p className="text-gray-400 text-sm">{conta.descricao}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {conta.documento}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{formatCurrency(conta.total_liquido)}</p>
                          {conta.situacao === 'pago' && (
                            <p className="text-green-400 text-sm">
                              Recebido: {formatCurrency(conta.valor_quitado)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(conta.data_vencimento)}
                        {conta.data_recebimento && (
                          <p className="text-green-400 text-sm">
                            Pago em: {formatDate(conta.data_recebimento)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSituacaoColor(conta.situacao)}`}>
                          {getSituacaoLabel(conta.situacao)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {conta.situacao === 'em_aberto' && (
                            <button
                              onClick={() => openDarBaixaModal(conta)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                              title="Dar Baixa"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openModal(conta)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Ver Detalhes"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Modal Nova Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                {isEditing ? 'Detalhes da Conta' : 'Nova Conta a Receber'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isEditing}
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
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.documento}
                    onChange={(e) => setFormData({...formData, documento: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Forma de Pagamento *
                  </label>
                  <select
                    required
                    value={formData.forma_pagamento}
                    onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  >
                    <option value="">Selecione</option>
                    {formasPagamento.map(forma => (
                      <option key={forma} value={forma}>
                        {forma.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor Original *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor_original}
                    onChange={(e) => setFormData({...formData, valor_original: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cidade de Atendimento *
                  </label>
                  <select
                    required
                    value={formData.cidade_atendimento}
                    onChange={(e) => setFormData({...formData, cidade_atendimento: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  >
                    <option value="">Selecione</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city.charAt(0).toUpperCase() + city.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Emissão *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_emissao}
                    onChange={(e) => setFormData({...formData, data_emissao: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Conta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.conta}
                    onChange={(e) => setFormData({...formData, conta: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Centro de Custo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.centro_custo}
                    onChange={(e) => setFormData({...formData, centro_custo: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plano de Custo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plano_custo}
                    onChange={(e) => setFormData({...formData, plano_custo: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observação
                </label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                  rows="3"
                  disabled={isEditing}
                />
              </div>

              {/* Histórico para contas editadas */}
              {isEditing && selectedConta?.historico && selectedConta.historico.length > 0 && (
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Histórico</h3>
                  <div className="space-y-3">
                    {selectedConta.historico.map((hist, index) => (
                      <div key={index} className="glass-light p-4 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{hist.acao}</p>
                            <p className="text-gray-400 text-sm">Por: {hist.usuario}</p>
                            {hist.observacao && (
                              <p className="text-gray-300 text-sm mt-1">{hist.observacao}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {hist.valor && (
                              <p className="text-green-400 font-medium">{formatCurrency(hist.valor)}</p>
                            )}
                            <p className="text-gray-400 text-sm">{formatDate(hist.data)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isEditing && (
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
                    Criar Conta
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="flex items-center justify-end pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal Dar Baixa */}
      {showDarBaixaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-2xl border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                Dar Baixa - {selectedConta?.empresa}
              </h2>
              <button
                onClick={() => setShowDarBaixaModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 p-4 glass-light rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Documento:</p>
                  <p className="text-white">{selectedConta?.documento}</p>
                </div>
                <div>
                  <p className="text-gray-400">Valor Original:</p>
                  <p className="text-white">{formatCurrency(selectedConta?.valor_original)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Vencimento:</p>
                  <p className="text-white">{formatDate(selectedConta?.data_vencimento)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Forma de Pagamento:</p>
                  <p className="text-white capitalize">{selectedConta?.forma_pagamento?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDarBaixa} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor Recebido *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={baixaData.valor_recebido}
                    onChange={(e) => setBaixaData({...baixaData, valor_recebido: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data do Recebimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={baixaData.data_recebimento}
                    onChange={(e) => setBaixaData({...baixaData, data_recebimento: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Desconto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={baixaData.desconto}
                    onChange={(e) => setBaixaData({...baixaData, desconto: parseFloat(e.target.value) || 0})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Acréscimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={baixaData.acrescimo}
                    onChange={(e) => setBaixaData({...baixaData, acrescimo: parseFloat(e.target.value) || 0})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observação
                </label>
                <textarea
                  value={baixaData.observacao}
                  onChange={(e) => setBaixaData({...baixaData, observacao: e.target.value})}
                  className="input-futuristic w-full px-4 py-3 rounded-xl"
                  rows="3"
                  placeholder="Observações sobre o recebimento..."
                />
              </div>

              {/* Cálculo do valor final */}
              <div className="p-4 glass-light rounded-xl">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-300">Valor Final:</span>
                  <span className="text-green-400">
                    {formatCurrency(
                      parseFloat(baixaData.valor_recebido || 0) - 
                      parseFloat(baixaData.desconto || 0) + 
                      parseFloat(baixaData.acrescimo || 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowDarBaixaModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContasReceber;