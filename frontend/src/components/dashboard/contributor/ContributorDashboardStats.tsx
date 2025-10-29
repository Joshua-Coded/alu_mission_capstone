"use client";
import React, { useEffect, useState } from "react";
import contributionApi, { ContributionStats } from "@/lib/contributionApi";
import { useRouter } from "next/navigation";
import { Project, projectApi } from "@/lib/projectApi";

interface DashboardStats extends ContributionStats {
  activeProjects: number;
}

const ContributorDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch contribution stats
      const statsResult = await contributionApi.getMyStats();
      
      // Fetch recent contributions
      const contributionsResult = await contributionApi.getMyContributions(1, 5);
      
      // Fetch active projects
      const projects = await projectApi.getVerifiedProjects();
      const activeProjects = projects.filter(p => p.status === 'active');

      if (statsResult.success && statsResult.data) {
        setStats({
          ...statsResult.data,
          activeProjects: activeProjects.length,
        });

        if (contributionsResult.success && contributionsResult.data) {
          setRecentContributions(contributionsResult.data.contributions || []);
        }

        setRecentProjects(activeProjects.slice(0, 6));
      } else {
        setError(statsResult.error || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatMatic = (amount: number | undefined) => {
    if (!amount || isNaN(amount)) {
      return '0.0000 MATIC';
    }
    return `${amount.toFixed(4)} MATIC`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Contributor Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your contributions and discover new projects</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contributions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalContributions || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contributed</p>
                <p className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
                  {formatMatic(stats?.totalAmountMatic || 0)}
                  <span className="text-purple-600">⬡</span>
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects Supported</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.projectsSupported || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.activeProjects || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => router.push('/projects/active')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 hover:from-green-600 hover:to-green-700 transition-all shadow-md text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Browse Projects</h3>
                <p className="text-green-100 mt-1">Discover active projects</p>
              </div>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => router.push('/contributions/history')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">My Contributions</h3>
                <p className="text-blue-100 mt-1">View contribution history</p>
              </div>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </button>

          <button 
            onClick={() => router.push('/projects/favorites')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all shadow-md text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Favorites</h3>
                <p className="text-purple-100 mt-1">View saved projects</p>
              </div>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </button>
        </div>

        {/* Recent Contributions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Contributions</h2>
          </div>
          <div className="p-6">
            {recentContributions && recentContributions.length > 0 ? (
              <div className="space-y-4">
                {recentContributions.map((contribution) => (
                  <div 
                    key={contribution._id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/projects/${contribution.project._id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{contribution.project?.title || 'Project'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg font-semibold text-purple-600 flex items-center gap-1">
                          {formatMatic(contribution.amountMatic)}
                          <span className="text-purple-500">⬡</span>
                        </p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-600">
                          {new Date(contribution.contributedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      contribution.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      contribution.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {contribution.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-2 text-gray-600">No contributions yet</p>
                <button 
                  onClick={() => router.push('/projects/active')}
                  className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Start Contributing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Featured Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Featured Projects</h2>
            <button 
              onClick={() => router.push('/projects/active')}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProjects.map((project) => {
                  const progress = (project.currentFunding / project.fundingGoal) * 100;
                  return (
                    <button
                      key={project._id}
                      onClick={() => router.push(`/projects/${project._id}`)}
                      className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow text-left"
                    >
                      <div className="h-48 bg-gray-200">
                        {project.images && project.images.length > 0 ? (
                          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            {formatMatic(project.currentFunding)}
                            <span className="text-purple-600">⬡</span>
                          </span>
                          <span className="text-gray-900 font-medium flex items-center gap-1">
                            Goal: {formatMatic(project.fundingGoal)}
                            <span className="text-purple-600">⬡</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No projects available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;