import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import AppLoading from '../../../components/AppLoading'
import { useCarQuery } from '../../../query/car.query'
import CarForm from '../../../components/Car/CarForm'
import { Box, Grid, Typography } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'

export const Route = createFileRoute('/_authenticated/catalog/$id')({
  component: EditCarPage,
})

function EditCarPage() {
  const { id } = Route.useParams()
  const { t } = useTranslation()
  const { data: car, isLoading } = useCarQuery(id)

  console.log(car)

  if (isLoading) return <AppLoading />

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
            {t('title', { ns: 'carCatalog' })}
            {car?.model?.name} { }
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>

      <CarForm data={car || null} />
    </Grid>
  )
}
