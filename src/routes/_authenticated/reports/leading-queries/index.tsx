import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsLeadingQueriesQuery } from '../../../../query/reportsLeadingQueries.query'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/reports/leading-queries/')({
  component: LeadingQueriesPage,
})

function LeadingQueriesPage() {
  const currentDate = new Date()
  const [year] = useState(currentDate.getFullYear())
  const [month] = useState(currentDate.getMonth() + 1)
  const [page] = useState(1)

  const { data, isLoading, error } = useReportsLeadingQueriesQuery({ year, month, page })

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
          Error loading leading queries: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Leading Queries for {month}/{year} (Page {page})
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
