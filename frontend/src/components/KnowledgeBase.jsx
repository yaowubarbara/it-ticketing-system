import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Card, CardContent,
  Grid, Chip, CircularProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Refresh, Book } from '@mui/icons-material';
import { knowledgeAPI } from '../services/api';
import { toast } from 'react-toastify';

function KnowledgeBase() {
  const navigate = useNavigate();
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentKnowledge, setCurrentKnowledge] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // 表单数据
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'hardware',
    tags: '',
    created_by: 'IT001'
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await knowledgeAPI.getKnowledgeBase();
      setKnowledgeList(response.data);
    } catch (err) {
      setError('加载知识库失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setOperationLoading(true);
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      await knowledgeAPI.createKnowledge(data);
      setCreateDialogOpen(false);
      setFormData({ title: '', content: '', category: 'hardware', tags: '', created_by: 'IT001' });
      loadKnowledge();
      toast.success('知识库文档创建成功！向量已自动生成。');
    } catch (err) {
      toast.error('创建失败: ' + err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setOperationLoading(true);
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      await knowledgeAPI.updateKnowledge(currentKnowledge.id, data);
      setEditDialogOpen(false);
      setCurrentKnowledge(null);
      loadKnowledge();
      toast.success('知识库文档更新成功！向量已重新生成。');
    } catch (err) {
      toast.error('更新失败: ' + err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setOperationLoading(true);
      await knowledgeAPI.deleteKnowledge(currentKnowledge.id);
      setDeleteDialogOpen(false);
      setCurrentKnowledge(null);
      loadKnowledge();
      toast.success('知识库文档已删除！');
    } catch (err) {
      toast.error('删除失败: ' + err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const openEditDialog = (knowledge) => {
    setCurrentKnowledge(knowledge);
    setFormData({
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category,
      tags: knowledge.tags.join(', '),
      created_by: knowledge.created_by
    });
    setEditDialogOpen(true);
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
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* 标题栏 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          📚 知识库管理
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadKnowledge}
          >
            刷新
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            新建文档
          </Button>
        </Box>
      </Box>

      {/* 统计信息 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2">
          共 {knowledgeList.length} 篇知识库文档
        </Typography>
      </Paper>

      {/* 知识库列表 */}
      {knowledgeList.length === 0 ? (
        <Alert severity="info">
          暂无知识库文档，点击"新建文档"开始添加！
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {knowledgeList.map((kb) => (
            <Grid item xs={12} md={6} key={kb.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        <Book sx={{ verticalAlign: 'middle', mr: 1 }} />
                        {kb.title}
                      </Typography>
                      <Chip 
                        label={getCategoryText(kb.category)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {kb.tags && kb.tags.map((tag, index) => (
                        <Chip 
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(kb)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => {
                          setCurrentKnowledge(kb);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        删除
                      </Button>
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {kb.content}
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      使用次数: {kb.usage_count} | 成功率: {(kb.success_rate * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 创建对话框 */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>新建知识库文档</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="内容"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            required
            placeholder="详细描述问题的解决方案..."
          />
          <TextField
            select
            fullWidth
            label="类别"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          >
            <MenuItem value="hardware">硬件问题</MenuItem>
            <MenuItem value="software">软件问题</MenuItem>
            <MenuItem value="network">网络问题</MenuItem>
            <MenuItem value="permission">权限问题</MenuItem>
            <MenuItem value="other">其他</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="标签"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            margin="normal"
            placeholder="多个标签用逗号分隔，例如：打印机, HP, 彩色"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            💡 保存后将自动生成向量，用于AI智能推荐相似案例
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained"
            disabled={operationLoading || !formData.title || !formData.content}
          >
            {operationLoading ? '创建中...' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>编辑知识库文档</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="标题"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label="内容"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="类别"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          >
            <MenuItem value="hardware">硬件问题</MenuItem>
            <MenuItem value="software">软件问题</MenuItem>
            <MenuItem value="network">网络问题</MenuItem>
            <MenuItem value="permission">权限问题</MenuItem>
            <MenuItem value="other">其他</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="标签"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleEdit} 
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除知识库文档 "{currentKnowledge?.title}" 吗？此操作不可恢复。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KnowledgeBase;