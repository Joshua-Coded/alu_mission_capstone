import { useCallback, useEffect, useState } from "react";
import { Activity, FarmStats, FarmerData, Project } from "../types/farmer";

export const useFarmerData = (farmerId?: string) => {
  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<FarmStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmerData = useCallback(async () => {
      if (!farmerId) return;
      
      setIsLoading(true);
      try {
        // This would be replaced with actual API calls
        const [farmerRes, projectsRes, activitiesRes, statsRes] = await Promise.all([
          fetch(`/api/farmers/${farmerId}`),
          fetch(`/api/farmers/${farmerId}/projects`),
          fetch(`/api/farmers/${farmerId}/activities`),
          fetch(`/api/farmers/${farmerId}/stats`)
        ]);

        if (!farmerRes.ok || !projectsRes.ok || !activitiesRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch farmer data');
        }

        const [farmerData, projectsData, activitiesData, statsData] = await Promise.all([
          farmerRes.json(),
          projectsRes.json(),
          activitiesRes.json(),
          statsRes.json()
        ]);

        setFarmer(farmerData);
        setProjects(projectsData);
        setActivities(activitiesData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }, [farmerId]);

  useEffect(() => {
    fetchFarmerData();
  }, [fetchFarmerData]);

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      throw err;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      throw err;
    }
  };

  return {
    farmer,
    projects,
    activities,
    stats,
    isLoading,
    error,
    createProject,
    updateProject,
    refetch: fetchFarmerData
  };
};
