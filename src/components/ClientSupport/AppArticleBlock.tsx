import { Box, Button, Typography, useTheme } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../StyledPaper'
import type { TClientSupportArticle } from '../../types'

interface AppArticleBlockProps {
  article: TClientSupportArticle
}

function AppArticleBlock({ article }: AppArticleBlockProps) {
  const theme = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation('clientSupport')

  const handleReadClick = () => {
    navigate({ to: `/client-support/${article.id}` })
  }

  return (
    <StyledPaper>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          mb: 2,
          color: theme.palette.primary.main,
        }}
      >
        {article.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: theme.palette.text.secondary,
        }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={handleReadClick}
          sx={{
            textTransform: 'none',
            px: 3,
          }}
        >
          {t('read')}
        </Button>
      </Box>
    </StyledPaper>
  )
}

export default AppArticleBlock

