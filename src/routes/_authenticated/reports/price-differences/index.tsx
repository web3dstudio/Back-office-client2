import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsPriceDifferencesQuery } from '../../../../query/reportsPriceDifferences.query'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/reports/price-differences/')({
  component: PriceDifferencesPage,
})

function PriceDifferencesPage() {
  const [manufacturerYear] = useState(2019)
  const [modelCode] = useState('2323')

  const { data, isLoading, error } = useReportsPriceDifferencesQuery({ manufacturerYear, modelCode })

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
          Error loading price differences: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Price Differences (Year: {manufacturerYear}, Model: {modelCode})
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
