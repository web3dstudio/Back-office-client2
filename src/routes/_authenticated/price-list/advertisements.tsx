import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Grid, Typography } from '@mui/material'
import PriceListAdvertisementsTabs from '../../../components/PriceListAdvertisementsTabs'
import { useTranslation } from 'react-i18next'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'

export const Route = createFileRoute('/_authenticated/price-list/advertisements')({
  component: PriceListAdvertisementsLayout,
})

function PriceListAdvertisementsLayout() {
  const { t } = useTranslation()

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid size={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
          {t('title', { ns: 'priceListAdvertisements' })}
        </Typography>
      </Grid>
      <Grid size={12}>
        <PriceListAdvertisementsTabs />
      </Grid>
      <Grid size={12}>
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
          <Outlet />
        </StyledPaper>
      </Grid>
    </Grid>
  )
}


