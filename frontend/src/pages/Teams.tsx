import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Button,
  Tab, Tabs, Fab, Alert, Breadcrumbs, Link, Chip, Paper,
  Avatar, IconButton, Tooltip, Badge
} from '@mui/material';
import {
  Group, AccountTree, People, Add, Settings, Analytics,
  TrendingUp, Assignment, Notifications, Dashboard,
  ViewModule, Timeline, PersonAdd
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { TeamHierarchyDashboard } from '../components/teams/TeamHierarchyDashboard';
import { OrganizationalChart } from '../components/teams/OrganizationalChart';
import DatabaseService from '../services/databaseService';
import { toast } from 'sonner';

interface TeamStats {
  totalTeams: number;
  totalMembers: number;
  averagePerformance: number;
  activeProjects: number;
  recentActivities: number;
  pendingRequests: number;
}

export const Teams: React.FC = () => {
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();

  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Permission checks
  const canViewAllTeams = hasPermission('teams.view_all') || hasPermission('*');
  const canManageTeams = hasPermission('teams.manage_all') || hasPermission('teams.manage_own');
  const canViewHierarchy = hasPermission('hierarchy.view_all') || hasPermission('hierarchy.view_department');
  const canViewAnalytics = hasPermission('analytics.advanced') || hasPermission('reports.view_team');
  const canCreateTeams = hasPermission('teams.create') || canManageTeams;

  // Load team statistics and recent activities
  useEffect(() => {
    loadTeamOverview();
  }, [profile]);

  const loadTeamOverview = async () => {
    try {
      setLoading(true);
      
      // Load team statistics - using placeholder data for now
      const stats: TeamStats = {
        totalTeams: 5,
        totalMembers: 32,
        averagePerformance: 4.2,
        activeProjects: 8,
        recentActivities: 3,
        pendingRequests: 2
      };
      setTeamStats(stats);

      // Load recent activities - using placeholder data for now
      const activities = [
        {
          type: 'team_created',
          description: 'New team "Engineering" was created',
          timestamp: '2 hours ago',
          team_name: 'Engineering'
        },
        {
          type: 'member_added',
          description: 'John Doe was added to Marketing team',
          timestamp: '4 hours ago',
          team_name: 'Marketing'
        }
      ];
      setRecentActivities(activities);

    } catch (error) {
      toast.error('Failed to load team overview');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      label: 'Team Dashboard',
      icon: <Dashboard />,
      component: <TeamHierarchyDashboard />,
      permission: canViewAllTeams || hasPermission('teams.view_own')
    },
    {
      label: 'Organizational Chart',
      icon: <AccountTree />,
      component: <OrganizationalChart />,
      permission: canViewHierarchy
    },
    {
      label: 'Team Analytics',
      icon: <Analytics />,
      component: <TeamAnalyticsView />,
      permission: canViewAnalytics
    },
    {
      label: 'Team Settings',
      icon: <Settings />,
      component: <TeamSettingsView />,
      permission: canManageTeams
    }
  ].filter(tab => tab.permission);

  const handleCreateTeam = () => {
    // This would open the create team dialog
    // For now, we'll switch to the dashboard tab where the create functionality exists
    setCurrentTab(0);
    toast.info('Use the "Create Team" button in the dashboard to add new teams');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading team information...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link underline="hover" color="inherit" href="/">
              Dashboard
            </Link>
            <Typography color="text.primary">Teams</Typography>
          </Breadcrumbs>

          {/* Page Title and Actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Team Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {canViewAllTeams 
                  ? 'Manage teams and organizational structure across the company'
                  : 'View and manage your team assignments'
                }
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              {canCreateTeams && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateTeam}
                  size="large"
                >
                  Create Team
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => toast.info('Team member invitation feature coming soon')}
              >
                Invite Members
              </Button>
            </Stack>
          </Stack>

          {/* Statistics Cards */}
          {teamStats && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <Group />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {teamStats.totalTeams}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Teams
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {teamStats.totalMembers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Team Members
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {teamStats.averagePerformance?.toFixed(1) || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Performance
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                        <Assignment />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {teamStats.activeProjects}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Projects
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Quick Actions and Notifications */}
          <Grid container spacing={3}>
            {/* Recent Activities */}
            <Grid
              size={{
                xs: 12,
                md: 8
              }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Team Activities
                  </Typography>
                  {recentActivities.length === 0 ? (
                    <Alert severity="info">No recent team activities</Alert>
                  ) : (
                    <Stack spacing={2}>
                      {recentActivities.slice(0, 5).map((activity, index) => (
                        <Box key={index} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              {activity.type === 'team_created' ? <Add /> : 
                               activity.type === 'member_added' ? <PersonAdd /> : 
                               <Group />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={500}>
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.timestamp}
                              </Typography>
                            </Box>
                            <Chip
                              label={activity.team_name}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    {canCreateTeams && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleCreateTeam}
                      >
                        Create New Team
                      </Button>
                    )}
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      onClick={() => toast.info('Bulk invite feature coming soon')}
                    >
                      Bulk Invite Members
                    </Button>
                    {canViewAnalytics && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Analytics />}
                        onClick={() => setCurrentTab(2)}
                      >
                        View Team Analytics
                      </Button>
                    )}
                    {canViewHierarchy && (
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AccountTree />}
                        onClick={() => setCurrentTab(1)}
                      >
                        View Org Chart
                      </Button>
                    )}
                  </Stack>

                  {/* Notifications */}
                  {teamStats && teamStats.pendingRequests > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Alert 
                        severity="warning" 
                        icon={<Notifications />}
                        action={
                          <Button color="inherit" size="small">
                            VIEW
                          </Button>
                        }
                      >
                        {teamStats.pendingRequests} pending team requests
                      </Alert>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 3 }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
      {/* Main Content Area */}
      <Box sx={{ px: 3, pb: 3 }}>
        {tabs[currentTab] && tabs[currentTab].component}
      </Box>
      {/* Floating Action Button for Quick Team Creation */}
      {canCreateTeams && (
        <Fab
          color="primary"
          aria-label="add team"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
          onClick={handleCreateTeam}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

// Placeholder components for other tabs
const TeamAnalyticsView: React.FC = () => (
  <Card>
    <CardContent>
      <Typography variant="h5" gutterBottom>
        Team Analytics & Insights
      </Typography>
      <Alert severity="info">
        Advanced team analytics dashboard coming soon. This will include:
        <br />• Team performance metrics
        <br />• Productivity trends
        <br />• Member engagement scores
        <br />• Project completion rates
        <br />• Resource utilization
      </Alert>
    </CardContent>
  </Card>
);

const TeamSettingsView: React.FC = () => (
  <Card>
    <CardContent>
      <Typography variant="h5" gutterBottom>
        Team Settings & Configuration
      </Typography>
      <Alert severity="info">
        Team settings panel coming soon. This will include:
        <br />• Team policies and rules
        <br />• Permission configurations
        <br />• Notification preferences
        <br />• Integration settings
        <br />• Workflow automation
      </Alert>
    </CardContent>
  </Card>
);

export default Teams;
