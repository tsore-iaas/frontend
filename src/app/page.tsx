"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import { LoginCredentials, RegisterData } from './services/auth';
import Image from 'next/image';
import { FiCloud, FiServer, FiUsers } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const { user, isLoading, login, register } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirection si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      setIsLoginModalOpen(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data);
      setIsRegisterModalOpen(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header moderne avec effet de verre */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo et nom */}
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 p-2 rounded-xl transition-all duration-300 ${
                scrolled ? 'bg-blue-50' : 'bg-white/10'
              }`}>
                <Image
                  src="/iaas.png"
                  alt="IaaS4Firecracker Logo"
                  width={36}
                  height={36}
                  className="rounded-lg transform hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex flex-col">
                <h1 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${
                  scrolled ? 'text-gray-900' : 'text-gray-900'
                }`}>
                  IaaS4Firecracker
                </h1>
                <span className={`text-sm transition-colors duration-300 ${
                  scrolled ? 'text-gray-600' : 'text-gray-700'
                }`}>
                  Cloud Infrastructure Made Simple
                </span>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  scrolled
                    ? 'text-gray-700 hover:text-blue-600'
                    : 'text-gray-900 hover:text-blue-600'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Inscription
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal avec effet de parallaxe */}
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              Infrastructure Cloud
              <span className="text-blue-600"> Moderne</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Déployez et gérez vos machines virtuelles en toute simplicité avec notre plateforme
              basée sur Firecracker. Une solution performante et sécurisée pour vos besoins en virtualisation.
            </p>

            {/* Cartes des fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <FiCloud className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Cloud Native</h3>
                <p className="text-gray-600">
                  Architecture moderne basée sur des conteneurs légers et performants.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <FiServer className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Haute Performance</h3>
                <p className="text-gray-600">
                  Virtualisation optimisée pour des performances maximales.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <FiUsers className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-utilisateurs</h3>
                <p className="text-gray-600">
                  Gestion avancée des utilisateurs et des permissions.
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-center space-x-6 mt-12">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Commencer maintenant
              </button>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
      
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister}
      />
    </main>
  );
}
