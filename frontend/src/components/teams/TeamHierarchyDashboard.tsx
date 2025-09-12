import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Avatar, 
  Chip, Stack, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, List, ListItem, ListItemAvatar, ListItemText,
  ListItemSecondaryAction, Divider, Alert, Badge, Tooltip,
  Paper, Tab, Tabs, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, LinearProgress
} from '@mui/material';
import {
  Group, Business, People, Person, Add, Edit, Delete,
  Visibility, ExpandMore, ExpandLess, AccountTree,
  SupervisorAccount, Star, Schedule, TrendingUp,
  Assignment, CheckCircle, Warning, Info
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import DatabaseService from '../../services/databaseService';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  department?: string;
  profile_photo_url?: string;
  employment_status: string;
  manager_employee_id?: string;
  performance_rating?: number;
  last_login?: string;
  team_role?: 'member' | 'lead' | 'coordinator';
}

interface Team {
  id: string;
  name: string;
  description?: string;
  department?: string;
  team_lead_employee_id?: string;
  members: TeamMember[];
  performance_metrics?: {
    productivity_score: number;
    engagement_score: number;
    completion_rate: number;
  };
  created_at: string;
}

interface TeamHierarchy {
  team: Team;
  subTeams: TeamHierarchy[];
  parentTeam?: Team;
  level: number;
}

export const TeamHierarchyDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();

  // State Management
  const [teams, setTeams] = useState<Team[]>([]);
  const [hierarchy, setHierarchy] = useState<TeamHierarchy[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Modal States
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Form States
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    department: '',
    team_lead_employee_id: ''
  });
  const [memberAssignmentForm, setMemberAssignmentForm] = useState({
    employee_id: '',
    team_role: 'member' as 'member' | 'lead' | 'coordinator'
  });

  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Team Analytics
  const [teamAnalytics, setTeamAnalytics] = useState<any>(null);

  // Permission Checks
  const canViewAllTeams = hasPermission('teams.view_all') || hasPermission('*');
  const canManageTeams = hasPermission('teams.manage_all') || hasPermission('teams.manage_own');
  const canAssignMembers = hasPermission('teams.assign_members');
  const canViewHierarchy = hasPermission('hierarchy.view_all') || hasPermission('hierarchy.view_department');

  // Load team data
  useEffect(() => {
    loadTeamData();
  }, [profile]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      if (canViewAllTeams) {
        // Load all teams for admin/HR
        // For now, use the existing team methods from DatabaseService
        const allTeams = await DatabaseService.getTeams();
        setTeams(allTeams || []);
        setHierarchy(buildTeamHierarchy(allTeams || []));
      } else if (hasPermission('teams.view_own') && profile) {
        // Load only user's team - use department filter for now
        const userDeptTeams = await DatabaseService.getTeams(profile.department_id);
        setTeams(userDeptTeams || []);
        setHierarchy(buildTeamHierarchy(userDeptTeams || []));
      }
      
      // Skip analytics for now as these methods don't exist yet
      if (hasPermission('analytics.advanced') || hasPermission('reports.view_department')) {
        // const analytics = await DatabaseService.getTeamAnalytics(profile?.employee_id);
        // setTeamAnalytics(analytics);
      }
      
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const buildTeamHierarchy = (teams: Team[], parentId: string | null = null, level: number = 0): TeamHierarchy[] => {
    return teams
      .filter(team => team.department === parentId)
      .map(team => ({
        team,
        subTeams: buildTeamHierarchy(teams, team.id, level + 1),
        level
      }));
  };

  // Team Management Functions (placeholder implementations)
  const handleCreateTeam = async () => {
    try {
      // For now, create a mock team since these methods don't exist in DatabaseService yet
      const newTeam = {
        id: Date.now().toString(),
        name: teamForm.name,
        description: teamForm.description,
        department: teamForm.department,
        team_lead_employee_id: teamForm.team_lead_employee_id,
        members: [],
        created_at: new Date().toISOString()
      };
      
      setTeams(prev => [...prev, newTeam]);
      setTeamDialogOpen(false);
      setTeamForm({ name: '', description: '', department: '', team_lead_employee_id: '' });
      toast.success('Team created successfully!');
      
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleAssignMember = async (teamId: string) => {
    try {
      // Placeholder implementation
      toast.info('Team member assignment feature coming soon!');
      setMemberDialogOpen(false);
      
    } catch (error) {
      toast.error('Failed to assign team member');
    }
  };

  const handleRemoveTeamMember = async (teamId: string, employeeId: string) => {
    try {
      // Placeholder implementation
      toast.info('Team member removal feature coming soon!');
    } catch (error) {
      toast.error('Failed to remove team member');
    }
  };

  // Filtered teams based on user permissions and filters
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          team.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || team.department === departmentFilter;
      
      // Apply role-based filtering
      if (hasPermission('teams.view_all')) {
        return matchesSearch && matchesDepartment;
      } else if (hasPermission('teams.view_own') && profile) {
        const isTeamMember = team.members.some(member => member.employee_id === profile.employee_id);
        const isTeamLead = team.team_lead_employee_id === profile.employee_id;
        return (isTeamMember || isTeamLead) && matchesSearch && matchesDepartment;
      }
      
      return false;
    });
  }, [teams, searchTerm, departmentFilter, hasPermission, profile]);

  // Team hierarchy rendering
  const renderTeamHierarchy = (hierarchyData: TeamHierarchy[], parentLevel: number = 0) => {
    return hierarchyData.map((item, index) => (
      <Box key={item.team.id} sx={{ mb: 2 }}>
        <Card 
          elevation={2 + parentLevel}
          sx={{ 
            ml: parentLevel * 3,
            borderLeft: `4px solid ${getTeamColor(item.level)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            }
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: getTeamColor(item.level),
                      width: 40,
                      height: 40
                    }}
                  >
                    <Group />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {item.team.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Level {item.level + 1} Team • {item.team.members.length} members
                    </Typography>
                  </Box>
                  <Chip 
                    label={item.team.department || 'No Department'}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                {item.team.description && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {item.team.description}
                  </Typography>
                )}

                {/* Team Members Preview */}
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {item.team.members.slice(0, 5).map((member) => (
                    <Tooltip key={member.id} title={`${member.first_name} ${member.last_name}`}>
                      <Avatar
                        src={member.profile_photo_url}
                        sx={{ width: 32, height: 32 }}
                      >
                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                      </Avatar>
                    </Tooltip>
                  ))}
                  {item.team.members.length > 5 && (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
                      +{item.team.members.length - 5}
                    </Avatar>
                  )}
                </Stack>

                {/* Performance Metrics */}
                {item.team.performance_metrics && (
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Productivity
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.team.performance_metrics.productivity_score}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption">
                          {item.team.performance_metrics.productivity_score}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Engagement
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.team.performance_metrics.engagement_score}
                          color="secondary"
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption">
                          {item.team.performance_metrics.engagement_score}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Completion Rate
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.team.performance_metrics.completion_rate}
                          color="success"
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                        <Typography variant="caption">
                          {item.team.performance_metrics.completion_rate}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => setSelectedTeam(item.team)}
                  color="primary"
                >
                  <Visibility />
                </IconButton>
                
                {canManageTeams && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingTeam(item.team);
                      setTeamForm({
                        name: item.team.name,
                        description: item.team.description || '',
                        department: item.team.department || '',
                        team_lead_employee_id: item.team.team_lead_employee_id || ''
                      });
                      setTeamDialogOpen(true);
                    }}
                    color="secondary"
                  >
                    <Edit />
                  </IconButton>
                )}

                {item.subTeams.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      const expanded = new Set(expandedTeams);
                      if (expanded.has(item.team.id)) {
                        expanded.delete(item.team.id);
                      } else {
                        expanded.add(item.team.id);
                      }
                      setExpandedTeams(expanded);
                    }}
                  >
                    {expandedTeams.has(item.team.id) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Sub-teams */}
        {expandedTeams.has(item.team.id) && item.subTeams.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {renderTeamHierarchy(item.subTeams, parentLevel + 1)}
          </Box>
        )}
      </Box>
    ));
  };

  const getTeamColor = (level: number): string => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];
    return colors[level % colors.length];
  };

  // Team Member Management
  const renderTeamMembers = (team: Team) => {
    const teamLead = team.members.find(m => m.employee_id === team.team_lead_employee_id);
    const otherMembers = team.members.filter(m => m.employee_id !== team.team_lead_employee_id);

    return (
      <Box>
        {/* Team Leader */}
        {teamLead && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupervisorAccount color="primary" />
              Team Leader
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={teamLead.profile_photo_url}
                    sx={{ width: 56, height: 56 }}
                  >
                    {teamLead.first_name.charAt(0)}{teamLead.last_name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {teamLead.first_name} {teamLead.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teamLead.position} • {teamLead.email}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label="Team Leader" color="primary" size="small" />
                      {teamLead.performance_rating && (
                        <Chip 
                          label={`${teamLead.performance_rating}/5 ⭐`} 
                          color="success" 
                          size="small" 
                        />
                      )}
                    </Stack>
                  </Box>
                  
                  {/* Team Leader Actions */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {/* Navigate to profile */}}
                    >
                      View Profile
                    </Button>
                    {canAssignMembers && profile?.employee_id !== teamLead.employee_id && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleRemoveTeamMember(team.id, teamLead.employee_id)}
                      >
                        Remove as Leader
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Team Members */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group color="primary" />
              Team Members ({otherMembers.length})
            </Typography>
            {canAssignMembers && (
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedTeam(team);
                  setMemberDialogOpen(true);
                }}
              >
                Add Member
              </Button>
            )}
          </Stack>

          {otherMembers.length === 0 ? (
            <Alert severity="info">
              No team members assigned yet. Add members to get started.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {otherMembers.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={member.profile_photo_url}
                            sx={{ width: 48, height: 48 }}
                          >
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {member.first_name} {member.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {member.position}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip 
                            label={member.employment_status} 
                            color={member.employment_status === 'active' ? 'success' : 'default'}
                            size="small" 
                          />
                          {member.team_role && (
                            <Chip 
                              label={member.team_role} 
                              color="secondary"
                              size="small" 
                            />
                          )}
                        </Stack>

                        {member.performance_rating && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Performance Rating
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(member.performance_rating / 5) * 100}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                            <Typography variant="caption">
                              {member.performance_rating}/5
                            </Typography>
                          </Box>
                        )}

                        {/* Member Actions */}
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button size="small" variant="text">
                            View Profile
                          </Button>
                          {canAssignMembers && (
                            <Button 
                              size="small" 
                              variant="text" 
                              color="error"
                              onClick={() => handleRemoveTeamMember(team.id, member.employee_id)}
                            >
                              Remove
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Team Hierarchy & Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {canViewAllTeams ? 'Manage teams across the organization' : 'View and manage your team'}
          </Typography>
        </Box>
        
        {canManageTeams && (
          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setTeamDialogOpen(true)}
            size="large"
          >
            Create Team
          </Button>
        )}
      </Stack>

      {/* Analytics Cards */}
      {teamAnalytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Group />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {teamAnalytics.total_teams || teams.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Teams
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {teamAnalytics.total_members || teams.reduce((sum, team) => sum + team.members.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Team Members
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {teamAnalytics.avg_performance?.toFixed(1) || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Performance
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {teamAnalytics.active_projects || 0}
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

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search Teams"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Department Filter</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  label="Department Filter"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  <MenuItem value="engineering">Engineering</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="hr">Human Resources</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" size="small">
                  Export Teams
                </Button>
                <Button variant="outlined" size="small">
                  Generate Report
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Team Hierarchy" />
            <Tab label="Team List" />
            {selectedTeam && <Tab label={`${selectedTeam.name} Details`} />}
          </Tabs>
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Tab Content */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Organizational Team Structure
              </Typography>
              {hierarchy.length === 0 ? (
                <Alert severity="info">
                  No team hierarchy found. Create teams to build your organizational structure.
                </Alert>
              ) : (
                renderTeamHierarchy(hierarchy)
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Teams ({filteredTeams.length})
              </Typography>
              <Grid container spacing={3}>
                {filteredTeams.map((team) => (
                  <Grid item xs={12} md={6} lg={4} key={team.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {team.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {team.department}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${team.members.length} members`}
                              size="small"
                              color="primary"
                            />
                          </Stack>

                          {team.description && (
                            <Typography variant="body2">
                              {team.description}
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1}>
                            <Button 
                              size="small" 
                              onClick={() => setSelectedTeam(team)}
                              variant="contained"
                            >
                              View Details
                            </Button>
                            {canManageTeams && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => {
                                  setEditingTeam(team);
                                  setTeamDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {tabValue === 2 && selectedTeam && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                  {selectedTeam.name} Team Details
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedTeam(null);
                    setTabValue(0);
                  }}
                >
                  Close Details
                </Button>
              </Stack>
              
              {renderTeamMembers(selectedTeam)}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Team Dialog */}
      <Dialog 
        open={teamDialogOpen} 
        onClose={() => setTeamDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTeam ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Team Name"
              value={teamForm.name}
              onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={teamForm.description}
              onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={teamForm.department}
                onChange={(e) => setTeamForm(prev => ({ ...prev, department: e.target.value }))}
                label="Department"
              >
                <MenuItem value="engineering">Engineering</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="hr">Human Resources</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Team Lead Employee ID"
              value={teamForm.team_lead_employee_id}
              onChange={(e) => setTeamForm(prev => ({ ...prev, team_lead_employee_id: e.target.value }))}
              helperText="Enter the employee ID of the team leader"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTeam} 
            variant="contained"
            disabled={!teamForm.name.trim()}
          >
            {editingTeam ? 'Update Team' : 'Create Team'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Member Dialog */}
      <Dialog 
        open={memberDialogOpen} 
        onClose={() => setMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Team Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Employee ID"
              value={memberAssignmentForm.employee_id}
              onChange={(e) => setMemberAssignmentForm(prev => ({ ...prev, employee_id: e.target.value }))}
              helperText="Enter the employee ID to assign to this team"
            />
            <FormControl fullWidth>
              <InputLabel>Team Role</InputLabel>
              <Select
                value={memberAssignmentForm.team_role}
                onChange={(e) => setMemberAssignmentForm(prev => ({ ...prev, team_role: e.target.value as any }))}
                label="Team Role"
              >
                <MenuItem value="member">Team Member</MenuItem>
                <MenuItem value="coordinator">Team Coordinator</MenuItem>
                <MenuItem value="lead">Team Lead</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedTeam && handleAssignMember(selectedTeam.id)} 
            variant="contained"
            disabled={!memberAssignmentForm.employee_id.trim()}
          >
            Assign Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamHierarchyDashboard;
