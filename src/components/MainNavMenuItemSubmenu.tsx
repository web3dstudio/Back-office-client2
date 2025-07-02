import { Menu, MenuItem } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function MainNavMenuItemSubmenu({ label, click }: { label: string, click: () => void }) {
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
      <MenuItem
        aria-controls={open ? 'main-submenu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {label}
      </MenuItem>

      <Menu
        id='main-subsubmenu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'main-subsubmenu',
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: i18n.dir() === 'ltr' ? 'right' : 'left',
        }}
      >
        <MenuItem
          onClick={() => {
            navigate({ to: '/integral-extras' })
            handleClose()
          }}
        >
          {t('slidebar.integralExtras', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/car-types' })
            handleClose()
          }}
        >
          {t('slidebar.vehicleTypes', { ns: 'common' })}
        </MenuItem>


        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/car-types' })
            handleClose()
          }}
        >
          {t('slidebar.vehicleTypes', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/categories' })
            handleClose()
          }}
        >
          {t('slidebar.categories', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/car-properties' })
            handleClose()
          }}
        >
          {t('slidebar.features', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/accessories' })
            handleClose()
          }}
        >
          {t('slidebar.additions', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/car-marks' })
            handleClose()
          }}
        >
          {t('slidebar.markings', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/car-upgrades' })
            handleClose()
          }}
        >
          {t('slidebar.upgrades', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/values' })
            handleClose()
          }}
        >
          {t('slidebar.values', { ns: 'common' })}
        </MenuItem> */}

        {/* <MenuItem
          onClick={() => {
            navigate({ to: '/repository' })
            handleClose()
          }}
        >
          {t('slidebar.repo', { ns: 'common' })}
        </MenuItem> */}
      </Menu>
    </>
  )
}
