import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box, Select, MenuItem } from '@mui/material';
import { Home, Add, Book, Dashboard as DashIcon, Language as LanguageIcon } from '@mui/icons-material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import TicketDetail from './components/TicketDetail';
import KnowledgeBase from './components/KnowledgeBase';

// 导入翻译功能
import { useTranslation } from './translations';

function App() {
  const { t, language, changeLanguage } = useTranslation();

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        {/* 导航栏 */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {t('appTitle')}
            </Typography>
            
            <Button color="inherit" component={Link} to="/" startIcon={<DashIcon />}>
              {t('dashboard')}
            </Button>
            <Button color="inherit" component={Link} to="/tickets" startIcon={<Home />}>
              {t('ticketList')}
            </Button>
            <Button color="inherit" component={Link} to="/create" startIcon={<Add />}>
              {t('createTicket')}
            </Button>
            <Button color="inherit" component={Link} to="/knowledge" startIcon={<Book />}>
              {t('knowledge')}
            </Button>

            {/* 语言切换器 */}
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <LanguageIcon sx={{ mr: 1, color: 'white' }} />
              <Select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                size="small"
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="en">🇬🇧 English</MenuItem>
                <MenuItem value="fr">🇫🇷 Français</MenuItem>
                <MenuItem value="nl">🇳🇱 Nederlands</MenuItem>
                <MenuItem value="zh">🇨🇳 中文</MenuItem>
              </Select>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 主内容区 */}
        <Container sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/create" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
          </Routes>
        </Container>

        {/* Toast通知容器 */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Box>
    </Router>
  );
}

export default App;