import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, Chip, Box, Grid,
  CircularProgress, Alert, Button,
  TextField, MenuItem, InputAdornment, Paper
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import { format } from 'date-fns';
import { zhCN, enUS, fr, nl } from 'date-fns/locale';
import { ticketAPI } from '../services/api';

function TicketList() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['common', 'ticket']);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date locale mapping
  const localeMap = { zh: zhCN, en: enUS, fr: fr, nl: nl };
  const currentLocale = localeMap[i18n.language] || enUS;

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
      setError(t('ticket:messages.loadError') + ': ' + err.message);
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

  const getStatusText = (status) => t(`ticket:status.${status}`, status);

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => t(`ticket:priority.${priority}`, priority);

  const getCategoryText = (category) => t(`ticket:categoryShort.${category}`, category);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={loadTickets}>
          {t('common:actions.retry')}
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* 标题栏 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          📋 {t('ticket:list.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadTickets}
        >
          {t('common:actions.refresh')}
        </Button>
      </Box>

      {/* 搜索和过滤器 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        {/* 搜索框 */}
        <TextField
          fullWidth
          placeholder={t('ticket:list.searchPlaceholder')}
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

        {/* 过滤器 */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('ticket:list.statusFilter')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">{t('ticket:list.allStatuses')}</MenuItem>
              <MenuItem value="pending">{t('ticket:status.pending')}</MenuItem>
              <MenuItem value="in_progress">{t('ticket:status.in_progress')}</MenuItem>
              <MenuItem value="resolved">{t('ticket:status.resolved')}</MenuItem>
              <MenuItem value="closed">{t('ticket:status.closed')}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('ticket:list.categoryFilter')}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">{t('ticket:list.allCategories')}</MenuItem>
              <MenuItem value="hardware">{t('ticket:category.hardware')}</MenuItem>
              <MenuItem value="software">{t('ticket:category.software')}</MenuItem>
              <MenuItem value="network">{t('ticket:category.network')}</MenuItem>
              <MenuItem value="permission">{t('ticket:category.permission')}</MenuItem>
              <MenuItem value="other">{t('ticket:category.other')}</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label={t('ticket:list.priorityFilter')}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">{t('ticket:list.allPriorities')}</MenuItem>
              <MenuItem value="low">{t('ticket:priority.low')}</MenuItem>
              <MenuItem value="medium">{t('ticket:priority.medium')}</MenuItem>
              <MenuItem value="high">{t('ticket:priority.high')}</MenuItem>
              <MenuItem value="urgent">{t('ticket:priority.urgent')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* 统计信息 */}
      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          {t('ticket:list.showingResults', { count: filteredTickets.length, total: tickets.length })}
        </Typography>
      </Box>

      {/* 工单列表 */}
      {filteredTickets.length === 0 ? (
        <Alert severity="info">
          {tickets.length === 0
            ? t('ticket:list.noTickets')
            : t('ticket:list.noMatchingTickets')
          }
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

                  {/* 创建时间 */}
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {t('ticket:list.createdAt')}: {format(new Date(ticket.created_at), 'PPpp', { locale: currentLocale })}
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