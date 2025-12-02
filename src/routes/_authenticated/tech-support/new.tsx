import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import SupportArticleForm from '../../../components/TechSupport/SupportArticleForm'
import StyledPaper from '../../../components/StyledPaper'
import { useSupportArticleCreateMutation } from '../../../query/supportArticles.query'

export const Route = createFileRoute('/_authenticated/tech-support/new')({
  component: NewSupportArticlePage,
})

function NewSupportArticlePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createArticle, isPending } = useSupportArticleCreateMutation()

  const saveArticle = (data: any) => {
    createArticle(data, {
      onSuccess: () => {
        navigate({ to: '/tech-support' })
      },
    })
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn to="/tech-support" from="/tech-support/new" children={t('back', { ns: 'common' })} />
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
            isPending={isPending}
            article={null}
            onArticleSave={saveArticle}
          />
        </StyledPaper>
      </Grid>
    </Grid>
  )
}
