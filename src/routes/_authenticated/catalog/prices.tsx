import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Grid, Box, Typography } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'

export const Route = createFileRoute('/_authenticated/catalog/prices')({
  component: CatalogPricesPage,
})

function CatalogPricesPage() {
  const { t } = useTranslation()

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
            {t('title', { ns: 'prices' })}
          </Typography>
        </Box>
      </Grid>
      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
      }}>
        {/* Content will be added later */}
      </StyledPaper>
    </Grid>
  )
}

