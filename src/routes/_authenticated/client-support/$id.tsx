import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import { useSupportArticleQuery } from '../../../query/supportArticles.query'
import AppLoading from '../../../components/AppLoading'

export const Route = createFileRoute('/_authenticated/client-support/$id')({
  component: ViewClientSupportArticlePage,
})

function ViewClientSupportArticlePage() {
  const { t } = useTranslation('clientSupport')
  const { id } = Route.useParams()

  const { data: article, isLoading } = useSupportArticleQuery(id)

  if (isLoading) return <AppLoading />

  if (!article) {
    return (
      <Grid container spacing={3}>
        <Grid size={12}>
          <AppBackBtn children={t('back', { ns: 'common' })} />
        </Grid>
        <Grid size={12}>
          <Typography variant="h6">{t('articleNotFound', { ns: 'common' }) || 'Article not found'}</Typography>
        </Grid>
      </Grid>
    )
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
            {article.title}
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
          <Typography
            variant="body1"
            sx={{
              color: 'text.primary',
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </StyledPaper>
      </Grid>
    </Grid>
  )
}

