import { Box, Typography } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import { useTranslation } from 'react-i18next'
import ExternalStatusesTable from '../../../components/Statuses/ExternalStatusesTable'
import InternalStatusesTable from '../../../components/Statuses/InternalStatusesTable'

export const Route = createFileRoute('/_authenticated/statuses/')({
  component: StatusesPage,
})

function StatusesPage() {
  const { t } = useTranslation()

  return (
    <Grid container spacing={3} >
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'statuses' })}
          </Typography>
        </Box>

      </Grid>

      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <Grid container spacing={3} columns={12}>


          <ExternalStatusesTable />
          <InternalStatusesTable />





        </Grid>

      </StyledPaper>

    </Grid>
  )
}


