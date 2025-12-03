import { Box, Typography, useTheme } from '@mui/material'
import { Info } from '@mui/icons-material'
import { useNavigate } from '@tanstack/react-router'
import StyledPaper from '../StyledPaper'
import type { TClientSupportCategory } from '../../types'

interface AppArticleCategoryProps {
  category: TClientSupportCategory
}

function AppArticleCategory({ category }: AppArticleCategoryProps) {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleArticleClick = (articleId: string) => {
    navigate({ to: `/client-support/${articleId}` })
  }

  return (
    <StyledPaper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 3,
          color: theme.palette.primary.main,
        }}
      >
        {category.categoryName}
      </Typography>

      {category.articles?.map((article) => (
        <Box
          key={article.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.7,
            },
          }}
          onClick={() => handleArticleClick(article.id)}
        >
          <Info
            sx={{
              fontSize: 20,
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            sx={{
              cursor: 'pointer',
              color: theme.palette.text.primary,
            }}
          >
            {article.title}
          </Typography>
        </Box>
      ))}
    </StyledPaper>
  )
}

export default AppArticleCategory

