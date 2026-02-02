import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  CircularProgress, Alert, Chip
} from '@mui/material';
import {
  Assignment, Pending, PlayArrow, CheckCircle,
  Computer, Wifi, Build, VpnKey, MoreHoriz
} from '@mui/icons-material';
import { ticketAPI } from '../services/api';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTickets();
      setTickets(response.data);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    hardware: tickets.filter(t => t.category === 'hardware').length,
    software: tickets.filter(t => t.category === 'software').length,
    network: tickets.filter(t => t.category === 'network').length,
    permission: tickets.filter(t => t.category === 'permission').length,
    other: tickets.filter(t => t.category === 'other').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        📊 数据统计看板
      </Typography>

      {/* 总览卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 总工单数 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    总工单数
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.total}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 48, color: '#1976d2', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 待处理 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    待处理
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.pending}
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 48, color: '#f57c00', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 处理中 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e1f5fe' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    处理中
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.in_progress}
                  </Typography>
                </Box>
                <PlayArrow sx={{ fontSize: 48, color: '#0288d1', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 已完成 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    已完成
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.resolved + stats.closed}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: '#388e3c', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 类别分布 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📁 问题类别分布
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Box textAlign="center">
              <Computer sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.hardware}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                硬件问题
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Box textAlign="center">
              <Build sx={{ fontSize: 48, color: '#388e3c', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.software}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                软件问题
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Box textAlign="center">
              <Wifi sx={{ fontSize: 48, color: '#f57c00', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.network}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                网络问题
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Box textAlign="center">
              <VpnKey sx={{ fontSize: 48, color: '#7b1fa2', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.permission}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                权限问题
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Box textAlign="center">
              <MoreHoriz sx={{ fontSize: 48, color: '#616161', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {stats.other}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                其他
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 优先级统计 */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚠️ 优先级分布
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography>紧急工单</Typography>
            <Chip 
              label={stats.urgent} 
              color="error" 
              sx={{ minWidth: 50, fontWeight: 'bold' }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography>高优先级</Typography>
            <Chip 
              label={tickets.filter(t => t.priority === 'high').length} 
              color="warning"
              sx={{ minWidth: 50, fontWeight: 'bold' }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography>中优先级</Typography>
            <Chip 
              label={tickets.filter(t => t.priority === 'medium').length} 
              color="primary"
              sx={{ minWidth: 50, fontWeight: 'bold' }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>低优先级</Typography>
            <Chip 
              label={tickets.filter(t => t.priority === 'low').length} 
              color="default"
              sx={{ minWidth: 50, fontWeight: 'bold' }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 快速洞察 */}
      {stats.urgent > 0 && (
        <Alert severity="error" sx={{ mt: 3 }}>
          ⚠️ 注意：当前有 {stats.urgent} 个紧急工单需要立即处理！
        </Alert>
      )}

      {stats.pending > 5 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          📌 提示：有 {stats.pending} 个待处理工单，建议尽快分配。
        </Alert>
      )}
    </Box>
  );
}

export default Dashboard;