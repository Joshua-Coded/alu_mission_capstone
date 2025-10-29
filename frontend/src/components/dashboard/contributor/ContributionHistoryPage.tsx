// "use client";
// import React, { useEffect, useState } from "react";
// import contributionApi, { Contribution } from "@/lib/contributionApi";
// import { useRouter } from "next/navigation";

// const ContributionHistoryPage: React.FC = () => {
//   const router = useRouter();
//   const [contributions, setContributions] = useState<Contribution[]>([]);
//   const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalMatic, setTotalMatic] = useState(0);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchContributions();
//   }, [currentPage, statusFilter]);

//   useEffect(() => {
//     applyFilters();
//   }, [contributions, searchTerm]);

//   const fetchContributions = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const status = statusFilter !== 'all' ? statusFilter : undefined;
//       const result = await contributionApi.getMyContributions(currentPage, itemsPerPage, status);
      
//       if (result.success && result.data) {
//         setContributions(result.data.contributions);
//         setTotalPages(result.data.pages);
//         setTotalMatic(result.data.totalMatic || 0);
//       } else {
//         setError(result.error || 'Failed to load contributions');
//       }
//     } catch (err: any) {
//       console.error('Error fetching contributions:', err);
//       setError(err.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...contributions];

//     if (searchTerm) {
//       filtered = filtered.filter((c) => {
//         const projectTitle = c.project?.title?.toLowerCase() || '';
//         const txHash = c.transactionHash?.toLowerCase() || '';
//         const search = searchTerm.toLowerCase();
        
//         return projectTitle.includes(search) || txHash.includes(search);
//       });
//     }

//     setFilteredContributions(filtered);
//   };

//   const formatMatic = (amount: number | undefined) => {
//     if (!amount || isNaN(amount)) {
//       return '0.0000 MATIC';
//     }
//     return `${amount.toFixed(4)} MATIC`;
//   };

//   const getStatusBadge = (status: string) => {
//     const statusColors: Record<string, string> = {
//       confirmed: 'bg-green-100 text-green-800',
//       pending: 'bg-yellow-100 text-yellow-800',
//       failed: 'bg-red-100 text-red-800',
//     };
    
//     return (
//       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   const handleExportCSV = () => {
//     const csvData = filteredContributions.map(c => ({
//       Date: new Date(c.contributedAt).toLocaleDateString(),
//       Project: c.project?.title || 'N/A',
//       Amount: c.amountMatic,
//       Currency: 'MATIC',
//       Status: c.status,
//       TransactionHash: c.transactionHash || 'N/A',
//     }));

//     const headers = Object.keys(csvData[0]).join(',');
//     const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
//     const csv = `${headers}\n${rows}`;
    
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `contributions-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   if (loading && currentPage === 1) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading contributions...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//           <h3 className="text-red-800 font-semibold mb-2">Error Loading History</h3>
//           <p className="text-red-600">{error}</p>
//           <button 
//             onClick={fetchContributions} 
//             className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-white border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Contribution History</h1>
//               <p className="mt-2 text-gray-600">Track all your contributions and their status</p>
//             </div>
//             <button
//               onClick={() => router.back()}
//               className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
//             >
//               ← Back
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Contributions</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-2">{contributions.length}</p>
//               </div>
//               <div className="bg-blue-100 p-3 rounded-full">
//                 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Amount</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
//                   {formatMatic(totalMatic)}
//                   <span className="text-purple-600">⬡</span>
//                 </p>
//               </div>
//               <div className="bg-green-100 p-3 rounded-full">
//                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Confirmed</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-2">
//                   {contributions.filter((c) => c.status === 'confirmed').length}
//                 </p>
//               </div>
//               <div className="bg-purple-100 p-3 rounded-full">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

      
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
//               <input
//                 type="text"
//                 placeholder="Search by project or transaction..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => {
//                   setStatusFilter(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="confirmed">Confirmed</option>
//                 <option value="failed">Failed</option>
//               </select>
//             </div>

//             <div className="flex items-end">
//               <button 
//                 onClick={handleExportCSV}
//                 disabled={filteredContributions.length === 0}
//                 className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Export CSV
//               </button>
//             </div>
//           </div>
//         </div>

    
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             {filteredContributions.length > 0 ? (
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredContributions.map((contribution) => (
//                     <tr key={contribution._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/projects/${contribution.project._id}`)}>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(contribution.contributedAt).toLocaleDateString('en-US', {
//                           month: 'short',
//                           day: 'numeric',
//                           year: 'numeric',
//                         })}
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         <div className="font-medium text-gray-900">{contribution.project?.title || 'Unknown Project'}</div>
//                         <div className="text-gray-500 text-xs">{contribution.project?.category || ''}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-semibold text-purple-600 flex items-center gap-1">
//                           {formatMatic(contribution.amountMatic)}
//                           <span>⬡</span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         <span className="flex items-center">
//                           <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
//                           </svg>
//                           Polygon
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contribution.status)}</td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {contribution.transactionHash ? (
                          
//                             href={`https://polygonscan.com/tx/${contribution.transactionHash}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             onClick={(e) => e.stopPropagation()}
//                             className="text-blue-600 hover:text-blue-700 hover:underline font-mono flex items-center gap-1"
//                           >
//                             {contribution.transactionHash.substring(0, 10)}...
//                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                             </svg>
//                           </a>
//                         ) : (
//                           <span className="text-gray-400">Pending</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <div className="text-center py-12">
//                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//                 <p className="mt-2 text-gray-600">No contributions found</p>
//                 {(searchTerm || statusFilter !== 'all') && (
//                   <button
//                     onClick={() => {
//                       setSearchTerm('');
//                       setStatusFilter('all');
//                     }}
//                     className="mt-4 text-green-600 hover:text-green-700 font-medium"
//                   >
//                     Clear filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

         
//           {filteredContributions.length > 0 && totalPages > 1 && (
//             <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
//               <div className="flex-1 flex justify-between sm:hidden">
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages}
//                   className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//               <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                 <div>
//                   <p className="text-sm text-gray-700">
//                     Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
//                   </p>
//                 </div>
//                 <div>
//                   <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
//                     <button
//                       onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                       disabled={currentPage === 1}
//                       className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                     >
//                       <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                       </svg>
//                     </button>
//                     {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                       let pageNum: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | ((prevState: number) => number) | null | undefined;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setCurrentPage(pageNum)}
//                           className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                             currentPage === pageNum
//                               ? 'z-10 bg-green-50 border-green-500 text-green-600'
//                               : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                     <button
//                       onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                       disabled={currentPage === totalPages}
//                       className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                     >
//                       <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </button>
//                   </nav>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContributionHistoryPage;