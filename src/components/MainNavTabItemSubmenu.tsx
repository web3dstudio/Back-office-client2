import { Menu, MenuItem, Tab } from '@mui/material'
import type { JSX } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import MainNavMenuItemSubmenu from './MainNavMenuItemSubmenu'

interface IMainNavTabItemSubmenuProps {
  icon: JSX.Element
  label: string
  click: () => void
}

export default function MainNavTabItemSubmenu({
  icon,
  label,
  click
}: IMainNavTabItemSubmenuProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    click()
  }

  return (
    <>
      <Tab
        sx={{ textTransform: 'none' }}
        icon={icon}
        label={label}
        aria-controls={open ? 'main-submenu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      />

      <Menu
        id='main-submenu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'main-submenu',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: i18n.dir() === 'ltr' ? 'right' : 'left',
        }}
      >
        <MenuItem
          onClick={() => {
            navigate({ to: '/price-list' })
            handleClose()
          }}
        >
          {t('slidebar.priceList', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/catalog' })
            handleClose()
          }}
        >
          {t('slidebar.vehicles', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/manufacturers' })
            handleClose()
          }}
        >
          {t('slidebar.manufacturers', { ns: 'common' })}
        </MenuItem>

        <MainNavMenuItemSubmenu
          label={t('slidebar.carDetails', { ns: 'common' })}
          click={() => handleClose()}
        />
      </Menu>
    </>
  )
}
