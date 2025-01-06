"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { RegisterData } from '../services/auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: RegisterData) => Promise<void>;
}

export default function RegisterModal({ isOpen, onClose, onRegister }: RegisterModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: ''
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom
      };

      await onRegister(registerData);
      onClose();
      router.push('/');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl transform transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Créer un compte</h2>
          <p className="text-black">Rejoignez-nous dès maintenant</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-black mb-2">
                Nom
              </label>
              <input
                type="text"
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 text-black"
                placeholder="Votre nom"
                required
              />
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-black mb-2">
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 text-black"
                placeholder="Votre prénom"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 text-black"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 text-black"
              placeholder="Choisissez un nom d'utilisateur"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 text-black"
              placeholder="Choisissez un mot de passe sécurisé"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200 text-black"
              placeholder="Confirmez votre mot de passe"
              required
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]"
            >
              Créer mon compte
            </button>
            <p className="text-center text-sm text-black mt-4">
              En créant un compte, vous acceptez nos conditions d'utilisation
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
}
