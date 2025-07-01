/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useState } from 'react'
import { ColorModeContext } from '../utils/MUIWrapper'
import {
  Box,
  type Direction,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import { LanguageOutlined } from '@mui/icons-material'
import { changeLanguage } from 'i18next'
import USFlagIcon from '../assets/icons/flags/UsaFlagIcon'
import IsraelFlagIcon from '../assets/icons/flags/IsraelFlagIcon'

function AppChangeLanguage() {
  const muiUtils = useContext(ColorModeContext)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  function changeLang(lang: string) {
    setAnchorEl(null)
    changeLanguage(lang)

    if (lang === 'he') {
      muiUtils.changeDirection('rtl' as Direction)
    } else {
      muiUtils.changeDirection('ltr' as Direction)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color='primary'
        aria-controls={open ? 'change-lang-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <LanguageOutlined />
      </IconButton>

      <Menu
        id='change-lang-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'change-lang-button',
        }}
      >
        <MenuItem onClick={() => changeLang('en')}>
          <ListItemIcon>
            <USFlagIcon />
          </ListItemIcon>
          <ListItemText primary='English' />
        </MenuItem>
        <MenuItem onClick={() => changeLang('he')}>
          <ListItemIcon>
            <IsraelFlagIcon />
          </ListItemIcon>
          <ListItemText primary='עִברִית' />
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AppChangeLanguage
