// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  nom?: string;
  prenom?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const API_URL = 'http://localhost:8080/api';

export const authService = {
  // Inscription
  async register(data: RegisterData): Promise<void> {
    const response = await fetch(`${API_URL}/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erreur lors de l\'inscription');
    }
  },

  // Récupérer les informations de l'utilisateur
  async getUserInfo(token: string): Promise<User> {
    console.log('Récupération des informations utilisateur avec le token:', token);

    const response = await fetch(`${API_URL}/user/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Erreur lors de la récupération des informations utilisateur:', response.status, response.statusText);
      throw new Error('Impossible de récupérer les informations de l\'utilisateur');
    }

    const data = await response.json();
    console.log('Informations utilisateur reçues:', data);

    const user = {
      id: data.id,
      username: data.username,
      email: data.email || data.username,
      nom: data.nom || '',
      prenom: data.prenom || ''
    };

    console.log('Objet utilisateur créé:', user);
    return user;
  },

  // Connexion avec username et password
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    console.log('Tentative de connexion avec:', {
      username: credentials.username,
      password: '****'
    });

    const response = await fetch(`${API_URL}/user/signin`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de connexion:', errorText);
      throw new Error(errorText || 'Nom d\'utilisateur ou mot de passe incorrect');
    }

    const data = await response.json();
    console.log('Réponse du serveur après connexion:', data);

    // Vérifier si le token est dans la propriété Bearer
    if (!data.Bearer) {
      console.error('Token manquant dans la réponse');
      throw new Error('Token non reçu du serveur');
    }

    const token = data.Bearer;
    console.log('Token récupéré:', token);

    // Récupérer les informations de l'utilisateur avec le token
    console.log('Récupération des informations utilisateur...');
    const user = await this.getUserInfo(token);
    console.log('Informations utilisateur complètes:', user);

    // Stocker les informations utilisateur
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    console.log('Informations stockées dans le localStorage');

    // Retourner le token et l'utilisateur
    return { 
      token,
      user
    };
  },

  // Récupérer l'utilisateur courant depuis le localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      console.log('Utilisateur récupéré du localStorage:', user);
      return user;
    } catch (error) {
      console.error('Erreur lors de la lecture des données utilisateur:', error);
      return null;
    }
  },

  // Déconnexion
  logout(): void {
    console.log('Déconnexion de l\'utilisateur');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Données utilisateur supprimées du localStorage');
  }
};
