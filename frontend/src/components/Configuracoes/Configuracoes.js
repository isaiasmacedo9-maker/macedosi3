import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { toast } from 'sonner';
import {
  Settings,
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Briefcase,
  Save,
  RefreshCw,
  Database,
  Globe,
  Lock,
  UserPlus,
  UserCheck,
  UserX,
  ChevronRight
} from 'lucide-react';

const Configuracoes = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);

  // Users management
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // User form data
  const [userFormData, setUserFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'colaborador',
    allowed_cities: [],
    allowed_sectors: []
  });

  // System configurations
  const [systemConfigs, setSystemConfigs] = useState([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configFormData, setConfigFormData] = useState({
    setor: '',
    nome: '',
    configuracoes: {},
    updated_by: user?.name || ''
  });

  const cities = ['jacobina', 'ourolandia', 'umburanas', 'uberlandia'];
  const sectors = ['comercial', 'trabalhista', 'fiscal', 'financeiro', 'contabil', 'atendimento'];
  const roles = ['admin', 'colaborador'];

  const tabs = [
    { id: 'usuarios', name: 'Usuários', icon: Users, description: 'Gerenciar usuários do sistema' },
    { id: 'sistema', name: 'Sistema', icon: Database, description: 'Configurações gerais do sistema' },
    { id: 'seguranca', name: 'Segurança', icon: Shield, description: 'Configurações de segurança' },
    { id: 'integracoes', name: 'Integrações', icon: Globe, description: 'APIs e integrações externas' }
  ];

  useEffect(() => {
    if (activeTab === 'usuarios') {
      fetchUsers();
    } else if (activeTab === 'sistema') {
      fetchSystemConfigs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/auth/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemConfigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/configuracoes/`);
      setSystemConfigs(response.data);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      await axios.post(`${API_URL}/api/auth/register`, userFormData);
      toast.success('Usuário criado com sucesso!');
      setShowUserModal(false);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao criar usuário';
      toast.error(message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!isAdmin || !selectedUser) return;

    try {
      const updateData = { ...userFormData };
      delete updateData.password; // Don't update password unless specified
      
      await axios.put(`${API_URL}/api/auth/users/${selectedUser.id}`, updateData);
      toast.success('Usuário atualizado com sucesso!');
      setShowUserModal(false);
      resetUserForm();
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao atualizar usuário';
      toast.error(message);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!isAdmin) return;

    try {
      await axios.put(`${API_URL}/api/auth/users/${userId}`, {
        is_active: !currentStatus
      });
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao alterar status do usuário';
      toast.error(message);
    }
  };

  const handleCreateConfig = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/configuracoes/`, {
        ...configFormData,
        updated_by: user.name
      });
      toast.success('Configuração criada com sucesso!');
      setShowConfigModal(false);
      resetConfigForm();
      fetchSystemConfigs();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao criar configuração';
      toast.error(message);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      name: '',
      password: '',
      role: 'colaborador',
      allowed_cities: [],
      allowed_sectors: []
    });
    setSelectedUser(null);
    setIsEditingUser(false);
  };

  const resetConfigForm = () => {
    setConfigFormData({
      setor: '',
      nome: '',
      configuracoes: {},
      updated_by: user?.name || ''
    });
  };

  const openUserModal = (userToEdit = null) => {
    if (userToEdit) {
      setUserFormData({
        email: userToEdit.email,
        name: userToEdit.name,
        password: '',
        role: userToEdit.role,
        allowed_cities: userToEdit.allowed_cities || [],
        allowed_sectors: userToEdit.allowed_sectors || []
      });
      setSelectedUser(userToEdit);
      setIsEditingUser(true);
    } else {
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role) => {
    return role === 'admin' ? 'Administrador' : 'Colaborador';
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-red-500/20 text-red-400' 
      : 'bg-blue-500/20 text-blue-400';
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="glass-intense rounded-2xl p-6 border-cosmic">
          <h1 className="text-3xl font-bold neon-text flex items-center">
            <Settings className="w-8 h-8 mr-3 text-red-400" />
            ⚙️ Configurações do Sistema
          </h1>
          <p className="text-gray-400 mt-2">
            Configurações gerais e preferências
          </p>
        </div>
        
        <div className="glass-intense rounded-2xl p-8 border-cosmic text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl neon-text-white mb-4">Acesso Restrito</h2>
          <p className="text-gray-400">
            Apenas administradores podem acessar as configurações do sistema
          </p>
        </div>
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
              <Settings className="w-8 h-8 mr-3 text-red-400" />
              ⚙️ Configurações do Sistema
            </h1>
            <p className="text-gray-400 mt-2">
              Gerenciamento completo do sistema CRM
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 status-online rounded-full"></div>
            <span className="text-sm text-gray-300">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-intense rounded-2xl border-cosmic overflow-hidden">
        <div className="flex border-b border-gray-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-4 flex items-center justify-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600/20 to-red-500/20 border-b-2 border-red-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold neon-text-white">Gestão de Usuários</h2>
                  <p className="text-gray-400 text-sm">Adicionar, editar e gerenciar usuários do sistema</p>
                </div>
                <button
                  onClick={() => openUserModal()}
                  className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Novo Usuário</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-futuristic w-full pl-10 pr-4 py-3 rounded-xl"
                />
              </div>

              {/* Users Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-light rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total de Usuários</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div className="glass-light rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Administradores</p>
                      <p className="text-2xl font-bold text-red-400">
                        {users.filter(u => u.role === 'admin').length}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-red-400" />
                  </div>
                </div>
                <div className="glass-light rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-green-400">
                        {users.filter(u => u.is_active).length}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="glass-light rounded-xl overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mr-4"></div>
                    <span className="text-gray-300">Carregando usuários...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-futuristic">
                      <thead>
                        <tr className="text-left border-b border-gray-700/50">
                          <th className="px-6 py-4 text-gray-300 font-semibold">Usuário</th>
                          <th className="px-6 py-4 text-gray-300 font-semibold">Papel</th>
                          <th className="px-6 py-4 text-gray-300 font-semibold">Cidades</th>
                          <th className="px-6 py-4 text-gray-300 font-semibold">Setores</th>
                          <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                          <th className="px-6 py-4 text-gray-300 font-semibold text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                              Nenhum usuário encontrado
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((userData) => (
                            <tr key={userData.id} className="border-t border-gray-700/50">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-white font-medium">{userData.name}</p>
                                  <p className="text-gray-400 text-sm">{userData.email}</p>
                                  <p className="text-gray-500 text-xs">
                                    Criado: {formatDate(userData.created_at)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                                  {getRoleLabel(userData.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {userData.allowed_cities?.length > 0 ? (
                                    userData.allowed_cities.map(city => (
                                      <span key={city} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg capitalize">
                                        {city}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">Todas</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {userData.allowed_sectors?.length > 0 ? (
                                    userData.allowed_sectors.map(sector => (
                                      <span key={sector} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg capitalize">
                                        {sector}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">Todos</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleUserStatus(userData.id, userData.is_active)}
                                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                                    userData.is_active
                                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  } transition-all`}
                                >
                                  {userData.is_active ? (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      <span>Ativo</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3 h-3" />
                                      <span>Inativo</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => openUserModal(userData)}
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
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold neon-text-white">Configurações do Sistema</h2>
                  <p className="text-gray-400 text-sm">Configurações gerais por setor</p>
                </div>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nova Configuração</span>
                </button>
              </div>

              <div className="glass-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Informações do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Versão do Sistema</label>
                      <p className="text-white font-medium">Macedo SI v1.0.0</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Última Atualização</label>
                      <p className="text-white font-medium">{formatDate(new Date())}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Banco de Dados</label>
                      <p className="text-white font-medium">MongoDB (Conectado)</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Desenvolvedor</label>
                      <p className="text-white font-medium">Isaias Macedo</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Empresa</label>
                      <p className="text-white font-medium">Macedo Business Solutions</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 status-online rounded-full"></div>
                        <span className="text-green-400 font-medium">Sistema Operacional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold neon-text-white">Configurações de Segurança</h2>
                <p className="text-gray-400 text-sm">Políticas de senha e autenticação</p>
              </div>

              <div className="glass-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Políticas de Autenticação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Expiração de Token JWT</p>
                      <p className="text-gray-400 text-sm">Tempo de vida dos tokens de acesso</p>
                    </div>
                    <span className="text-green-400 font-medium">30 dias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Controle de Acesso</p>
                      <p className="text-gray-400 text-sm">Baseado em papéis e cidades</p>
                    </div>
                    <span className="text-green-400 font-medium">Ativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Criptografia de Senhas</p>
                      <p className="text-gray-400 text-sm">Algoritmo de hash bcrypt</p>
                    </div>
                    <span className="text-green-400 font-medium">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold neon-text-white">Integrações e APIs</h2>
                <p className="text-gray-400 text-sm">Configurar integrações com serviços externos</p>
              </div>

              <div className="glass-light rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">APIs Disponíveis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">API REST Principal</p>
                        <p className="text-gray-400 text-sm">http://localhost:8001/api</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 status-online rounded-full"></div>
                      <span className="text-green-400 text-sm">Ativo</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">MongoDB</p>
                        <p className="text-gray-400 text-sm">Banco de dados principal</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 status-online rounded-full"></div>
                      <span className="text-green-400 text-sm">Conectado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-intense rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">
                {isEditingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={isEditingUser ? handleUpdateUser : handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="email@exemplo.com"
                    disabled={isEditingUser}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isEditingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                  </label>
                  <input
                    type="password"
                    required={!isEditingUser}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                    placeholder="Senha segura"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Papel no Sistema *
                  </label>
                  <select
                    required
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                    className="input-futuristic w-full px-4 py-3 rounded-xl"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cidades Permitidas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {cities.map(city => (
                    <label key={city} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userFormData.allowed_cities.includes(city)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserFormData({
                              ...userFormData,
                              allowed_cities: [...userFormData.allowed_cities, city]
                            });
                          } else {
                            setUserFormData({
                              ...userFormData,
                              allowed_cities: userFormData.allowed_cities.filter(c => c !== city)
                            });
                          }
                        }}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <span className="text-gray-300 capitalize">{city}</span>
                    </label>
                  ))}
                </div>
                {userFormData.role === 'admin' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Administradores têm acesso a todas as cidades automaticamente
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Setores Permitidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sectors.map(sector => (
                    <label key={sector} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userFormData.allowed_sectors.includes(sector)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserFormData({
                              ...userFormData,
                              allowed_sectors: [...userFormData.allowed_sectors, sector]
                            });
                          } else {
                            setUserFormData({
                              ...userFormData,
                              allowed_sectors: userFormData.allowed_sectors.filter(s => s !== sector)
                            });
                          }
                        }}
                        className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                      />
                      <span className="text-gray-300 capitalize">{sector}</span>
                    </label>
                  ))}
                </div>
                {userFormData.role === 'admin' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Administradores têm acesso a todos os setores automaticamente
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-futuristic px-6 py-3 rounded-xl text-white font-medium"
                >
                  {isEditingUser ? 'Atualizar' : 'Criar'} Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;