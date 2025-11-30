import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsSearchQueriesQuery } from '../../../../query/reportsSearchQueries.query'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/reports/search-queries/')({
  component: SearchQueriesPage,
})

function SearchQueriesPage() {
  const currentDate = new Date()
  const [year] = useState(currentDate.getFullYear())
  const [month] = useState(currentDate.getMonth() + 1)

  const { data, isLoading, error } = useReportsSearchQueriesQuery({ year, month })

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
          Error loading search queries: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search Queries for {month}/{year}
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
