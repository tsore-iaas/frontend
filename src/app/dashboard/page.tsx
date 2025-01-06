'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import { FiServer, FiCpu, FiHardDrive } from 'react-icons/fi';
import { createVM, getVMs, deleteVM } from '../services/vm';
import { toast } from 'react-hot-toast';

interface VMConfig {
  id: string;
  name: string;
  description: string;
  cpu: number;
  ram: number;
  storage: number;
  price: string;
}

interface OSOption {
  id: string;
  name: string;
  description: string;
  kernel: string;
  rootfs: string;
  icon: string;
}

interface VirtualMachine {
  id: number;
  hostname: string;
  ip_addr: string;
  status: string;
  template: {
    cpu: number;
    ram: number;
    storage: number;
  };
}

// Configurations prédéfinies pour les VMs
const VM_CONFIGS: VMConfig[] = [
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
  }
];

// Systèmes d'exploitation disponibles
const OS_OPTIONS: OSOption[] = [
  {
    id: 'ubuntu',
    name: 'Ubuntu 22.04 LTS',
    description: 'Distribution Linux stable et populaire',
    kernel: '/var/lib/firecracker/hello/hello-vmlinux.bin',
    rootfs: '/var/lib/firecracker/hello/hello-rootfs.ext4',
    icon: '/ubuntu.svg'
  },
  {
    id: 'debian',
    name: 'Debian 11',
    description: 'Distribution Linux robuste et fiable',
    kernel: '/var/lib/firecracker/hello/hello-vmlinux.bin',
    rootfs: '/var/lib/firecracker/hello/hello-rootfs.ext4',
    icon: '/debian.svg'
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<VMConfig | null>(null);
  const [selectedOS, setSelectedOS] = useState<OSOption | null>(null);
  const [hostname, setHostname] = useState('');
  const [sshKey, setSSHKey] = useState('');
  const [ipAddr, setIpAddr] = useState('');
  const [gateway, setGateway] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [vms, setVMs] = useState<VirtualMachine[]>([]);
  const [isLoadingVMs, setIsLoadingVMs] = useState(true);

  // Fonctions pour calculer les statistiques
  const calculateStats = (vms: VirtualMachine[]) => {
    return {
      activeVMs: vms.filter(vm => vm.status === 'running').length,
      totalCPU: vms.reduce((total, vm) => total + vm.template.cpu, 0),
      totalRAM: vms.reduce((total, vm) => total + vm.template.ram, 0) / 1024, // Conversion en GB
    };
  };

  // État pour les statistiques
  const [stats, setStats] = useState({ activeVMs: 0, totalCPU: 0, totalRAM: 0 });

  // Mise à jour des stats quand les VMs changent
  useEffect(() => {
    setStats(calculateStats(vms));
  }, [vms]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const fetchVMs = async () => {
    if (!user?.id) {
      return;
    }
    
    try {
      const fetchedVMs = await getVMs(user.id);
      setVMs(fetchedVMs);
    } catch (error) {
      console.error('Erreur lors de la récupération des VMs:', error);
      toast.error('Impossible de récupérer la liste des VMs');
    } finally {
      setIsLoadingVMs(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVMs();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCreateVM = async () => {
    if (!user?.id || !selectedConfig || !selectedOS || !hostname.trim() || !ipAddr.trim() || !gateway.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsCreating(true);
      const requestData = {
        user_id: user.id,
        ip_addr: ipAddr,
        gateway: gateway,
        hostname: hostname,
        ssh_key: sshKey,
        template: {
          cpu: selectedConfig.cpu,
          ram: selectedConfig.ram,
          storage: selectedConfig.storage,
          kernel_image: selectedOS.kernel,
          rootfs_image: selectedOS.rootfs
        }
      };
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      
      const response = await createVM(requestData);
      console.log('Response:', response);
      
      toast.success('Machine virtuelle créée avec succès !');
      setIsCreateSectionOpen(false);
      resetForm();
      fetchVMs(); // Rafraîchir la liste des VMs
    } catch (error) {
      console.error('Erreur lors de la création de la VM:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la VM');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteVM = async (vmId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette VM ?')) {
      try {
        await deleteVM(vmId);
        toast.success('VM supprimée avec succès');
        fetchVMs(); // Rafraîchir la liste des VMs
      } catch (error) {
        console.error('Erreur lors de la suppression de la VM:', error);
        toast.error('Erreur lors de la suppression de la VM');
      }
    }
  };

  const resetForm = () => {
    setSelectedConfig(null);
    setSelectedOS(null);
    setHostname('');
    setSSHKey('');
    setIpAddr('');
    setGateway('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header amélioré */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image src="/firecracker.svg" alt="Logo" width={32} height={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                IaaS4Firecracker
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Connecté en tant que</span>{' '}
                  <span className="text-black font-medium">{user.username}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section des statistiques améliorée */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiServer className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">VMs Actives</h3>
                <p className="text-3xl font-bold text-white">{stats.activeVMs}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiCpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">CPU Total</h3>
                <p className="text-3xl font-bold text-white">{stats.totalCPU} cores</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <FiHardDrive className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Mémoire Totale</h3>
                <p className="text-3xl font-bold text-white">{stats.totalRAM.toFixed(1)} GB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section de création de VM améliorée */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div
            className="px-6 py-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsCreateSectionOpen(!isCreateSectionOpen)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiServer className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Créer une nouvelle machine virtuelle</h2>
            </div>
            <div className={`transform transition-transform duration-200 ${isCreateSectionOpen ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {isCreateSectionOpen && (
            <div className="p-6 space-y-8">
              {/* Section OS */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Système d'exploitation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OS_OPTIONS.map((os) => (
                    <div
                      key={os.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedOS?.id === os.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOS(os)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 relative">
                          <Image src={os.icon} alt={os.name} layout="fill" objectFit="contain" />
                        </div>
                        <div>
                          <h4 className="text-base font-medium text-gray-900">{os.name}</h4>
                          <p className="text-sm text-gray-500">{os.description}</p>
                        </div>
                      </div>
                      {selectedOS?.id === os.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Configuration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {VM_CONFIGS.map((config) => (
                    <div
                      key={config.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedConfig?.id === config.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedConfig(config)}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-base font-medium text-gray-900">{config.name}</h4>
                          <span className="text-sm font-medium text-blue-600">{config.price}</span>
                        </div>
                        <p className="text-sm text-gray-500">{config.description}</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="block text-sm font-medium text-gray-900">{config.cpu}</span>
                            <span className="block text-xs text-gray-500">CPU</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="block text-sm font-medium text-gray-900">{config.ram / 1024}GB</span>
                            <span className="block text-xs text-gray-500">RAM</span>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <span className="block text-sm font-medium text-gray-900">{config.storage}GB</span>
                            <span className="block text-xs text-gray-500">SSD</span>
                          </div>
                        </div>
                      </div>
                      {selectedConfig?.id === config.id && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Configuration supplémentaire */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration supplémentaire</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="hostname" className="block text-sm font-medium text-black mb-1">
                      Nom d'hôte <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      id="hostname"
                      value={hostname}
                      onChange={(e) => setHostname(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-black"
                      placeholder="Entrez le nom d'hôte"
                    />
                  </div>
                  <div>
                    <label htmlFor="ipAddr" className="block text-sm font-medium text-black mb-1">
                      Adresse IP <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      id="ipAddr"
                      value={ipAddr}
                      onChange={(e) => setIpAddr(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-black"
                      placeholder="Entrez l'adresse IP"
                    />
                  </div>
                  <div>
                    <label htmlFor="gateway" className="block text-sm font-medium text-black mb-1">
                      Passerelle <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      id="gateway"
                      value={gateway}
                      onChange={(e) => setGateway(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-black"
                      placeholder="Entrez l'adresse de la passerelle"
                    />
                  </div>
                  <div>
                    <label htmlFor="sshKey" className="block text-sm font-medium text-black mb-1">
                      Clé SSH (optionnelle)
                    </label>
                    <textarea
                      id="sshKey"
                      value={sshKey}
                      onChange={(e) => setSSHKey(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200 text-black"
                      placeholder="Collez votre clé SSH publique ici"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de création */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreateVM}
                  disabled={isCreating || !selectedOS || !selectedConfig || !hostname.trim() || !ipAddr.trim() || !gateway.trim()}
                  className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 ${
                    isCreating || !selectedOS || !selectedConfig || !hostname.trim() || !ipAddr.trim() || !gateway.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-1'
                  }`}
                >
                  {isCreating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Création en cours...</span>
                    </div>
                  ) : (
                    'Créer la machine virtuelle'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des VMs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiServer className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Vos Machines Virtuelles</h2>
            </div>
          </div>

          <div className="p-6">
            {isLoadingVMs ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-transparent"></div>
              </div>
            ) : vms.length === 0 ? (
              // Message quand il n'y a pas de VMs
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FiServer className="h-12 w-12 text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune VM active</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  Vous n'avez pas encore de machines virtuelles. Créez votre première VM pour commencer.
                </p>
                <button
                  onClick={() => setIsCreateSectionOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer une VM
                </button>
              </div>
            ) : (
              // Liste des VMs
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vms.map((vm) => (
                  <div key={vm.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiServer className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{vm.hostname}</h3>
                            <p className="text-sm text-gray-500">{vm.ip_addr}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          vm.status === 'running' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vm.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <span className="block text-sm font-medium text-gray-900">{vm.template.cpu}</span>
                          <span className="block text-xs text-gray-500">CPU</span>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <span className="block text-sm font-medium text-gray-900">{vm.template.ram / 1024}GB</span>
                          <span className="block text-xs text-gray-500">RAM</span>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <span className="block text-sm font-medium text-gray-900">{vm.template.storage}GB</span>
                          <span className="block text-xs text-gray-500">SSD</span>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleDeleteVM(vm.id)}
                          className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-100 rounded-md transition-colors duration-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
