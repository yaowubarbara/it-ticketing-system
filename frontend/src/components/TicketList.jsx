import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Typography, Chip, Box, Grid,
  CircularProgress, Alert, Button,
  TextField, MenuItem, InputAdornment, Paper
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import { ticketAPI } from '../services/api';

function TicketList() {
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
      setError('加载工单失败: ' + err.message);
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

  const getStatusText = (status) => {
    const texts = {
      pending: '待处理',
      in_progress: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'primary',
      high: 'warning',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return texts[priority] || priority;
  };

  const getCategoryText = (category) => {
    const texts = {
      hardware: '硬件',
      software: '软件',
      network: '网络',
      permission: '权限',
      other: '其他',
    };
    return texts[category] || category;
  };

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
          重试
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
          📋 工单列表
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadTickets}
        >
          刷新
        </Button>
      </Box>

      {/* 搜索和过滤器 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        {/* 搜索框 */}
        <TextField
          fullWidth
          placeholder="搜索工单标题、描述或编号..."
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
              label="状态"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">全部状态</MenuItem>
              <MenuItem value="pending">待处理</MenuItem>
              <MenuItem value="in_progress">处理中</MenuItem>
              <MenuItem value="resolved">已解决</MenuItem>
              <MenuItem value="closed">已关闭</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="类别"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">全部类别</MenuItem>
              <MenuItem value="hardware">硬件问题</MenuItem>
              <MenuItem value="software">软件问题</MenuItem>
              <MenuItem value="network">网络问题</MenuItem>
              <MenuItem value="permission">权限问题</MenuItem>
              <MenuItem value="other">其他</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="优先级"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="all">全部优先级</MenuItem>
              <MenuItem value="low">低</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="urgent">紧急</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* 统计信息 */}
      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          显示 {filteredTickets.length} 个工单（共 {tickets.length} 个）
        </Typography>
      </Box>

      {/* 工单列表 */}
      {filteredTickets.length === 0 ? (
        <Alert severity="info">
          {tickets.length === 0 
            ? '暂无工单，点击顶部"创建工单"按钮创建第一个工单吧！'
            : "没有符合条件的工单"
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
                    创建于: {new Date(ticket.created_at).toLocaleString('zh-CN')}
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