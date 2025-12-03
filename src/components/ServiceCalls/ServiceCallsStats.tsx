import { Box, Typography, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../StyledPaper'
import type { TServiceCallsStats } from '../../types'

interface ServiceCallsStatsProps {
  stats: TServiceCallsStats | undefined
  isLoading: boolean
}

function ServiceCallsStats({ stats, isLoading }: ServiceCallsStatsProps) {
  const { t } = useTranslation('serviceCalls')

  return (
    <StyledPaper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid size={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('total') || 'Total'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {isLoading || !stats ? '--' : stats.total}
            </Typography>
          </Box>
        </Grid>
        <Grid size={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('open')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {isLoading || !stats ? '--' : stats.open}
            </Typography>
          </Box>
        </Grid>
        <Grid size={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('inProgress')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {isLoading || !stats ? '--' : stats.inProgress}
            </Typography>
          </Box>
        </Grid>
        <Grid size={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t('close')}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {isLoading || !stats ? '--' : stats.closed}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </StyledPaper>
  )
}

export default ServiceCallsStats

