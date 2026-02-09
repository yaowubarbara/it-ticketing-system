import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Chip, Button, CircularProgress,
  Grid, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Assignment,
  CalendarToday, Category, PriorityHigh
} from '@mui/icons-material';
import { ticketAPI, employeeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from '../translations';

function TicketDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  // 对话框状态
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  // 轮询 interval
  const pollingIntervalRef = useRef(null);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getTicket(id);
      const raw = response.data;

      // 从后端 ai_responses 数组里挑一条出来，映射成前端用的 ai_response
      let ai_response = null;
      if (Array.isArray(raw.ai_responses) && raw.ai_responses.length > 0) {
        const first = raw.ai_responses[0];
        ai_response = {
          ...first,
          // 字符串 -> 数字，避免后面 * 100 出 NaN
          confidence_score: first.confidence_score != null
            ? Number(first.confidence_score)
            : null,
        };
      }

      setTicket({
        ...raw,
        ai_response,
      });
    } catch (err) {
      toast.error(t('loadTicketFailed') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getEmployees();
      setEmployees(response.data);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  // 初始加载
  useEffect(() => {
    loadTicket();
    loadEmployees();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [id]);

  // 轮询逻辑
  useEffect(() => {
    if (!ticket) return;

    const needsPolling =
      ['pending', 'in_progress'].includes(ticket.status) &&
      !ticket.ai_response;

    if (needsPolling) {
      // 避免重复创建 interval
      if (!pollingIntervalRef.current) {
        console.log('🔄 开始轮询AI分析状态...');
        pollingIntervalRef.current = setInterval(() => {
          console.log('🔍 检查AI分析进度...');
          loadTicket();
        }, 5000);
      }
    } else {
      if (pollingIntervalRef.current) {
        console.log('✅ AI分析完成，停止轮询');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [ticket]);

  const handleAssign = async () => {
    if (!selectedEmployee) {
      toast.warning('⚠️ ' + t('pleaseSelectIT'));
      return;
    }

    try {
      setOperationLoading(true);
      await ticketAPI.assignTicket(id, { assigned_to: selectedEmployee });
      setAssignDialogOpen(false);
      setSelectedEmployee('');
      loadTicket();
      toast.success(t('assignSuccess'));
    } catch (err) {
      toast.error(t('assignFailed') + ': ' + err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      toast.warning('⚠️ ' + t('pleaseFillResolution'));
      return;
    }

    try {
      setOperationLoading(true);
      await ticketAPI.resolveTicket(id, { resolution_notes: resolutionNotes });
      setResolveDialogOpen(false);
      setResolutionNotes('');
      loadTicket();
      toast.success(t('resolveSuccess'));
    } catch (err) {
      toast.error(t('operationFailed') + ': ' + err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      setOperationLoading(true);
      await ticketAPI.closeTicket(id);
      setCloseDialogOpen(false);
      loadTicket();
      toast.success(t('closeSuccess'));
    } catch (err) {
      toast.error(t('closeFailed') + ': ' + err.message);
    } finally {
      setOperationLoading(false);
    }
  };

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
      low: 'success',
      medium: 'info',
      high: 'warning',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => t(`priorities.${priority}`) || priority;
  const getCategoryText = (category) => t(`categories.${category}`) || category;

  if (loading && !ticket) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box>
        <Alert severity="error">{t('ticketNotFound')}</Alert>
        <Button onClick={() => navigate('/tickets')} sx={{ mt: 2 }}>
          {t('backToList')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* 头部 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tickets')}
          >
            {t('backToList')}
          </Button>
          <Typography variant="h5">
            {t('ticketDetailTitle')} - {ticket.ticket_number}
          </Typography>
        </Box>
        <Chip
          label={getStatusText(ticket.status)}
          color={getStatusColor(ticket.status)}
        />
      </Box>

      <Grid container spacing={3}>
        {/* 左侧：工单信息 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {ticket.title}
            </Typography>

            <Box display="flex" gap={2} my={2} flexWrap="wrap">
              <Chip
                icon={<Category />}
                label={getCategoryText(ticket.category)}
                size="small"
              />
              <Chip
                icon={<PriorityHigh />}
                label={getPriorityText(ticket.priority)}
                color={getPriorityColor(ticket.priority)}
                size="small"
              />
              <Chip
                icon={<CalendarToday />}
                label={new Date(ticket.created_at).toLocaleString()}
                size="small"
                variant="outlined"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" color="text.secondary" paragraph>
              {ticket.description}
            </Typography>

            {ticket.resolution_notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  {t('resolutionLabel')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ticket.resolution_notes}
                </Typography>
              </>
            )}
          </Paper>

          {/* AI 建议 */}
          {ticket.ai_response ? (
            <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom color="primary">
                {t('aiSuggestions')}
              </Typography>

              <Box my={2}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('suggestedCategory')}
                </Typography>
                <Chip
                  label={getCategoryText(ticket.ai_response.suggested_category)}
                  color="primary"
                  size="small"
                />
                {ticket.ai_response.confidence_score != null && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {t('confidence')}:{' '}
                    {(ticket.ai_response.confidence_score * 100).toFixed(0)}%
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                {t('solutionSuggestion')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-line',
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                {ticket.ai_response.suggested_solution}
              </Typography>
            </Paper>
          ) : (
            <Alert severity="info" icon={<CircularProgress size={20} />}>
              {t('aiAnalyzing')}
            </Alert>
          )}
        </Grid>

        {/* 右侧：操作和信息 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('ticketInfo')}
            </Typography>

            <Box my={2}>
              <Typography variant="body2" color="text.secondary">
                {t('submitter')}：{ticket.employee_name_snapshot}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('employeeIdShort')}：{ticket.employee_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('departmentShort')}：{ticket.department_snapshot}
              </Typography>
            </Box>

            {ticket.assigned_to && (
              <Box my={2}>
                <Typography variant="body2" color="text.secondary">
                  {t('assignee')}：{ticket.assigned_to}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 操作按钮 */}
            <Box display="flex" flexDirection="column" gap={1}>
              {ticket.status === 'pending' && (
                <Button
                  variant="contained"
                  startIcon={<Assignment />}
                  onClick={() => setAssignDialogOpen(true)}
                  fullWidth
                >
                  {t('assignTicket')}
                </Button>
              )}

              {ticket.status === 'in_progress' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => setResolveDialogOpen(true)}
                  fullWidth
                >
                  {t('markResolved')}
                </Button>
              )}

              {ticket.status === 'resolved' && (
                <Button
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={() => setCloseDialogOpen(true)}
                  fullWidth
                >
                  {t('closeTicket')}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 分配对话框 */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>分配工单</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="选择IT人员"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            margin="normal"
          >
            {employees.map((emp) => (
              <MenuItem key={emp.employee_id} value={emp.employee_id}>
                {emp.name} ({emp.employee_id})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : '确认分配'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 解决对话框 */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)}>
        <DialogTitle>标记为已解决</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="解决方案备注"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            margin="normal"
            placeholder="请描述如何解决了这个问题..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleResolve}
            variant="contained"
            color="success"
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : '确认解决'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 关闭对话框 */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)}>
        <DialogTitle>关闭工单</DialogTitle>
        <DialogContent>
          <Typography>确认关闭此工单吗？关闭后将无法再修改。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleClose}
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? <CircularProgress size={20} /> : '确认关闭'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TicketDetail;
