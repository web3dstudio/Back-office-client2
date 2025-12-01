import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import SupportArticleForm from '../../../components/TechSupport/SupportArticleForm'
import { useNavigate } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'

export const Route = createFileRoute('/_authenticated/tech-support/new')({
  component: NewSupportArticlePage,
})

function NewSupportArticlePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const saveArticle = (data: any) => {
    // TODO: Implement create article mutation
    console.log('Save article:', data)
    navigate({ to: '/tech-support' })
  }

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
            {t('addNewArticle', { ns: 'techSupport' })}
          </Typography>
        </Box>
      </Grid>

      <Grid size={12}>
        <StyledPaper
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            padding: 3,
            width: '100%',
          }}
        >
          <SupportArticleForm
            isPending={false}
            article={null}
            onArticleSave={saveArticle}
          />
        </StyledPaper>
      </Grid>
    </Grid>
  )
}
