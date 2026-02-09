import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Chip, Box, Grid,
  CircularProgress, Alert, Button,
  TextField, MenuItem, InputAdornment, Paper
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import { ticketAPI } from '../services/api';
import { useTranslation } from '../translations';

function TicketList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 过滤和搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketAPI.getTickets();
      setTickets(response.data);
    } catch (err) {
      setError(t('loadTicketsError') + ': ' + err.message);
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  // 过滤工单
  const getFilteredTickets = () => {
    let filtered = [...tickets];

    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.description.toLowerCase().includes(keyword) ||
        ticket.ticket_number.toLowerCase().includes(keyword)
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // 类别过滤
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    // 优先级过滤
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      resolved: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => t(`statuses.${status}`) || status;
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };
  const getPriorityText = (priority) => t(`priorities.${priority}`) || priority;
  const getCategoryText = (category) => t(`categories.${category}`) || category;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 1 }}>{t('loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={loadTickets}>
          {t('retry')}
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('ticketListTitle')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadTickets}
        >
          {t('refresh')}
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('searchPlaceholder')}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">{t('allStatus')}</MenuItem>
              <MenuItem value="pending">{t('statuses.pending')}</MenuItem>
              <MenuItem value="in_progress">{t('statuses.in_progress')}</MenuItem>
              <MenuItem value="resolved">{t('statuses.resolved')}</MenuItem>
              <MenuItem value="closed">{t('statuses.closed')}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('category')}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">{t('allCategories')}</MenuItem>
              <MenuItem value="hardware">{t('categories.hardware')}</MenuItem>
              <MenuItem value="software">{t('categories.software')}</MenuItem>
              <MenuItem value="network">{t('categories.network')}</MenuItem>
              <MenuItem value="permission">{t('categories.permission')}</MenuItem>
              <MenuItem value="other">{t('categories.other')}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('priority')}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">{t('allPriorities')}</MenuItem>
              <MenuItem value="low">{t('priorities.low')}</MenuItem>
              <MenuItem value="medium">{t('priorities.medium')}</MenuItem>
              <MenuItem value="high">{t('priorities.high')}</MenuItem>
              <MenuItem value="urgent">{t('priorities.urgent')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          {t('showingTickets').replace('{filtered}', filteredTickets.length).replace('{total}', tickets.length)}
        </Typography>
      </Box>

      {filteredTickets.length === 0 ? (
        <Alert severity="info">
          {tickets.length === 0 ? t('noTicketsHint') : t('noMatchingTickets')}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredTickets.map((ticket) => (
            <Grid item xs={12} md={6} key={ticket.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardContent>
                  {/* 工单号和状态 */}
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" component="div">
                      {ticket.ticket_number}
                    </Typography>
                    <Chip 
                      label={getStatusText(ticket.status)} 
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </Box>

                  {/* 标题 */}
                  <Typography variant="body1" fontWeight="bold" mb={1}>
                    {ticket.title}
                  </Typography>

                  {/* 描述（截取） */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                    mb={2}
                  >
                    {ticket.description}
                  </Typography>

                  {/* 标签信息 */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip 
                      label={getCategoryText(ticket.category)} 
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      label={getPriorityText(ticket.priority)}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                    <Chip 
                      label={ticket.employee_name_snapshot}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {t('createdAt')}: {new Date(ticket.created_at).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default TicketList;