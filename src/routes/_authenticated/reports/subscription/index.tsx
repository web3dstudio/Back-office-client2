import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsCustomersQuery } from '../../../../query/reportsCustomers.query'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/reports/subscription/')({
  component: SubscriptionPage,
})

function SubscriptionPage() {
  const [page] = useState(1)
  const { data, isLoading, error } = useReportsCustomersQuery({ page })

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
          Error loading subscription: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Subscription (Page {page})
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
