/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import { Box, IconButton, Menu, MenuItem } from '@mui/material'
import { AccountCircleOutlined } from '@mui/icons-material'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLogoutMutation } from '../query/user.query'
import { useSetDefaultPageMutation } from '../query/users.query'

function ProfileMenu() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const router = useRouterState()
  const { mutate: logoutMutation } = useLogoutMutation()
  const { mutate: setDefaultPage } = useSetDefaultPageMutation()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const setAsMainPage = () => {
    handleClose()
    const currentPath = router.location.pathname
    setDefaultPage(currentPath)
  }

  // const syncNow = () => {
  //   console.log('syncNow POST TO users/syncOut')
  // }

  const logout = () => {
    logoutMutation()
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color='inherit'
        aria-controls={open ? 'change-lang-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <AccountCircleOutlined />
      </IconButton>

      <Menu
        id='user-profile-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'user-profile-menu',
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose()
            navigate({
              to: '/profile',
            })
          }}
        >
          {t('header.personalDetails', { ns: 'common' })}
        </MenuItem>

        <MenuItem onClick={setAsMainPage}>
          {t('header.setUsMainPage', { ns: 'common' })}
        </MenuItem>
        {/* <MenuItem onClick={syncNow}>
          {t('header.syncNow', { ns: 'common' })}
        </MenuItem> */}
        <MenuItem onClick={logout}>
          {t('header.logout', { ns: 'common' })}
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProfileMenu
