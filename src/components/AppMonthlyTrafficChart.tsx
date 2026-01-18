import { Box, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTranslation } from 'react-i18next'
import type { TReportsStatistics } from '../types'
import { alpha, useTheme } from '@mui/material/styles'

type Props = {
  dataset: TReportsStatistics
}

export default function AppMonthlyTrafficChart({ dataset }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const pieData = [
    { id: 0, value: dataset.organic.percent, label: t('organic', { ns: 'reportsStatistics' }), color: alpha(theme.palette.primary.main, 0.8) },
    { id: 1, value: dataset.direct.percent, label: t('direct', { ns: 'reportsStatistics' }), color: alpha(theme.palette.primary.main, 0.5) },
    { id: 2, value: dataset.reference.percent, label: t('reference', { ns: 'reportsStatistics' }), color: alpha(theme.palette.primary.main, 0.3) },
  ]

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('trafficChannels', { ns: 'reportsStatistics' })}
      </Typography>

      {pieData.length > 0 && (
        <Grid container spacing={3} alignItems="center" columns={12}>
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flex: { xs: '1 1 auto', md: '0 0 300px' },
              maxWidth: { xs: '100%', md: 300 },
            }}
          >
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 8,
                  outerRadius: 120,
                  paddingAngle: 1,
                  cornerRadius: 8,
                  arcLabel: (item) => `${item.value}%`,
                  arcLabelMinAngle: 10,
                },
              ]}
              slotProps={{ legend: { sx: { display: 'none' } } }}
              width={300}
              height={300}
            />
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ flex: { xs: '1 1 auto', md: '1 1 0' }, minWidth: 0 }}>
            <TableContainer component={Paper} elevation={0} sx={{ width: '100%', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('trafficChannels', { ns: 'reportsStatistics' })}</TableCell>
                    <TableCell align="right">{t('sessions', { ns: 'reportsStatistics' })}</TableCell>
                    <TableCell align="right">{t('percent', { ns: 'reportsStatistics' })}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pieData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: row.color,
                              border: '1px solid rgba(0,0,0,0.12)',
                              flex: '0 0 auto',
                            }}
                          />
                          <Typography variant="body2">{row.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {row.id === 0 ? dataset.organic.total : row.id === 1 ? dataset.direct.total : dataset.reference.total}
                      </TableCell>
                      <TableCell align="right">{row.value}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

