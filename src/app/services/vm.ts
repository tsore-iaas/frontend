const API_URL = 'http://127.0.0.1:8001';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export interface VMTemplate {
  cpu: number;
  ram: number;
  storage: number;
  kernel_image: string;
  rootfs_image: string;
  hostname?: string;
  ssh_key?: string;
}

export interface CreateVMRequest {
  user_id: number;
  ip_addr: string;
  hostname: string;
  ssh_key: string;
  gateway: string;
  template: VMTemplate;
}

export interface VirtualMachine {
  id: number;
  user_id: number;
  hostname: string;
  ip_addr: string;
  gateway: string;
  ssh_key?: string;
  status: string;
  template: VMTemplate;
}

export interface OSOption {
  id: string;
  name: string;
  description: string;
  kernel_image: string;
  rootfs_image: string;
  icon: string;
}

export interface VMSize {
  id: string;
  name: string;
  description: string;
  cpu: number;
  ram: number;
  storage: number;
  price: string;
}

// Données statiques pour les systèmes d'exploitation disponibles
export const availableOS: OSOption[] = [
  {
    id: 'ubuntu-20.04',
    name: 'Ubuntu 20.04 LTS',
    description: 'Ubuntu 20.04 LTS (Focal Fossa)',
    kernel_image: '/var/lib/firecracker/hello/hello-vmlinux.bin',
    rootfs_image: '/var/lib/firecracker/hello/hello-rootfs.ext4',
    icon: '/images/ubuntu.svg'
  },
  {
    id: 'debian-11',
    name: 'Debian 11',
    description: 'Debian 11 (Bullseye)',
    kernel_image: '/var/lib/firecracker/hello/hello-vmlinux.bin',
    rootfs_image: '/var/lib/firecracker/hello/hello-rootfs.ext4',
    icon: '/images/debian.svg'
  }
];

// Données statiques pour les tailles de VM disponibles
export const vmSizes: VMSize[] = [
  {
    id: 'micro',
    name: 'Micro',
    description: 'Idéal pour les tests et le développement',
    cpu: 1,
    ram: 1024,
    storage: 2,
    price: '5€/mois'
  },
  {
    id: 'small',
    name: 'Small',
    description: 'Pour les applications légères',
    cpu: 2,
    ram: 2048,
    storage: 5,
    price: '10€/mois'
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Pour les applications de production',
    cpu: 4,
    ram: 4096,
    storage: 10,
    price: '20€/mois'
  },
  {
    id: 'large',
    name: 'Large',
    description: 'Pour les applications exigeantes',
    cpu: 8,
    ram: 8192,
    storage: 20,
    price: '40€/mois'
  }
];

export const vmService = {
  async createVM(request: CreateVMRequest): Promise<any> {
    const response = await fetch(`${API_URL}/vms`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create VM');
    }

    return response.json();
  },

  async deleteVM(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/vms/${id}`, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete VM');
    }
  },

  async getVM(id: string): Promise<VirtualMachine> {
    const response = await fetch(`${API_URL}/vms/${id}`, {
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch VM');
    }

    return response.json();
  },

  async startVM(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/vms/${id}/start`, {
      method: 'POST',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to start VM');
    }
  },

  async stopVM(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/vms/${id}/stop`, {
      method: 'POST',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to stop VM');
    }
  }
};

export const getVMs = async (userId: number): Promise<VirtualMachine[]> => {
  const response = await fetch(`http://127.0.0.1:8001/vms?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
    throw new Error(errorData.message || 'Échec de la récupération des VMs');
  }

  const data = await response.json();
  return data;
};

export const deleteVM = async (vmId: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8001/vms/${vmId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
    throw new Error(errorData.message || 'Échec de la suppression de la VM');
  }
};

export const createVM = async (request: CreateVMRequest) => {
  const response = await fetch('http://127.0.0.1:8001/vms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
    throw new Error(errorData.message || 'Échec de la création de la VM');
  }

  const data = await response.json();
  return data;
};

export const getVM = async (id: string): Promise<VirtualMachine> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return vmService.getVM(id);
};

export const startVM = async (id: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return vmService.startVM(id);
};

export const stopVM = async (id: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return vmService.stopVM(id);
};
