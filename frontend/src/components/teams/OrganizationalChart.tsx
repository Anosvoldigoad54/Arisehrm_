import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Stack,
  IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Badge, Paper, Zoom, Alert
} from '@mui/material';
import {
  Group, Person, SupervisorAccount, ZoomIn, ZoomOut,
  CenterFocusStrong, Fullscreen, Print, Download,
  Edit, Visibility, Add, ExpandMore, ExpandLess
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import DatabaseService from '../../services/databaseService';

interface ChartNode {
  id: string;
  name: string;
  title: string;
  department?: string;
  email?: string;
  profile_photo_url?: string;
  employee_id: string;
  manager_id?: string;
  team_members?: ChartNode[];
  level: number;
  x?: number;
  y?: number;
}

interface TeamChartNode extends ChartNode {
  type: 'team';
  team_id: string;
  members_count: number;
  performance_score?: number;
}

interface EmployeeChartNode extends ChartNode {
  type: 'employee';
  employment_status: string;
  performance_rating?: number;
}

type ChartNodeType = TeamChartNode | EmployeeChartNode;

export const OrganizationalChart: React.FC = () => {
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart state
  const [chartData, setChartData] = useState<ChartNodeType[]>([]);
  const [viewMode, setViewMode] = useState<'teams' | 'employees' | 'combined'>('teams');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<ChartNodeType | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // Chart dimensions
  const [chartDimensions, setChartDimensions] = useState({ width: 1200, height: 800 });
  const nodeWidth = 200;
  const nodeHeight = 80;
  const levelHeight = 150;
  const nodeSpacing = 40;

  // Loading and dialogs
  const [loading, setLoading] = useState(true);
  const [nodeDetailsOpen, setNodeDetailsOpen] = useState(false);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Permission checks
  const canViewAllHierarchy = hasPermission('hierarchy.view_all') || hasPermission('*');
  const canManageHierarchy = hasPermission('hierarchy.manage') || hasPermission('teams.manage_all');
  const canViewEmployeeDetails = hasPermission('employees.view_details') || hasPermission('*');

  // Load organizational data
  useEffect(() => {
    loadOrganizationalData();
  }, [viewMode, profile]);

  const loadOrganizationalData = async () => {
    try {
      setLoading(true);
      let data: ChartNodeType[] = [];

      if (viewMode === 'teams' && canViewAllHierarchy) {
        const teams = await DatabaseService.getTeams();
        data = transformTeamsToChartNodes(teams || []);
      } else if (viewMode === 'employees' && canViewAllHierarchy) {
        // Use the team structure method to get employee data for now
        const employeeStructure = await DatabaseService.getTeamStructure();
        data = transformEmployeesToChartNodes([]);
      } else if (viewMode === 'combined' && canViewAllHierarchy) {
        // Combined view not implemented yet
        data = transformCombinedToChartNodes([]);
      } else if (profile) {
        // Load user's department or team only
        const userStructure = await DatabaseService.getTeamStructure(profile.employee_id);
        data = transformUserHierarchyToChartNodes(userStructure);
      }

      // Calculate positions
      const positionedData = calculateNodePositions(data);
      setChartData(positionedData);

    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Transform data functions
  const transformTeamsToChartNodes = (teams: any[]): TeamChartNode[] => {
    return teams.map((team, index) => ({
      id: team.id,
      name: team.name,
      title: `Team - ${team.department || 'No Department'}`,
      department: team.department,
      email: team.team_lead_email,
      employee_id: team.team_lead_employee_id || '',
      manager_id: team.parent_team_id,
      level: team.hierarchy_level || 0,
      type: 'team' as const,
      team_id: team.id,
      members_count: team.members?.length || 0,
      performance_score: team.performance_metrics?.overall_score,
      team_members: team.sub_teams ? transformTeamsToChartNodes(team.sub_teams) : []
    }));
  };

  const transformEmployeesToChartNodes = (employees: any[]): EmployeeChartNode[] => {
    return employees.map((employee, index) => ({
      id: employee.employee_id,
      name: `${employee.first_name} ${employee.last_name}`,
      title: employee.position || 'Employee',
      department: employee.department,
      email: employee.email,
      profile_photo_url: employee.profile_photo_url,
      employee_id: employee.employee_id,
      manager_id: employee.manager_employee_id,
      level: employee.hierarchy_level || 0,
      type: 'employee' as const,
      employment_status: employee.employment_status,
      performance_rating: employee.performance_rating,
      team_members: employee.subordinates ? transformEmployeesToChartNodes(employee.subordinates) : []
    }));
  };

  const transformCombinedToChartNodes = (combined: any[]): ChartNodeType[] => {
    // Implementation for combined view would merge teams and employees
    return [];
  };

  const transformUserHierarchyToChartNodes = (userHierarchy: any): ChartNodeType[] => {
    // Implementation for user's specific hierarchy
    return [];
  };

  // Calculate node positions for tree layout
  const calculateNodePositions = (nodes: ChartNodeType[]): ChartNodeType[] => {
    const positioned = [...nodes];
    const levelGroups: { [level: number]: ChartNodeType[] } = {};
    
    // Group nodes by level
    positioned.forEach(node => {
      if (!levelGroups[node.level]) {
        levelGroups[node.level] = [];
      }
      levelGroups[node.level].push(node);
    });

    // Position nodes
    Object.keys(levelGroups).forEach(level => {
      const levelNodes = levelGroups[parseInt(level)];
      const totalWidth = levelNodes.length * (nodeWidth + nodeSpacing) - nodeSpacing;
      const startX = (chartDimensions.width - totalWidth) / 2;

      levelNodes.forEach((node, index) => {
        node.x = startX + index * (nodeWidth + nodeSpacing);
        node.y = parseInt(level) * levelHeight + 50;
      });
    });

    return positioned;
  };

  // Filtered nodes based on search and filters
  const filteredNodes = useMemo(() => {
    return chartData.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          node.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || node.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [chartData, searchTerm, departmentFilter]);

  // Chart interaction handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleNodeClick = (node: ChartNodeType) => {
    setSelectedNode(node);
    if (canViewEmployeeDetails) {
      setNodeDetailsOpen(true);
    }
  };

  const handleToggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Render chart node
  const renderChartNode = (node: ChartNodeType) => {
    const isSelected = selectedNode?.id === node.id;
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = (node.team_members?.length || 0) > 0;

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        style={{ cursor: 'pointer' }}
        onClick={() => handleNodeClick(node)}
      >
        {/* Node background */}
        <rect
          width={nodeWidth}
          height={nodeHeight}
          rx={8}
          fill={isSelected ? '#1976d2' : '#ffffff'}
          stroke={node.type === 'team' ? '#2e7d32' : '#1976d2'}
          strokeWidth={2}
          filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
        />

        {/* Node content */}
        <g>
          {/* Avatar/Icon */}
          <circle
            cx={25}
            cy={25}
            r={15}
            fill={node.type === 'team' ? '#2e7d32' : '#1976d2'}
          />
          <text
            x={25}
            y={30}
            textAnchor="middle"
            fill="white"
            fontSize="12"
          >
            {node.type === 'team' ? 'T' : node.name.charAt(0)}
          </text>

          {/* Name */}
          <text
            x={50}
            y={20}
            fontSize="14"
            fontWeight="600"
            fill={isSelected ? 'white' : '#333'}
          >
            {node.name.length > 20 ? `${node.name.substring(0, 20)}...` : node.name}
          </text>

          {/* Title */}
          <text
            x={50}
            y={35}
            fontSize="12"
            fill={isSelected ? 'white' : '#666'}
          >
            {node.title.length > 25 ? `${node.title.substring(0, 25)}...` : node.title}
          </text>

          {/* Department chip */}
          {node.department && (
            <rect
              x={50}
              y={45}
              width={60}
              height={18}
              rx={9}
              fill={isSelected ? 'rgba(255,255,255,0.2)' : '#f0f0f0'}
            />
          )}
          {node.department && (
            <text
              x={80}
              y={56}
              textAnchor="middle"
              fontSize="10"
              fill={isSelected ? 'white' : '#666'}
            >
              {node.department.toUpperCase()}
            </text>
          )}

          {/* Performance indicator */}
          {((node.type === 'team' && node.performance_score) || 
            (node.type === 'employee' && node.performance_rating)) && (
            <circle
              cx={nodeWidth - 20}
              cy={20}
              r={8}
              fill={getPerformanceColor(
                node.type === 'team' ? node.performance_score! : (node.performance_rating! * 20)
              )}
            />
          )}

          {/* Member count for teams */}
          {node.type === 'team' && node.members_count > 0 && (
            <g>
              <circle
                cx={nodeWidth - 20}
                cy={nodeHeight - 20}
                r={10}
                fill="#666"
              />
              <text
                x={nodeWidth - 20}
                y={nodeHeight - 16}
                textAnchor="middle"
                fontSize="10"
                fill="white"
              >
                {node.members_count}
              </text>
            </g>
          )}

          {/* Expand/collapse button */}
          {hasChildren && (
            <g
              transform={`translate(${nodeWidth - 15}, ${nodeHeight + 5})`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(node.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle r={10} fill="#1976d2" />
              <text
                textAnchor="middle"
                y={4}
                fontSize="12"
                fill="white"
              >
                {isExpanded ? '−' : '+'}
              </text>
            </g>
          )}
        </g>

        {/* Connection lines to children */}
        {isExpanded && node.team_members?.map((child, index) => {
          if (!child.x || !child.y) return null;
          
          return (
            <line
              key={`line-${node.id}-${child.id}`}
              x1={nodeWidth / 2}
              y1={nodeHeight}
              x2={child.x - node.x! + nodeWidth / 2}
              y2={child.y - node.y!}
              stroke="#ccc"
              strokeWidth={2}
            />
          );
        })}
      </g>
    );
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  // Export functions
  const exportChart = (format: 'png' | 'svg' | 'pdf') => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    
    if (format === 'svg') {
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'organizational-chart.svg';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // For PNG/PDF, would need additional canvas conversion
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        Loading organizational chart...
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chart Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {/* View Mode Selection */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              label="View Mode"
            >
              <MenuItem value="teams">Teams</MenuItem>
              <MenuItem value="employees">Employees</MenuItem>
              <MenuItem value="combined">Combined</MenuItem>
            </Select>
          </FormControl>

          {/* Search */}
          <TextField
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          {/* Department Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="engineering">Engineering</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="finance">Finance</MenuItem>
            </Select>
          </FormControl>

          {/* Zoom Controls */}
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center', pt: 1 }}>
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
            <IconButton onClick={handleResetView} size="small">
              <CenterFocusStrong />
            </IconButton>
          </Stack>

          {/* Export Options */}
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Download />}
              onClick={() => exportChart('svg')}
              size="small"
              variant="outlined"
            >
              Export SVG
            </Button>
            <Button
              startIcon={<Print />}
              onClick={() => window.print()}
              size="small"
              variant="outlined"
            >
              Print
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Chart Container */}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {filteredNodes.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No organizational data found for the current filters.
          </Alert>
        ) : (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${panOffset.x} ${panOffset.y} ${chartDimensions.width / zoomLevel} ${chartDimensions.height / zoomLevel}`}
            style={{ cursor: 'grab' }}
          >
            {/* Chart background */}
            <rect
              width="100%"
              height="100%"
              fill="#fafafa"
            />

            {/* Chart nodes */}
            <g>
              {filteredNodes.map(node => renderChartNode(node))}
            </g>

            {/* Legend */}
            <g transform={`translate(20, ${chartDimensions.height - 100})`}>
              <rect width="200" height="80" fill="white" stroke="#ccc" rx={4} />
              <text x={10} y={20} fontSize="12" fontWeight="600">Legend</text>
              
              <circle cx={20} cy={35} r={6} fill="#2e7d32" />
              <text x={35} y={40} fontSize="10">Teams</text>
              
              <circle cx={20} cy={50} r={6} fill="#1976d2" />
              <text x={35} y={55} fontSize="10">Employees</text>

              <circle cx={20} cy={65} r={4} fill="#4caf50" />
              <text x={35} y={70} fontSize="10">High Performance</text>
            </g>
          </svg>
        )}
      </Box>

      {/* Node Details Dialog */}
      <Dialog
        open={nodeDetailsOpen}
        onClose={() => setNodeDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedNode && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={selectedNode.type === 'employee' ? selectedNode.profile_photo_url : undefined}
                  sx={{ bgcolor: selectedNode.type === 'team' ? '#2e7d32' : '#1976d2' }}
                >
                  {selectedNode.type === 'team' ? <Group /> : <Person />}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedNode.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedNode.title}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {/* Basic Information */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Basic Information
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip label={`${selectedNode.type === 'team' ? 'Team' : 'Employee'}`} />
                    {selectedNode.department && (
                      <Chip label={selectedNode.department} variant="outlined" />
                    )}
                    {selectedNode.email && (
                      <Chip label={selectedNode.email} variant="outlined" />
                    )}
                  </Stack>
                </Box>

                {/* Performance Metrics */}
                {((selectedNode.type === 'team' && selectedNode.performance_score) ||
                  (selectedNode.type === 'employee' && selectedNode.performance_rating)) && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance
                    </Typography>
                    <Typography variant="body2">
                      {selectedNode.type === 'team' 
                        ? `Team Score: ${selectedNode.performance_score}%`
                        : `Rating: ${selectedNode.performance_rating}/5`
                      }
                    </Typography>
                  </Box>
                )}

                {/* Team Members Count */}
                {selectedNode.type === 'team' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Team Size
                    </Typography>
                    <Typography variant="body2">
                      {selectedNode.members_count} members
                    </Typography>
                  </Box>
                )}

                {/* Employment Status */}
                {selectedNode.type === 'employee' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Employment Status
                    </Typography>
                    <Chip 
                      label={selectedNode.employment_status}
                      color={selectedNode.employment_status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNodeDetailsOpen(false)}>Close</Button>
              {canManageHierarchy && (
                <Button variant="contained" startIcon={<Edit />}>
                  Edit Details
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrganizationalChart;
