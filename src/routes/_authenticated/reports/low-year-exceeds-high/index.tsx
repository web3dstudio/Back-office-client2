import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsLowYearExceedsHighQuery } from '../../../../query/reportsLowYearExceedsHigh.query'

export const Route = createFileRoute('/_authenticated/reports/low-year-exceeds-high/')({
  component: LowYearExceedsHighPage,
})

function LowYearExceedsHighPage() {
  const { data, isLoading, error } = useReportsLowYearExceedsHighQuery()

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
          Error loading low year exceeds high: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Low Year Exceeds High
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
