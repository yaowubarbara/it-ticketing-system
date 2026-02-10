import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, Box, Typography } from '@mui/material';
import { Language } from '@mui/icons-material';

const languages = [
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const handleChange = (event) => {
    const newLang = event.target.value;
    setCurrentLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
      <Language sx={{ mr: 1, color: 'white' }} />
      <Select
        value={currentLanguage}
        onChange={handleChange}
        variant="standard"
        sx={{
          color: 'white',
          '& .MuiSelect-icon': { color: 'white' },
          '&:before': { borderColor: 'rgba(255, 255, 255, 0.5)' },
          '&:after': { borderColor: 'white' },
          '&:hover:not(.Mui-disabled):before': { borderColor: 'white' },
        }}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="span">{lang.flag}</Typography>
              <Typography component="span">{lang.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}

export default LanguageSwitcher;
