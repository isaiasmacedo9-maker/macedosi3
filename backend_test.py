#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Macedo SI CRM
Tests all modules: auth, clients, financial, trabalhista, fiscal, atendimento, chat, tasks
"""

import requests
import sys
import json
from datetime import datetime, date
from typing import Dict, Any, Optional

class MacedoSITester:
    def __init__(self, base_url="https://crm-codebase.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tokens = {}  # Store tokens for different users
        self.tests_run = 0
        self.tests_passed = 0
        self.current_user = None
        
        # Test credentials from init_database.py
        self.test_users = {
            "admin": {
                "email": "admin@macedo.com.br",
                "password": "admin123",
                "expected_role": "admin",
                "expected_cities": ["jacobina", "ourolandia", "umburanas", "uberlandia"],
                "expected_sectors": ["comercial", "trabalhista", "fiscal", "financeiro", "contabil", "atendimento"]
            },
            "colaborador": {
                "email": "colaborador@macedo.com.br", 
                "password": "colab123",
                "expected_role": "colaborador",
                "expected_cities": ["jacobina"],
                "expected_sectors": ["financeiro", "contabil"]
            },
            "fiscal": {
                "email": "fiscal@macedo.com.br",
                "password": "fiscal123", 
                "expected_role": "colaborador",
                "expected_cities": ["ourolandia"],
                "expected_sectors": ["fiscal", "contabil"]
            }
        }

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, params: Optional[Dict] = None, 
                 user_type: Optional[str] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        # Add auth token if user specified
        if user_type and user_type in self.tokens:
            headers['Authorization'] = f'Bearer {self.tokens[user_type]}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        if user_type:
            print(f"   User: {user_type}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}...")

            try:
                response_data = response.json() if response.text else {}
            except:
                response_data = {"raw_response": response.text}

            return success, response_data

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("🏥 TESTING HEALTH ENDPOINTS")
        print("="*50)
        
        self.run_test("API Root", "GET", "/", 200)
        self.run_test("Health Check", "GET", "/health", 200)

    def test_authentication(self):
        """Test authentication for all user types"""
        print("\n" + "="*50)
        print("🔐 TESTING AUTHENTICATION")
        print("="*50)
        
        for user_type, credentials in self.test_users.items():
            print(f"\n--- Testing {user_type} login ---")
            
            success, response = self.run_test(
                f"Login {user_type}",
                "POST",
                "/auth/login",
                200,
                data={
                    "email": credentials["email"],
                    "password": credentials["password"]
                }
            )
            
            if success and 'access_token' in response:
                self.tokens[user_type] = response['access_token']
                user_data = response.get('user', {})
                
                # Verify user data
                if user_data.get('role') == credentials['expected_role']:
                    print(f"✅ Role verification passed: {user_data.get('role')}")
                else:
                    print(f"❌ Role mismatch: expected {credentials['expected_role']}, got {user_data.get('role')}")
                
                print(f"✅ Token stored for {user_type}")
            else:
                print(f"❌ Failed to get token for {user_type}")

        # Test /me endpoint for each user
        for user_type in self.tokens:
            self.run_test(f"Get Me - {user_type}", "GET", "/auth/me", 200, user_type=user_type)

    def test_clients_module(self):
        """Test clients CRUD operations"""
        print("\n" + "="*50)
        print("👥 TESTING CLIENTS MODULE")
        print("="*50)
        
        # Test with admin user
        admin_token = self.tokens.get('admin')
        if not admin_token:
            print("❌ No admin token available, skipping clients tests")
            return

        # Get existing clients
        success, clients_response = self.run_test(
            "Get All Clients", "GET", "/clients/", 200, user_type="admin"
        )
        
        if success:
            clients = clients_response.get('clients', [])
            print(f"✅ Found {len(clients)} existing clients")
            
            # Test client filters
            self.run_test("Filter by City", "GET", "/clients/", 200, 
                         params={"cidade": "jacobina"}, user_type="admin")
            self.run_test("Filter by Status", "GET", "/clients/", 200, 
                         params={"status": "ativa"}, user_type="admin")
            self.run_test("Search Clients", "GET", "/clients/", 200, 
                         params={"search": "Padaria"}, user_type="admin")

        # Test creating new client
        new_client_data = {
            "nome_empresa": "Teste Empresa Ltda",
            "nome_fantasia": "Teste Empresa",
            "status": "ativa",
            "cidade": "jacobina",
            "telefone": "(74) 3621-9999",
            "whatsapp": "(74) 98765-9999",
            "email": "teste@empresa.com.br",
            "responsavel": "João Teste",
            "cnpj": "99.999.999/0001-99",
            "forma_envio": "email",
            "codigo_iob": "IOB999",
            "novo_cliente": True,
            "tipo_empresa": "matriz",
            "endereco": {
                "logradouro": "Rua Teste, 999",
                "bairro": "Centro",
                "cep": "44700-999",
                "cidade": "Jacobina",
                "estado": "BA"
            },
            "tipo_regime": "simples"
        }
        
        success, create_response = self.run_test(
            "Create New Client", "POST", "/clients/", 200, 
            data=new_client_data, user_type="admin"
        )
        
        created_client_id = None
        if success and 'id' in create_response:
            created_client_id = create_response['id']
            print(f"✅ Created client with ID: {created_client_id}")
            
            # Test get specific client
            self.run_test(f"Get Client by ID", "GET", f"/clients/{created_client_id}", 
                         200, user_type="admin")
            
            # Test update client
            update_data = {"telefone": "(74) 3621-8888"}
            self.run_test("Update Client", "PUT", f"/clients/{created_client_id}", 
                         200, data=update_data, user_type="admin")

        # Test access control with colaborador user
        if 'colaborador' in self.tokens:
            print("\n--- Testing colaborador access control ---")
            self.run_test("Colaborador Get Clients", "GET", "/clients", 200, user_type="colaborador")
            
            # Try to create client in unauthorized city
            unauthorized_client = new_client_data.copy()
            unauthorized_client["cidade"] = "ourolandia"  # colaborador only has access to jacobina
            unauthorized_client["cnpj"] = "88.888.888/0001-88"
            
            self.run_test("Unauthorized City Access", "POST", "/clients", 403, 
                         data=unauthorized_client, user_type="colaborador")

    def test_financial_module(self):
        """Test financial module"""
        print("\n" + "="*50)
        print("💰 TESTING FINANCIAL MODULE")
        print("="*50)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available, skipping financial tests")
            return

        # Test dashboard stats
        self.run_test("Financial Dashboard Stats", "GET", "/financial/dashboard-stats", 
                     200, user_type="admin")

        # Test contas a receber
        self.run_test("Get Contas a Receber", "GET", "/financial/contas-receber", 
                     200, user_type="admin")
        
        # Test with filters
        self.run_test("Filter by Situacao", "GET", "/financial/contas-receber", 200, 
                     params={"situacao": "em_aberto"}, user_type="admin")
        
        # Test financial clients
        self.run_test("Get Financial Clients", "GET", "/financial/clients", 
                     200, user_type="admin")

        # Test creating new conta a receber
        new_conta_data = {
            "empresa_id": "test-empresa-id",
            "empresa": "Teste Empresa Ltda",
            "descricao": "Honorários contábeis - Teste",
            "documento": "NF-TEST001",
            "forma_pagamento": "boleto",
            "conta": "Banco do Brasil - CC 1234-5",
            "centro_custo": "Honorários Mensais",
            "plano_custo": "Receitas de Serviços",
            "data_emissao": "2025-01-15",
            "data_vencimento": "2025-02-15",
            "valor_original": 1000.00,
            "observacao": "Conta de teste",
            "cidade_atendimento": "jacobina",
            "usuario_responsavel": "Admin Teste"
        }
        
        success, create_conta_response = self.run_test(
            "Create Conta a Receber", "POST", "/financial/contas-receber", 
            200, data=new_conta_data, user_type="admin"
        )
        
        if success and 'id' in create_conta_response:
            conta_id = create_conta_response['id']
            print(f"✅ Created conta with ID: {conta_id}")
            
            # Test get specific conta
            self.run_test("Get Conta by ID", "GET", f"/financial/contas-receber/{conta_id}", 
                         200, user_type="admin")

        # Test access control with colaborador (has financial access)
        if 'colaborador' in self.tokens:
            print("\n--- Testing colaborador financial access ---")
            self.run_test("Colaborador Financial Access", "GET", "/financial/contas-receber", 
                         200, user_type="colaborador")

        # Test access control with fiscal user (no financial access)
        if 'fiscal' in self.tokens:
            print("\n--- Testing fiscal user financial access (should be denied) ---")
            self.run_test("Fiscal Financial Access Denied", "GET", "/financial/contas-receber", 
                         403, user_type="fiscal")

    def test_other_modules(self):
        """Test other modules (trabalhista, fiscal, atendimento, chat, tasks)"""
        print("\n" + "="*50)
        print("📋 TESTING OTHER MODULES")
        print("="*50)
        
        if 'admin' not in self.tokens:
            print("❌ No admin token available, skipping other modules tests")
            return

        # Test trabalhista module
        print("\n--- Testing Trabalhista Module ---")
        self.run_test("Get Trabalhista", "GET", "/trabalhista/", 200, user_type="admin")
        
        # Test fiscal module  
        print("\n--- Testing Fiscal Module ---")
        self.run_test("Get Fiscal", "GET", "/fiscal/", 200, user_type="admin")
        
        # Test atendimento module
        print("\n--- Testing Atendimento Module ---")
        self.run_test("Get Atendimento", "GET", "/atendimento/", 200, user_type="admin")
        
        # Test chat module
        print("\n--- Testing Chat Module ---")
        self.run_test("Get Chat", "GET", "/chat/", 200, user_type="admin")
        
        # Test tasks module
        print("\n--- Testing Tasks Module ---")
        self.run_test("Get Tasks", "GET", "/tasks/", 200, user_type="admin")
        
        # Test configuracoes module
        print("\n--- Testing Configuracoes Module ---")
        self.run_test("Get Configuracoes", "GET", "/configuracoes/", 200, user_type="admin")

    def test_permissions(self):
        """Test permission system thoroughly"""
        print("\n" + "="*50)
        print("🔒 TESTING PERMISSIONS SYSTEM")
        print("="*50)
        
        # Test fiscal user permissions (should only access fiscal and contabil)
        if 'fiscal' in self.tokens:
            print("\n--- Testing Fiscal User Permissions ---")
            
            # Should have access to fiscal
            self.run_test("Fiscal Access to Fiscal Module", "GET", "/fiscal", 200, user_type="fiscal")
            
            # Should NOT have access to financial
            self.run_test("Fiscal Denied Financial Access", "GET", "/financial/contas-receber", 
                         403, user_type="fiscal")
            
            # Should NOT have access to trabalhista
            self.run_test("Fiscal Denied Trabalhista Access", "GET", "/trabalhista", 
                         403, user_type="fiscal")

        # Test colaborador permissions (should only access financeiro and contabil)
        if 'colaborador' in self.tokens:
            print("\n--- Testing Colaborador User Permissions ---")
            
            # Should have access to financial
            self.run_test("Colaborador Access to Financial", "GET", "/financial/contas-receber", 
                         200, user_type="colaborador")
            
            # Should NOT have access to fiscal
            self.run_test("Colaborador Denied Fiscal Access", "GET", "/fiscal", 
                         403, user_type="colaborador")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("❌ SOME TESTS FAILED")
            return 1

def main():
    """Run all tests"""
    print("🚀 Starting Macedo SI CRM Backend API Tests")
    print("="*60)
    
    tester = MacedoSITester()
    
    try:
        # Run all test suites
        tester.test_health_check()
        tester.test_authentication()
        tester.test_clients_module()
        tester.test_financial_module()
        tester.test_other_modules()
        tester.test_permissions()
        
        return tester.print_summary()
        
    except Exception as e:
        print(f"\n❌ Critical error during testing: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())