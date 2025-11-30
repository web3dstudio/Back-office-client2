import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsCarsByYearsQuery } from '../../../../query/reportsCarsByYears.query'

export const Route = createFileRoute('/_authenticated/reports/car-by-years/')({
  component: CarByYearsPage,
})

function CarByYearsPage() {
  const { data, isLoading, error } = useReportsCarsByYearsQuery()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Error loading cars by years: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cars By Years
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
