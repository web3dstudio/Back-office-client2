import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import { useReportsCarsByYearsQuery } from '../../../../query/statistics/reportsCarsByYears.query'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import StyledPaper from '../../../../components/StyledPaper'
import CarsByYearsChart from '../../../../components/CarsByYearsChart'

export const Route = createFileRoute('/_authenticated/reports/car-by-years/')({
  component: CarByYearsPage,
})

function CarByYearsPage() {
  const { data: carsByYears, isLoading, error } = useReportsCarsByYearsQuery()

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : error ? (
          <AppError error={error} />
        ) : carsByYears && carsByYears.length > 0 ? (
          <CarsByYearsChart data={carsByYears} />
        ) : null}
      </StyledPaper>
    </Box>
  )
}
