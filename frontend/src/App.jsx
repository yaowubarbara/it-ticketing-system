import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { Home, Add, Book, Dashboard as DashIcon } from '@mui/icons-material';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import CreateTicket from './components/CreateTicket';
import TicketDetail from './components/TicketDetail';
import KnowledgeBase from './components/KnowledgeBase';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const { t } = useTranslation(['common']);

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        {/* 导航栏 */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🎫 {t('common:appTitle')}
            </Typography>
            <Button color="inherit" component={Link} to="/" startIcon={<DashIcon />}>
              {t('common:nav.dashboard')}
            </Button>
            <Button color="inherit" component={Link} to="/tickets" startIcon={<Home />}>
              {t('common:nav.ticketList')}
            </Button>
            <Button color="inherit" component={Link} to="/create" startIcon={<Add />}>
              {t('common:nav.createTicket')}
            </Button>
            <Button color="inherit" component={Link} to="/knowledge" startIcon={<Book />}>
              {t('common:nav.knowledgeBase')}
            </Button>
            <LanguageSwitcher />
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