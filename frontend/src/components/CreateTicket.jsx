import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, MenuItem, Paper, Typography,
  Alert, CircularProgress
} from '@mui/material';
import { Send, Cancel } from '@mui/icons-material';
import { ticketAPI } from '../services/api';
import { toast } from 'react-toastify';

function CreateTicket() {
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
    
    // 简单验证
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.warning('⚠️ 请填写标题和描述');
      return;
    }

    try {
      setLoading(true);
      
      const response = await ticketAPI.createTicket(formData);
      
      toast.success('✅ 工单创建成功！AI正在分析中...');
      
      // 稍等一下再跳转，让用户看到通知
      setTimeout(() => {
        navigate(`/tickets/${response.data.id}`);
      }, 1000);
      
    } catch (err) {
      toast.error('❌ 创建工单失败: ' + err.message);
      console.error('Error creating ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Typography variant="h4" component="h1" mb={3}>
        ✍️ 创建新工单
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* 标题 */}
          <TextField
            fullWidth
            required
            label="工单标题"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            placeholder="简短描述问题，例如：无法连接WiFi"
          />

          {/* 详细描述 */}
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="详细描述"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            placeholder="详细描述遇到的问题，包括错误信息、尝试过的解决方法等"
          />

          {/* 分类 */}
          <TextField
            fullWidth
            select
            required
            label="问题类别"
            name="category"
            value={formData.category}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="hardware">硬件问题</MenuItem>
            <MenuItem value="software">软件问题</MenuItem>
            <MenuItem value="network">网络问题</MenuItem>
            <MenuItem value="permission">权限问题</MenuItem>
            <MenuItem value="other">其他</MenuItem>
          </TextField>

          {/* 优先级 */}
          <TextField
            fullWidth
            select
            required
            label="优先级"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="low">低 - 不影响工作</MenuItem>
            <MenuItem value="medium">中 - 轻微影响</MenuItem>
            <MenuItem value="high">高 - 严重影响</MenuItem>
            <MenuItem value="urgent">紧急 - 完全无法工作</MenuItem>
          </TextField>

          {/* 员工信息 */}
          <TextField
            fullWidth
            label="员工工号"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            margin="normal"
            helperText="用于识别提交人身份"
          />

          <TextField
            fullWidth
            label="员工姓名"
            name="employee_name_snapshot"
            value={formData.employee_name_snapshot}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="所属部门"
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
              {loading ? '提交中...' : '提交工单'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Cancel />}
              onClick={() => navigate('/')}
              disabled={loading}
            >
              取消
            </Button>
          </Box>
        </form>
      </Paper>

      {/* 提示信息 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        💡 提交后，AI将自动分析您的问题并提供解决建议，请稍候...
      </Alert>
    </Box>
  );
}

export default CreateTicket;