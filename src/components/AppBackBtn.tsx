import { KeyboardBackspaceOutlined } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import i18next from '../i18next'
import { useRouter } from '@tanstack/react-router'
import { t } from 'i18next'

type Props = {
  children?: React.ReactNode
}

function AppBackBtn({ children }: Props) {
  const router = useRouter()
  const transform = i18next.dir() === 'rtl' ? 'rotate(180deg)' : ''

  return (
    <Button
      variant='text'
      size='small'
      onClick={() => {
        router.history.back()
      }}
      startIcon={
        <KeyboardBackspaceOutlined
          sx={{
            transform: transform,
          }}
        />
      }
    >
      <Typography color='common.black' sx={{ textTransform: 'none' }}>
        {children ? children : t('back', { ns: 'common' })}
      </Typography>
    </Button>
  )
}

export default AppBackBtn
