import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material'
import { Clear as ClearIcon } from '@mui/icons-material'
import AppLoading from '../../../components/AppLoading'
import AppError from '../../../components/AppError'
import AppArticleCategory from '../../../components/ClientSupport/AppArticleCategory'
import AppArticleBlock from '../../../components/ClientSupport/AppArticleBlock'
import StyledPaper from '../../../components/StyledPaper'
import {
  useClientSupportCategoriesQuery,
  useClientSupportSearchQuery,
} from '../../../query/supportArticles.query'

export const Route = createFileRoute('/_authenticated/client-support/')({
  component: ClientSupportPage,
})

function ClientSupportPage() {
  const { t } = useTranslation('clientSupport')
  const [searchString, setSearchString] = useState('')
  const [searched, setSearched] = useState(false)
  const [searchedString, setSearchedString] = useState('')

  const {
    data: categoriesData,
    isLoading: categoriesIsLoading,
    isError: categoriesIsError,
  } = useClientSupportCategoriesQuery()

  const {
    data: searchData,
    isLoading: searchIsLoading,
    isError: searchIsError,
  } = useClientSupportSearchQuery(searchedString)

  const handleSearch = () => {
    if (searchString) {
      setSearchedString(searchString)
      setSearched(true)
    }
  }

  const handleClearSearch = () => {
    setSearchString('')
    setSearched(false)
    setSearchedString('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize', mb: 3 }}>
            {t('title')}
          </Typography>
        </Box>
      </Grid>

      <Grid size={12}>
        <StyledPaper
          sx={{
            borderRadius: '24px',
            padding: 3,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 3,
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={searchString}
              onChange={(e) => {
                if (e.target.value === '') {
                  setSearched(false)
                }
                setSearchString(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              variant="outlined"
              placeholder={t('placeholder')}
              slotProps={{
                input: {
                  endAdornment: searchString ? (
                    <InputAdornment
                      onClick={handleClearSearch}
                      sx={{ pr: 1, '&:hover': { cursor: 'pointer' } }}
                      position="end"
                    >
                      <ClearIcon />
                    </InputAdornment>
                  ) : undefined,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '&.Mui-focused fieldset': {
                    boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                    borderRadius: '20px',
                  },
                },
              }}
            />
            <Button
              disabled={!searchString}
              loading={searchIsLoading}
              sx={{ px: 3 }}
              variant="contained"
              color="primary"
              onClick={handleSearch}
            >
              {t('search')}
            </Button>
          </Box>
        </StyledPaper>
      </Grid>

      {searched && searchedString && (
        <Grid size={12}>
          <Box textAlign="center" sx={{ width: '100%' }}>
            <Typography variant="h6">
              {t('searchResults')} "{searchedString}"
            </Typography>
          </Box>
        </Grid>
      )}

      {!searched && categoriesIsLoading && <AppLoading />}
      {!searched && categoriesIsError && <AppError />}

      {searched && searchIsLoading && !searchIsError && <AppLoading />}
      {searched && searchIsError && <AppError />}

      {!searched &&
        !categoriesIsError &&
        !categoriesIsLoading &&
        categoriesData?.categories.map((category) => (
          <Grid key={category.categoryId} size={{ xs: 12, sm: 6 }}>
            <AppArticleCategory category={category} />
          </Grid>
        ))}

      {searched && !searchIsLoading && !searchIsError && (
        <Grid size={12}>
          {searchData && searchData.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {searchData.map((article) => (
                <AppArticleBlock key={article.id} article={article} />
              ))}
            </Box>
          ) : (
            <Box textAlign="center" sx={{ width: '100%', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('nothingFound', { ns: 'common' }) || 'Nothing found'}
              </Typography>
            </Box>
          )}
        </Grid>
      )}
    </Grid>
  )
}
