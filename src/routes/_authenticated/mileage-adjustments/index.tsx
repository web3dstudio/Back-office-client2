import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import { useTranslation } from 'react-i18next'
import AverageMileagesTable from '../../../components/MileageAdjustments/AverageMileagesTable'
import MileageAppreciationsTable from '../../../components/MileageAdjustments/MileageAppreciationsTable'
import MileageDeprecationTable from '../../../components/MileageAdjustments/MileageDeprecationTable'

export const Route = createFileRoute('/_authenticated/mileage-adjustments/')({
  component: MileageAdjustmentsPage,
})


function MileageAdjustmentsPage() {
  const { t } = useTranslation()

  return (
    <Grid container spacing={3} >
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid
        size={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'mileageAdjustments' })}
          </Typography>
        </Box>

      </Grid>

      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <Grid container spacing={3} columns={12}>

          <Grid size={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('mileageDepreciations', { ns: 'mileageAdjustments' })}
            </Typography>
          </Grid>
          <Grid size={12}>
            <MileageDeprecationTable />
          </Grid>

          <Grid size={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('mileageAppreciations', { ns: 'mileageAdjustments' })}
            </Typography>
          </Grid>
          <Grid size={12}>
            <MileageAppreciationsTable />
          </Grid>



          <Grid size={12}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('averageMileages', { ns: 'mileageAdjustments' })}
            </Typography>
          </Grid>
          <Grid size={12}>
            <AverageMileagesTable />
          </Grid>
        </Grid>

      </StyledPaper>

    </Grid>
  )
}