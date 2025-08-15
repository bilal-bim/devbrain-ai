import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Users, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Avatar } from '@/components/atoms/Avatar';
import { useAppStore } from '@/stores';
import { cn, formatRelativeTime } from '@/utils';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAppStore();

  // Mock data for development
  const mockProjects = [
    {
      id: 'proj-1',
      name: 'Freelancer Invoice App',
      description: 'AI-powered invoicing solution for creative freelancers',
      status: 'active' as const,
      completionPercentage: 75,
      healthScore: 8.5,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      teamMembers: [
        { id: '1', name: 'You', avatar: null },
        { id: '2', name: 'Sarah D', avatar: null },
      ]
    },
    {
      id: 'proj-2',
      name: 'Social Media Analytics',
      description: 'Real-time analytics dashboard for social media managers',
      status: 'active' as const,
      completionPercentage: 45,
      healthScore: 7.2,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      teamMembers: [
        { id: '1', name: 'You', avatar: null },
      ]
    },
    {
      id: 'proj-3',
      name: 'E-learning Platform',
      description: 'Interactive learning platform with AI tutoring',
      status: 'completed' as const,
      completionPercentage: 100,
      healthScore: 9.1,
      lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      teamMembers: [
        { id: '1', name: 'You', avatar: null },
        { id: '2', name: 'Mike R', avatar: null },
        { id: '3', name: 'Jessica K', avatar: null },
      ]
    }
  ];

  const mockStats = {
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalTeamMembers: 8,
    contextExports: 24,
    mvpLaunches: 6
  };

  const mockRecentActivity = [
    {
      id: '1',
      type: 'conversation',
      title: 'New AI insights for Freelancer Invoice App',
      subtitle: 'Claude provided market analysis and feature recommendations',
      time: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      projectId: 'proj-1'
    },
    {
      id: '2',
      type: 'export',
      title: 'Context exported to Cursor IDE',
      subtitle: 'Full project specifications downloaded',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      projectId: 'proj-1'
    },
    {
      id: '3',
      type: 'team',
      title: 'Sarah D joined your project',
      subtitle: 'New team member added to Freelancer Invoice App',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      projectId: 'proj-1'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversation': return <MessageSquare className="w-4 h-4" />;
      case 'export': return <Download className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {auth.user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Track your AI-powered projects and team progress
              </p>
            </div>
            
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/app/projects/new')}
            >
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{mockStats.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{mockStats.activeProjects}</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{mockStats.completedProjects}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{mockStats.totalTeamMembers}</div>
            <div className="text-sm text-gray-600">Team Members</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{mockStats.contextExports}</div>
            <div className="text-sm text-gray-600">Context Exports</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{mockStats.mvpLaunches}</div>
            <div className="text-sm text-gray-600">MVP Launches</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/app/projects')}
                  >
                    View All
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {mockProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(project.status) as any} size="sm">
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all"
                              style={{ width: `${project.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {project.completionPercentage}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-600">Health:</span>
                          <span className="text-xs font-medium text-green-600">
                            {project.healthScore}/10
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {project.teamMembers.slice(0, 3).map((member, i) => (
                            <Avatar
                              key={member.id}
                              fallback={member.name[0]}
                              size="sm"
                              className="ring-2 ring-white"
                            />
                          ))}
                          {project.teamMembers.length > 3 && (
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                              +{project.teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(project.lastActivity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {mockRecentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => activity.projectId && navigate(`/app/projects/${activity.projectId}`)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {activity.subtitle}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  View All Activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DashboardPage };