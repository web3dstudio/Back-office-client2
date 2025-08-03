import { Box, Typography, Grid } from '@mui/material'
import type { TCarsList } from '../types'

interface CarDetailsProps {
  car: TCarsList
}

export default function CarDetails({ car }: CarDetailsProps) {
  return (
    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
      <Grid container spacing={2}>
        <Grid size={3}>
          <Typography variant="subtitle2" color="textSecondary">
            Годы производства:
          </Typography>
          <Typography variant="body2">
            {car.fromYear} - {car.toYear}
          </Typography>
        </Grid>
        <Grid size={3}>
          <Typography variant="subtitle2" color="textSecondary">
            Объем двигателя:
          </Typography>
          <Typography variant="body2">
            {car.volume}
          </Typography>
        </Grid>
        <Grid size={3}>
          <Typography variant="subtitle2" color="textSecondary">
            Коробка передач:
          </Typography>
          <Typography variant="body2">
            {car.gearbox}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
} 