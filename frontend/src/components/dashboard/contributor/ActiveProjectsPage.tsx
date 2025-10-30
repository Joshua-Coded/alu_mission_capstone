"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Image } from "@chakra-ui/react";
import { Project, projectApi } from "../../../lib/projectApi";

// import { Project, xprojectApi } from "../../../lib/projectApi";

const ActiveProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'funded' | 'goal'>('recent');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'POULTRY_FARMING', label: 'Poultry Farming' },
    { value: 'CROP_PRODUCTION', label: 'Crop Production' },
    { value: 'LIVESTOCK_FARMING', label: 'Livestock Farming' },
    { value: 'FISH_FARMING', label: 'Fish Farming' },
    { value: 'VEGETABLE_FARMING', label: 'Vegetable Farming' },
    { value: 'FRUIT_FARMING', label: 'Fruit Farming' },
    { value: 'AGRO_PROCESSING', label: 'Agro Processing' },
    { value: 'SUSTAINABLE_AGRICULTURE', label: 'Sustainable Agriculture' },
    { value: 'ORGANIC_FARMING', label: 'Organic Farming' },
  ];

  const filterAndSortProjects = useCallback(() => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((project) => project.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter((project) => project.location === selectedLocation);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'funded':
          return (b.currentFunding || 0) - (a.currentFunding || 0);
        case 'goal':
          return (b.fundingGoal || 0) - (a.fundingGoal || 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory, selectedLocation, sortBy]);

  useEffect(() => {
    fetchProjects();
    filterAndSortProjects();
  }, [filterAndSortProjects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ FIXED: Use the correct API method with proper error handling
      const data = await projectApi.getVerifiedProjects();
      
      // ✅ FIXED: Filter for active AND verified projects (both can receive contributions)
      const activeProjects = data.filter(p => 
        p.status === 'active' || p.status === 'verified'
      );
      
      setProjects(activeProjects);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } else {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getUniqueLocations = () => {
    const locations = [...new Set(projects.map((p) => p.location))].filter(Boolean);
    return ['all', ...locations];
  };

  const formatMatic = (amount: number) => {
    return `${amount.toFixed(4)} MATIC`;
  };

  const calculateProgress = (current: number, goal: number) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  // ✅ ADDED: Check if project is ready for blockchain contributions
  const isProjectBlockchainReady = (project: Project) => {
    return project.blockchainStatus === 'created' && project.blockchainProjectId !== undefined;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading active projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchProjects} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">Active Projects</h1>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full flex items-center gap-2">
              <span className="text-purple-300">⬡</span> Polygon
            </span>
          </div>
          <p className="text-green-100 text-lg">Discover and support agricultural projects with MATIC on Polygon</p>
          <div className="mt-4 flex items-center gap-6 text-green-100 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span>Funds in Smart Contract</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Automatic Release</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {getUniqueLocations().slice(1).map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'funded' | 'goal')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="funded">Most Funded</option>
                <option value="goal">Highest Goal</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-green-600">{filteredProjects.length}</span> of <span className="font-semibold">{projects.length}</span> active projects
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const currentFunding = project.currentFunding || 0;
              const fundingGoal = project.fundingGoal || 0;
              const progress = calculateProgress(currentFunding, fundingGoal);
              const isFullyFunded = progress >= 100;
              const isBlockchainReady = isProjectBlockchainReady(project);
              
              return (
                <div key={project._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Project Image */}
                  <div className="h-56 bg-gradient-to-br from-green-100 to-green-50 relative">
                    {project.images && project.images.length > 0 ? (
                      <Image src={project.images[0]} alt={project.title} width={500} height={500} style={{objectFit: 'cover'}} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {isFullyFunded ? (
                        <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                          🎉 Fully Funded!
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg">
                          {project.status === 'verified' ? 'Verified' : 'Active'}
                        </span>
                      )}
                    </div>
                    
                    {isBlockchainReady && (
                      <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded flex items-center gap-1 shadow-lg">
                          <span className="text-purple-200">⬡</span>
                          On-Chain #{project.blockchainProjectId}
                        </span>
                      </div>
                    )}
                    
                    {!isBlockchainReady && (
                      <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded flex items-center gap-1 shadow-lg">
                          ⚡ Processing
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    {/* Category & Location */}
                    <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {project.category.replace(/_/g, ' ')}
                        {/* {projectApi.getCategoryDisplayName?.(project.category) || project.category.replace(/_/g, ' ')} */}
                    </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {project.location}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
                      {project.description}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="text-purple-600">⬡</span>
                          {formatMatic(currentFunding)}
                        </span>
                        <span className={`font-semibold ${isFullyFunded ? 'text-purple-600' : 'text-gray-600'}`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${isFullyFunded ? 'bg-purple-600' : 'bg-green-600'}`}
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          Goal: <span className="font-medium text-gray-700">{formatMatic(fundingGoal)}</span>
                          <span className="text-purple-600">⬡</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          {project.contributorsCount || 0} backers
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`/projects/${project._id}`}
                        className="flex-1 text-center px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                      >
                        View Details
                      </a>
                      <a
                        href={`/projects/${project._id}/contribute`}
                        className={`flex-1 text-center px-4 py-2.5 rounded-lg transition-colors font-medium ${
                          isFullyFunded 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : !isBlockchainReady
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        onClick={(e) => {
                          if (!isBlockchainReady) {
                            e.preventDefault();
                            alert('This project is still being deployed to the blockchain. Please check back soon.');
                          }
                        }}
                      >
                        {isFullyFunded ? 'View Project' : 
                         !isBlockchainReady ? 'Deploying...' : 'Contribute'}
                      </a>
                    </div>

                    {/* Farmer Wallet */}
                    {project.farmerWalletAddress && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Farmer Wallet:
                          </span>
                          <code className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-mono">
                            {project.farmerWalletAddress.slice(0, 6)}...{project.farmerWalletAddress.slice(-4)}
                          </code>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
              }}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjectsPage;