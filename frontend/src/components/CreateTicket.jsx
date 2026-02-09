import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, MenuItem, Paper, Typography,
  Alert, CircularProgress
} from '@mui/material';
import { Send, Cancel } from '@mui/icons-material';
import { ticketAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from '../translations';

function CreateTicket() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.warning('⚠️ ' + t('fillTitleDesc'));
      return;
    }

    try {
      setLoading(true);
      
      const response = await ticketAPI.createTicket(formData);
      
      toast.success(t('createSuccess'));
      
      // 稍等一下再跳转，让用户看到通知
      setTimeout(() => {
        navigate(`/tickets/${response.data.id}`);
      }, 1000);
      
    } catch (err) {
      toast.error('❌ ' + t('createFailed') + ': ' + err.message);
      console.error('Error creating ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" component="h1" mb={3}>
        {t('createTicketTitle')}
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label={t('ticketTitleLabel')}
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            placeholder={t('titlePlaceholder')}
          />

          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label={t('descriptionLabel')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            placeholder={t('descriptionPlaceholder')}
          />

          <TextField
            fullWidth
            select
            required
            label={t('categoryLabel')}
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="hardware">{t('categories.hardware')}</MenuItem>
            <MenuItem value="software">{t('categories.software')}</MenuItem>
            <MenuItem value="network">{t('categories.network')}</MenuItem>
            <MenuItem value="permission">{t('categories.permission')}</MenuItem>
            <MenuItem value="other">{t('categories.other')}</MenuItem>
          </TextField>

          <TextField
            fullWidth
            select
            required
            label={t('priorityLabel')}
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="low">{t('lowDesc')}</MenuItem>
            <MenuItem value="medium">{t('mediumDesc')}</MenuItem>
            <MenuItem value="high">{t('highDesc')}</MenuItem>
            <MenuItem value="urgent">{t('urgentDesc')}</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label={t('employeeId')}
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            margin="normal"
            helperText={t('employeeIdHelper')}
          />

          <TextField
            fullWidth
            label={t('employeeName')}
            name="employee_name_snapshot"
            value={formData.employee_name_snapshot}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label={t('department')}
            name="department_snapshot"
            value={formData.department_snapshot}
            onChange={handleChange}
            margin="normal"
          />

          <Box mt={3} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              disabled={loading}
            >
              {loading ? t('submitting') : t('submitTicket')}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Cancel />}
              onClick={() => navigate('/')}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
          </Box>
        </form>
      </Paper>

      <Alert severity="info" sx={{ mt: 3 }}>
        {t('createTicketTip')}
      </Alert>
    </Box>
  );
}

export default CreateTicket;