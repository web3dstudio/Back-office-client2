import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import CodeForm from '../../../components/Codes/CodeForm'

export const Route = createFileRoute('/_authenticated/codes/new')({
  component: NewCodePage,
})

function NewCodePage() {
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('addTitle', { ns: 'newCode' })}
          </Typography>
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
        <CodeForm />
      </StyledPaper>
    </Grid>
  )
}

