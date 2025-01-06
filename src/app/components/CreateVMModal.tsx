// "use client";

// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { createVM, CreateVMRequest, VMTemplate } from '../services/vm';

// interface CreateVMModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
// }

// export default function CreateVMModal({ isOpen, onClose, onSuccess }: CreateVMModalProps) {
//   const { user } = useAuth();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState<VMTemplate>({
//     cpu: 1,
//     ram: 1024,
//     storage: 2,
//     kernel_image: "/var/lib/firecracker/hello/hello-vmlinux.bin",
//     rootfs_image: "/var/lib/firecracker/hello/hello-rootfs.ext4"
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);

//     try {
//       if (!user) {
//         throw new Error('User not authenticated');
//       }

//       const request: CreateVMRequest = {
//         user_id: user.id,
//         template: formData
//       };

//       await createVM(request);
//       onSuccess?.();
//       onClose();
//     } catch (err) {
//       console.error('Error creating VM:', err);
//       setError(err instanceof Error ? err.message : 'Failed to create VM');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//       <div className="bg-white rounded-lg p-8 w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-indigo-600">Create New Virtual Machine</h2>
        
//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               CPU Cores
//             </label>
//             <select
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring focus:ring-indigo-500"
//               value={formData.cpu}
//               onChange={(e) => setFormData({ ...formData, cpu: parseInt(e.target.value) })}
//               disabled={isLoading}
//             >
//               {[1, 2, 4, 8].map((cores) => (
//                 <option key={cores} value={cores}>
//                   {cores} {cores === 1 ? 'Core' : 'Cores'}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               RAM (MB)
//             </label>
//             <select
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring focus:ring-indigo-500"
//               value={formData.ram}
//               onChange={(e) => setFormData({ ...formData, ram: parseInt(e.target.value) })}
//               disabled={isLoading}
//             >
//               {[512, 1024, 2048, 4096].map((ram) => (
//                 <option key={ram} value={ram}>
//                   {ram} MB
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Storage (GB)
//             </label>
//             <select
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring focus:ring-indigo-500"
//               value={formData.storage}
//               onChange={(e) => setFormData({ ...formData, storage: parseInt(e.target.value) })}
//               disabled={isLoading}
//             >
//               {[2, 5, 10, 20].map((storage) => (
//                 <option key={storage} value={storage}>
//                   {storage} GB
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Creating...
//                 </>
//               ) : (
//                 'Create VM'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
