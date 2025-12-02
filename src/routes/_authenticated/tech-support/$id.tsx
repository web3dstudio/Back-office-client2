import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import SupportArticleForm from '../../../components/TechSupport/SupportArticleForm'
import StyledPaper from '../../../components/StyledPaper'
import { useSupportArticleQuery } from '../../../query/supportArticles.query'
import AppLoading from '../../../components/AppLoading'

export const Route = createFileRoute('/_authenticated/tech-support/$id')({
  component: EditSupportArticlePage,
})

function EditSupportArticlePage() {
  const { t } = useTranslation()
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const { data: article, isLoading } = useSupportArticleQuery(id)

  const saveArticle = (data: any) => {
    // TODO: Implement update article mutation
    console.log('Update article:', data)
    navigate({ to: '/tech-support' })
  }

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
            {t('edit', { ns: 'techSupport' })} {article?.title}
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
            article={article || null}
            onArticleSave={saveArticle}
          />
        </StyledPaper>
      </Grid>
    </Grid>
  )
}

