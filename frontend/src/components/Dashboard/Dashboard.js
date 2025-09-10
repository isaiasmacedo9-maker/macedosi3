import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  MessageSquare,
  CheckSquare
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    financial: { total_aberto: 0, total_atrasado: 0, total_recebido: 0 },
    trabalhista: { status_stats: {}, type_stats: {} },
    tasks: { status_stats: {}, priority_stats: {}, category_stats: {} }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch financial stats if user has access
        if (user?.role === 'admin' || user?.allowed_sectors?.includes('financeiro')) {
          try {
            const financialResponse = await axios.get(`${API_URL}/api/financial/dashboard-stats`);
            setStats(prev => ({ ...prev, financial: financialResponse.data }));
          } catch (error) {
            console.error('Error fetching financial stats:', error);
          }
        }

        // Fetch trabalhista stats if user has access
        if (user?.role === 'admin' || user?.allowed_sectors?.includes('trabalhista')) {
          try {
            const trabalhistaResponse = await axios.get(`${API_URL}/api/trabalhista/stats/dashboard`);
            setStats(prev => ({ ...prev, trabalhista: trabalhistaResponse.data }));
          } catch (error) {
            console.error('Error fetching trabalhista stats:', error);
          }
        }

        // Fetch tasks stats
        try {
          const tasksResponse = await axios.get(`${API_URL}/api/tasks/stats/dashboard`);
          setStats(prev => ({ ...prev, tasks: tasksResponse.data }));
        } catch (error) {
          console.error('Error fetching tasks stats:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, emoji }) => (
    <div className="glass-intense rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-400 mb-1 flex items-center">
        <span className="mr-2">{emoji}</span>
        {title}
      </h3>
      <p className="text-2xl font-bold neon-text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const ActivityItem = ({ icon: Icon, title, description, time, status, emoji }) => (
    <div className="flex items-center space-x-4 p-4 glass-light rounded-xl card-hover">
      <div className={`p-2 rounded-lg ${status === 'success' ? 'bg-green-500/20' : status === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
        <Icon className={`w-5 h-5 ${status === 'success' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`} />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white flex items-center">
          <span className="mr-2">{emoji}</span>
          {title}
        </h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="flex items-center justify-center h-64">
          <div className="glass-intense rounded-2xl p-8 text-center">
            <div className="spinner w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">⚡ Carregando dashboard...</p>
          </div>
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
              👋 Bem-vindo, {user?.name}! 
            </h1>
            <p className="text-gray-400 mt-2 flex items-center">
              📊 Dashboard do Sistema - {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 status-online rounded-full"></div>
            <span className="text-sm text-gray-300">🏠 Sistema Integrado Local</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(user?.role === 'admin' || user?.allowed_sectors?.includes('financeiro')) && (
          <>
            <StatCard
              title="Total em Aberto"
              value={formatCurrency(stats.financial.total_aberto)}
              icon={DollarSign}
              color="bg-gradient-to-br from-red-600 via-red-500 to-red-700 glow-red-intense"
              subtitle="Contas a receber"
              emoji="💰"
            />
            <StatCard
              title="Total Atrasado"
              value={formatCurrency(stats.financial.total_atrasado)}
              icon={AlertTriangle}
              color="bg-gradient-to-br from-yellow-500 to-orange-600 glow-red"
              subtitle="Pendências"
              emoji="⚠️"
            />
            <StatCard
              title="Total Recebido"
              value={formatCurrency(stats.financial.total_recebido)}
              icon={CheckCircle}
              color="bg-gradient-to-br from-green-500 to-emerald-600 glow-red"
              trend="+12%"
              subtitle="Este mês"
              emoji="✅"
            />
          </>
        )}

        {(user?.role === 'admin' || user?.allowed_sectors?.includes('trabalhista')) && (
          <StatCard
            title="Solicitações Pendentes"
            value={stats.trabalhista.status_stats?.pendente || 0}
            icon={FileText}
            color="bg-gradient-to-br from-blue-500 to-cyan-600 glow-red"
            subtitle="Trabalhista"
            emoji="📋"
          />
        )}

        <StatCard
          title="Tarefas Pendentes"
          value={stats.tasks.status_stats?.pendente || 0}
          icon={CheckSquare}
          color="bg-gradient-to-br from-indigo-500 to-purple-600 glow-red-intense"
          subtitle="Tarefas do sistema"
          emoji="📝"
        />

        <StatCard
          title="Total de Clientes"
          value="156"
          icon={Users}
          color="bg-gradient-to-br from-purple-500 to-violet-600 glow-red-intense"
          trend="+8%"
          subtitle="Ativos"
          emoji="🏢"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="glass-intense rounded-2xl p-6 border-cosmic">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold neon-text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-red-400" />
                📈 Atividade Recente
              </h2>
              <button className="text-sm text-red-400 hover:text-red-300 transition-all">
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              <ActivityItem
                icon={Users}
                title="Novo cliente cadastrado"
                description="Padaria São José foi adicionado ao sistema"
                time="2h atrás"
                status="success"
                emoji="🆕"
              />
              <ActivityItem
                icon={DollarSign}
                title="Pagamento recebido"
                description="R$ 1.350,00 - Auto Peças Norte Ltda"
                time="4h atrás"
                status="success"
                emoji="💸"
              />
              <ActivityItem
                icon={FileText}
                title="Solicitação trabalhista"
                description="Nova admissão pendente de análise"
                time="6h atrás"
                status="warning"
                emoji="⏳"
              />
              <ActivityItem
                icon={Building2}
                title="Sistema atualizado"
                description="Módulo fiscal foi atualizado com sucesso"
                time="1d atrás"
                status="info"
                emoji="🔄"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-intense rounded-2xl p-6 border-cosmic">
            <h2 className="text-lg font-semibold neon-text-white mb-4 flex items-center">
              ⚡ Ações Rápidas
            </h2>
            <div className="space-y-3">
              <button className="w-full btn-futuristic py-3 rounded-xl text-white font-medium">
                ➕ Novo Cliente
              </button>
              <button className="w-full glass-light py-3 rounded-xl text-gray-300 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all">
                💰 Conta a Receber
              </button>
              <button className="w-full glass-light py-3 rounded-xl text-gray-300 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all">
                📋 Nova Solicitação
              </button>
              <button className="w-full glass-light py-3 rounded-xl text-gray-300 hover:text-white border border-red-500/30 hover:border-red-500/60 transition-all">
                ✅ Nova Tarefa
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="glass-intense rounded-2xl p-6 border-cosmic">
            <h2 className="text-lg font-semibold neon-text-white mb-4 flex items-center">
              🖥️ Status do Sistema
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center">
                  💾 Banco de Dados
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 status-online rounded-full"></div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center">
                  ⚡ API Backend
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 status-online rounded-full"></div>
                  <span className="text-xs text-green-400">Ativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center">
                  💾 Backup Local
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 status-online rounded-full"></div>
                  <span className="text-xs text-green-400">Sincronizado</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 flex items-center">
                  🔄 Última Sync
                </span>
                <span className="text-xs text-gray-400">Agora</span>
              </div>
            </div>

            {/* Developer Credits */}
            <div className="border-t border-red-600/30 mt-6 pt-4 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Macedo SI - Sistema Offline Ready
              </p>
              <p className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                👨‍💻 Sistema Desenvolvido por Isaias Macedo
              </p>
              <p className="text-xs text-gray-600 flex items-center justify-center">
                🏢 Macedo Business Solutions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;