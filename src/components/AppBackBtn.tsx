import { KeyboardBackspaceOutlined } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import i18next from '../i18next'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

type Props = {
  children?: React.ReactNode
}

function AppBackBtn({ children }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const transform = i18next.dir() === 'rtl' ? 'rotate(180deg)' : ''

  return (
    <Button
      variant='text'
      size='small'
      onClick={() => {
        navigate({ to: '..' });
      }}
      startIcon={
        <KeyboardBackspaceOutlined
          sx={{
            transform: transform,
          }}
        />
      }
      sx={{
        padding: '16px',
        height: '20px',
        margin: '-12px',
      }}
    >
      <Typography color='common.black' sx={{ textTransform: 'none', fontSize: '14px' }}>
        {/* // TODO: add hebrew translation */}
        {children ? children : t('history-back-button.label', { ns: 'common' })}
      </Typography>
    </Button>
  )
}

export default AppBackBtn

