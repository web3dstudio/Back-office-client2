import { Add } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

type TMainPageCardProps = {
  name?: string
  icon: JSX.Element
  count: number | undefined
  onButtonClick: () => void
  onCardClick: () => void
}

function MainPageCard({
  name,
  icon,
  count,
  onButtonClick,
  onCardClick,
}: TMainPageCardProps) {
  const theme = useTheme()
  const { t } = useTranslation('common')

  return (
    <>
      <Card
        sx={{
          borderRadius: '42px',
          overflow: 'hidden',
          boxShadow:
            '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06);',
        }}
      >
        <CardActionArea onClick={onCardClick}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Box
              sx={{
                pt: 3,
                pb: 1,
                px: 2,
                display: 'flex',
                justifyContent: 'center',
                bgcolor: theme.palette.background.paper,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </Box>
                <Typography
                  gutterBottom
                  sx={{ fontSize: 24, fontWeight: 'semibold', textTransform: 'capitalize' }}
                >
                  {t(`homePageData.${name}`)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                backgroundColor: theme.palette.grey[800] + 'AA',
                p: 3,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Typography variant='h3' sx={{ color: theme.palette.grey[300] }}>
                {count ? count : 0}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      <Button
        onClick={onButtonClick}
        startIcon={<Add />}
        fullWidth
        variant='contained'
        sx={{ mt: 2 }}
      >
        {t('homePageData.add')}
      </Button>
    </>
  )
}

export default MainPageCard
