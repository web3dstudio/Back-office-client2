import LightMode from '@mui/icons-material/LightMode'
import DarkMode from '@mui/icons-material/DarkMode'
import { IconButton, useTheme } from '@mui/material'
import { useContext } from 'react'
import { ColorModeContext } from '../utils/ColorModeContext'

function ChangeLightDarkMode() {
  const theme = useTheme()
  const muiUtils = useContext(ColorModeContext)

  return (
    <IconButton
      sx={{ fontSize: '1rem' }}
      onClick={muiUtils.toggleColorMode}
      color='inherit'
      disableTouchRipple
      disableRipple
    >
      {theme.palette.mode === 'dark' ? <DarkMode /> : <LightMode />}
    </IconButton>
  )
}

export default ChangeLightDarkMode
