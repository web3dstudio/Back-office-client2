import { createFileRoute } from '@tanstack/react-router'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useReportsCatalogItemsQuery } from '../../../../query/reportsCatalogItems.query'

export const Route = createFileRoute('/_authenticated/reports/catalog-items/')({
  component: CatalogItemsPage,
})

function CatalogItemsPage() {
  const { data, isLoading, error } = useReportsCatalogItemsQuery()

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
          Error loading catalog items: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Catalog Items
      </Typography>
      <Box>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Box>
    </Box>
  )
}
