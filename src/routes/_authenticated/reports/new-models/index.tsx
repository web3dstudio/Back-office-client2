import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsNewModelsQuery } from '../../../../query/reportsNewModels.query'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/reports/new-models/')({
  component: NewModelsPage,
})

function NewModelsPage() {
  const currentDate = new Date()
  const [year] = useState(currentDate.getFullYear())
  const [month] = useState(currentDate.getMonth() + 1)
  const [page] = useState(1)

  const { data, isLoading, error } = useReportsNewModelsQuery({ year, month, page })

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
          Error loading new models: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        New Models for {month}/{year} (Page {page})
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
