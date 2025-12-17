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
            navigate({ to: '/extras' })
            handleClose()
          }}
        >
          {t('slidebar.extras', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/car-types' })
            handleClose()
          }}
        >
          {t('slidebar.vehicleTypes', { ns: 'common' })}
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate({ to: '/countries' })
            handleClose()
          }}
        >
          {t('slidebar.countries', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/marks' })
            handleClose()
          }}
        >
          {t('marks', { ns: 'newCar' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/upgrade-packages' })
            handleClose()
          }}
        >
          {t('slidebar.upgradePackages', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/service-packages' })
            handleClose()
          }}
        >
          {t('slidebar.servicePackages', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/mileage-adjustments' })
            handleClose()
          }}
        >
          {t('slidebar.mileageAdjustments', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/owners' })
            handleClose()
          }}
        >
          {t('slidebar.owners', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/engine-types' })
            handleClose()
          }}
        >
          {t('slidebar.engineTypes', { ns: 'common' })}
        </MenuItem>


        <MenuItem
          onClick={() => {
            navigate({ to: '/drive-types' })
            handleClose()
          }}
        >
          {t('slidebar.driveTypes', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/gearboxes' })
            handleClose()
          }}
        >
          {t('slidebar.gearboxes', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/comments-for-opinion' })
            handleClose()
          }}
        >
          {t('slidebar.commentsForOpinion', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/appraisers' })
            handleClose()
          }}
        >
          {t('slidebar.appraisers', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/usage-types' })
            handleClose()
          }}
        >
          {t('slidebar.usageTypes', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/statuses' })
            handleClose()
          }}
        >
          {t('slidebar.statuses', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/importers' })
            handleClose()
          }}
        >
          {t('slidebar.importers', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/protectives' })
            handleClose()
          }}
        >
          {t('slidebar.protectives', { ns: 'common' })}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate({ to: '/repository' })
            handleClose()
          }}
        >
          {t('slidebar.repo', { ns: 'common' })}
        </MenuItem>
      </Menu>
    </>
  )
}
