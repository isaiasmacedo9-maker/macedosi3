import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import ClientsList from "./components/Clients/ClientsList";
import FinancialClients from "./components/Clients/FinancialClients";
import ContasReceber from "./components/Financial/ContasReceber";
import Trabalhista from "./components/Trabalhista/Trabalhista";
import Fiscal from "./components/Fiscal/Fiscal";
import Atendimento from "./components/Atendimento/Atendimento";
import Configuracoes from "./components/Configuracoes/Configuracoes";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App min-h-screen bg-futuristic">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/clientes" element={<ClientsList />} />
                      <Route path="/clientes-financeiro" element={<FinancialClients />} />
                      <Route path="/contas-receber" element={<ContasReceber />} />
                      <Route path="/trabalhista" element={<Trabalhista />} />
                      <Route path="/fiscal" element={<Fiscal />} />
                      <Route path="/atendimento" element={<Atendimento />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster 
            theme="dark" 
            position="top-right"
            toastOptions={{
              style: {
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(0, 0, 0, 0.95))',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#ffffff',
                boxShadow: '0 0 15px rgba(220, 38, 38, 0.2)',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
