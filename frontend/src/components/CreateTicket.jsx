import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, TextField, Button, MenuItem, Paper, Typography,
  Alert, CircularProgress
} from '@mui/material';
import { Send, Cancel } from '@mui/icons-material';
import { ticketAPI } from '../services/api';
import { toast } from 'react-toastify';

function CreateTicket() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'ticket']);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'software',
    priority: 'medium',
    employee_id: 'W001',
    employee_name_snapshot: 'Wang Xiaoming',
    department_snapshot: 'Marketing',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 简单验证
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.warning(`⚠️ ${t('ticket:messages.validationTitle')}`);
      return;
    }

    try {
      setLoading(true);
      
      const response = await ticketAPI.createTicket(formData);

      toast.success(`✅ ${t('ticket:messages.createSuccess')}`);
      
      // 稍等一下再跳转，让用户看到通知
      setTimeout(() => {
        navigate(`/tickets/${response.data.id}`);
      }, 1000);
      
    } catch (err) {
      toast.error(`❌ ${t('ticket:messages.createError')}: ${err.message}`);
      console.error('Error creating ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" component="h1" mb={3}>
        ✍️ {t('ticket:create.title')}
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* 标题 */}
          <TextField
            fullWidth
            required
            label={t('ticket:form.title')}
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            placeholder={t('ticket:form.titlePlaceholder')}
          />

          {/* 详细描述 */}
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label={t('ticket:form.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            placeholder={t('ticket:form.descriptionPlaceholder')}
          />

          {/* 分类 */}
          <TextField
            fullWidth
            select
            required
            label={t('ticket:form.category')}
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="hardware">{t('ticket:category.hardware')}</MenuItem>
            <MenuItem value="software">{t('ticket:category.software')}</MenuItem>
            <MenuItem value="network">{t('ticket:category.network')}</MenuItem>
            <MenuItem value="permission">{t('ticket:category.permission')}</MenuItem>
            <MenuItem value="other">{t('ticket:category.other')}</MenuItem>
          </TextField>

          {/* 优先级 */}
          <TextField
            fullWidth
            select
            required
            label={t('ticket:form.priority')}
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="low">{t('ticket:priorityDesc.low')}</MenuItem>
            <MenuItem value="medium">{t('ticket:priorityDesc.medium')}</MenuItem>
            <MenuItem value="high">{t('ticket:priorityDesc.high')}</MenuItem>
            <MenuItem value="urgent">{t('ticket:priorityDesc.urgent')}</MenuItem>
          </TextField>

          {/* 员工信息 */}
          <TextField
            fullWidth
            label={t('ticket:form.employeeId')}
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            margin="normal"
            helperText={t('ticket:form.employeeIdHelper')}
          />

          <TextField
            fullWidth
            label={t('ticket:form.employeeName')}
            name="employee_name_snapshot"
            value={formData.employee_name_snapshot}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label={t('ticket:form.department')}
            name="department_snapshot"
            value={formData.department_snapshot}
            onChange={handleChange}
            margin="normal"
          />

          {/* 按钮 */}
          <Box mt={3} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              disabled={loading}
            >
              {loading ? t('common:submitting') : t('ticket:create.submitButton')}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Cancel />}
              onClick={() => navigate('/')}
              disabled={loading}
            >
              {t('common:actions.cancel')}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* 提示信息 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        💡 {t('ticket:create.aiHint')}
      </Alert>
    </Box>
  );
}

export default CreateTicket;