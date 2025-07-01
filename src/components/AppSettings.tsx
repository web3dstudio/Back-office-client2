import {
  ArticleOutlined,
  HandymanOutlined,
  Person2Outlined,
  SettingsOutlined,
} from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

function AppSettings() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Box>
      <Tooltip title={t('header.support', { ns: 'common' })}>
        <IconButton
          color='inherit'
          onClick={() => navigate({ to: '/tech-support' })}
        >
          <HandymanOutlined />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('header.users', { ns: 'common' })}>
        <IconButton color='inherit' onClick={() => navigate({ to: '/users' })}>
          <Person2Outlined />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('header.reports', { ns: 'common' })}>
        <IconButton
          color='inherit'
          onClick={() => navigate({ to: '/reports' })}
        >
          <ArticleOutlined />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('header.settings', { ns: 'common' })}>
        <IconButton
          color='inherit'
          onClick={() => navigate({ to: '/settings' })}
        >
          <SettingsOutlined />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export default AppSettings
