import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['common', 'knowledge']);
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
      setError(t('knowledge:messages.loadError') + ': ' + err.message);
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
      toast.success(t('knowledge:messages.createSuccess'));
    } catch (err) {
      toast.error(t('knowledge:messages.createError') + ': ' + err.message);
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
      toast.success(t('knowledge:messages.updateSuccess'));
    } catch (err) {
      toast.error(t('knowledge:messages.updateError') + ': ' + err.message);
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
      toast.success(t('knowledge:messages.deleteSuccess'));
    } catch (err) {
      toast.error(t('knowledge:messages.deleteError') + ': ' + err.message);
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
    return t(`knowledge:category.${category}`, category);
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
          📚 {t('knowledge:title')}
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadKnowledge}
          >
            {t('common:actions.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            {t('knowledge:actions.createDocument')}
          </Button>
        </Box>
      </Box>

      {/* 统计信息 */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="body2">
          {t('knowledge:stats.total', { count: knowledgeList.length })}
        </Typography>
      </Paper>

      {/* 知识库列表 */}
      {knowledgeList.length === 0 ? (
        <Alert severity="info">
          {t('knowledge:list.noDocuments')}
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
                        {t('knowledge:actions.editDocument')}
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
                        {t('knowledge:actions.deleteDocument')}
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
                      {t('knowledge:stats.usageCount')}: {kb.usage_count} | {t('knowledge:stats.successRate')}: {(kb.success_rate * 100).toFixed(0)}%
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
        <DialogTitle>{t('knowledge:dialog.createTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('knowledge:form.title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label={t('knowledge:form.content')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
            required
            placeholder={t('knowledge:form.contentPlaceholder')}
          />
          <TextField
            select
            fullWidth
            label={t('knowledge:form.category')}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          >
            <MenuItem value="hardware">{t('knowledge:category.hardware')}</MenuItem>
            <MenuItem value="software">{t('knowledge:category.software')}</MenuItem>
            <MenuItem value="network">{t('knowledge:category.network')}</MenuItem>
            <MenuItem value="permission">{t('knowledge:category.permission')}</MenuItem>
            <MenuItem value="other">{t('knowledge:category.other')}</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label={t('knowledge:form.tags')}
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            margin="normal"
            placeholder={t('knowledge:form.tagsPlaceholder')}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            💡 {t('knowledge:dialog.aiHint')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('common:actions.cancel')}</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={operationLoading || !formData.title || !formData.content}
          >
            {operationLoading ? t('common:creating') : t('common:actions.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('knowledge:dialog.editTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('knowledge:form.title')}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            label={t('knowledge:form.content')}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label={t('knowledge:form.category')}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          >
            <MenuItem value="hardware">{t('knowledge:category.hardware')}</MenuItem>
            <MenuItem value="software">{t('knowledge:category.software')}</MenuItem>
            <MenuItem value="network">{t('knowledge:category.network')}</MenuItem>
            <MenuItem value="permission">{t('knowledge:category.permission')}</MenuItem>
            <MenuItem value="other">{t('knowledge:category.other')}</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label={t('knowledge:form.tags')}
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common:actions.cancel')}</Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? t('common:saving') : t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('knowledge:dialog.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('knowledge:dialog.deleteConfirm', { title: currentKnowledge?.title })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common:actions.cancel')}</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={operationLoading}
          >
            {operationLoading ? t('common:deleting') : t('common:actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KnowledgeBase;