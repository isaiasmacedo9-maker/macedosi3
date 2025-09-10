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
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';

const ClientsList = () => {
  const { user, hasAccess } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nome_empresa: '',
    nome_fantasia: '',
    status: 'ativa',
    cidade: '',
    telefone: '',
    whatsapp: '',
    email: '',
    responsavel: '',
    cnpj: '',
    forma_envio: 'whatsapp',
    codigo_iob: '',
    novo_cliente: false,
    tipo_empresa: 'matriz',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      cidade: '',
      estado: ''
    },
    tipo_regime: 'simples',
    empresa_grupo: ''
  });

  const cities = ['jacobina', 'ourolandia', 'umburanas', 'uberlandia'];
  const statusOptions = ['ativa', 'inativa', 'suspensa'];
  const regimeOptions = ['simples', 'lucro_presumido', 'lucro_real', 'mei'];
  const tipoEmpresaOptions = ['matriz', 'filial'];
  const formaEnvioOptions = ['whatsapp', 'email', 'impresso'];

  useEffect(() => {
    fetchClients();
  }, [searchTerm, statusFilter, cityFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (cityFilter) params.append('cidade', cityFilter);

      const response = await axios.get(`${API_URL}/api/clients/?${params}`);
      setClients(response.data.clients || response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${API_URL}/api/clients/${selectedClient.id}`, formData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/api/clients/`, formData);
        toast.success('Cliente criado com sucesso!');
      }
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao salvar cliente';
      toast.error(message);
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/clients/${clientId}`);
      toast.success('Cliente excluído com sucesso!');
      fetchClients();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao excluir cliente';
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      nome_empresa: '',
      nome_fantasia: '',
      status: 'ativa',
      cidade: '',
      telefone: '',
      whatsapp: '',
      email: '',
      responsavel: '',
      cnpj: '',
      forma_envio: 'whatsapp',
      codigo_iob: '',
      novo_cliente: false,
      tipo_empresa: 'matriz',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        cidade: '',
        estado: ''
      },
      tipo_regime: 'simples',
      empresa_grupo: ''
    });
    setSelectedClient(null);
    setIsEditing(false);
  };

  const openModal = (client = null) => {
    if (client) {
      setFormData(client);
      setSelectedClient(client);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const formatCNPJ = (cnpj) => {
    return cnpj?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') || '';
  };

  const formatPhone = (phone) => {
    return phone?.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') || '';
  };

  if (!hasAccess([], ['comercial'])) {
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
              🏢 Gestão de Clientes
            </h1>
            <p className="text-gray-400 mt-2">
              Sistema de cadastro e gerenciamento de clientes
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Cliente</span>
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
              placeholder="Buscar clientes..."
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
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
            onClick={fetchClients}
            className="glass-light py-3 px-4 rounded-xl text-gray-300 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-intense rounded-2xl border-cosmic overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mr-4"></div>
            <span className="text-gray-300">Carregando clientes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-futuristic">
              <thead>
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-300 font-semibold">Empresa</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">CNPJ</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Responsável</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Cidade</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="border-t border-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{client.nome_empresa}</p>
                          <p className="text-gray-400 text-sm">{client.nome_fantasia}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {formatCNPJ(client.cnpj)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-300">{client.responsavel}</p>
                          <p className="text-gray-400 text-sm">{formatPhone(client.telefone)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 capitalize">
                        {client.cidade}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.status === 'ativa' 
                            ? 'bg-green-500/20 text-green-400' 
                            : client.status === 'inativa'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openModal(client)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
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
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
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
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome_empresa}
                    onChange={(e) => setFormData({...formData, nome_empresa: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome_fantasia}
                    onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cidade *
                  </label>
                  <select
                    required
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    <option value="">Selecione a cidade</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city.charAt(0).toUpperCase() + city.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    Código IOB
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_iob}
                    onChange={(e) => setFormData({...formData, codigo_iob: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              {/* Business Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Empresa
                  </label>
                  <select
                    value={formData.tipo_empresa}
                    onChange={(e) => setFormData({...formData, tipo_empresa: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {tipoEmpresaOptions.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Regime
                  </label>
                  <select
                    value={formData.tipo_regime}
                    onChange={(e) => setFormData({...formData, tipo_regime: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {regimeOptions.map(regime => (
                      <option key={regime} value={regime}>
                        {regime === 'lucro_presumido' ? 'Lucro Presumido' :
                         regime === 'lucro_real' ? 'Lucro Real' :
                         regime === 'mei' ? 'MEI' : 'Simples'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Forma de Envio
                  </label>
                  <select
                    value={formData.forma_envio}
                    onChange={(e) => setFormData({...formData, forma_envio: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {formaEnvioOptions.map(forma => (
                      <option key={forma} value={forma}>
                        {forma.charAt(0).toUpperCase() + forma.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Logradouro *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endereco.logradouro}
                      onChange={(e) => setFormData({
                        ...formData, 
                        endereco: {...formData.endereco, logradouro: e.target.value}
                      })}
                      className="input-futuristic w-full px-4 py-3 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endereco.bairro}
                      onChange={(e) => setFormData({
                        ...formData, 
                        endereco: {...formData.endereco, bairro: e.target.value}
                      })}
                      className="input-futuristic w-full px-4 py-3 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CEP *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endereco.cep}
                      onChange={(e) => setFormData({
                        ...formData, 
                        endereco: {...formData.endereco, cep: e.target.value}
                      })}
                      className="input-futuristic w-full px-4 py-3 rounded-xl"
                      placeholder="00000-000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endereco.cidade}
                      onChange={(e) => setFormData({
                        ...formData, 
                        endereco: {...formData.endereco, cidade: e.target.value}
                      })}
                      className="input-futuristic w-full px-4 py-3 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.endereco.estado}
                      onChange={(e) => setFormData({
                        ...formData, 
                        endereco: {...formData.endereco, estado: e.target.value}
                      })}
                      className="input-futuristic w-full px-4 py-3 rounded-xl"
                      placeholder="BA"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.novo_cliente}
                    onChange={(e) => setFormData({...formData, novo_cliente: e.target.checked})}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <span className="text-gray-300">Novo Cliente</span>
                </label>
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
                  {isEditing ? 'Atualizar' : 'Criar'} Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;