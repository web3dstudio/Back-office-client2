import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import CustomerForm from '../../../components/Customers/CustomerForm'
import StyledPaper from '../../../components/StyledPaper'
import { useGetCustomerQuery } from '../../../query/customers.query'
import AppLoading from '../../../components/AppLoading'


export const Route = createFileRoute('/_authenticated/customers/$id')({
  component: EditCustomerPage,
})

function EditCustomerPage() {
  const { t } = useTranslation()
  const { id } = Route.useParams()

  const { data: customer, isLoading } = useGetCustomerQuery(id)

  if (isLoading) return <AppLoading />

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid
        size={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('editTitle', { ns: 'customer' })} {customer?.firstName} {customer?.lastName}
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>

      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
        display: 'flex',
        gap: 2,
      }}>
        <CustomerForm
          customer={customer || null}
        />
      </StyledPaper>
    </Grid>
  )
}
