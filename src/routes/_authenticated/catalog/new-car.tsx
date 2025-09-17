import { Box, Grid, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import AppBackBtn from '../../../components/AppBackBtn'
import CarForm from '../../../components/Car/CarForm'

export const Route = createFileRoute('/_authenticated/catalog/new-car')({
  component: NewCarPage
})

function NewCarPage() {
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('newCar', { ns: 'carCatalog' })}

          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>

      <CarForm data={null} />
    </Grid>
  )
}
