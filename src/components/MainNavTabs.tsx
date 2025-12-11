import { Tabs } from '@mui/material'
import { useTranslation } from 'react-i18next'
import MainPageIcon from '../assets/icons/nav/MainPageIcon'
import { useState } from 'react'
import OptionsPageIcon from '../assets/icons/nav/OptionsPageIcon'
import PriceListPageIcon from '../assets/icons/nav/PriceListPageIcon'
import CustomersPageIcon from '../assets/icons/nav/CustomersPageIcon'
import CodesPageIcon from '../assets/icons/nav/CodesPageIcon'
import AdvertisementsPageIcon from '../assets/icons/nav/AdvertisementsPageIcon'
import ServiceCallsPageIcon from '../assets/icons/nav/ServiceCallsPageIcon'
import MainNavTabItem from './MainNavTabItem'
import MainNavTabItemSubmenu from './MainNavTabItemSubmenu'
import { checkUserPermission, CARS_ROLE, CUSTOMERS_ROLE, SETTINGS_ROLE, ADVERTISING_ROLE } from '../utils/roles'

interface MainNavTabsProps {
  userRole: number
}

function MainNavTabs({ userRole }: MainNavTabsProps) {

  const { t } = useTranslation()

  const [value, setValue] = useState(0)

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      sx={{ mt: 2 }}
      orientation='vertical'
      role='navigation'
      aria-label='main navigation'
    >
      {/* mainPage - всегда показывается */}
      <MainNavTabItem
        click={() => setValue(0)}
        to='/'
        icon={<MainPageIcon />}
        label={t('slidebar.mainPage', { ns: 'common' })}
      />

      {/* opinions - требует CARS_ROLE (8) */}
      {checkUserPermission(CARS_ROLE, userRole) && (
        <MainNavTabItem
          click={() => setValue(1)}
          to='/opinions'
          icon={<OptionsPageIcon />}
          label={t('slidebar.options', { ns: 'common' })}
        />
      )}

      {/* priceList - всегда показывается (открывает подменю) */}
      <MainNavTabItemSubmenu
        click={() => setValue(2)}
        icon={<PriceListPageIcon />}
        label={t('slidebar.priceList', { ns: 'common' })}
      />

      {/* customers - требует CUSTOMERS_ROLE (2) */}
      {checkUserPermission(CUSTOMERS_ROLE, userRole) && (
        <MainNavTabItem
          click={() => setValue(3)}
          to='/customers'
          icon={<CustomersPageIcon />}
          label={t('slidebar.customers', { ns: 'common' })}
        />
      )}

      {/* codesSystem - требует SETTINGS_ROLE (256) */}
      {checkUserPermission(SETTINGS_ROLE, userRole) && (
        <MainNavTabItem
          click={() => setValue(4)}
          to='/codes'
          icon={<CodesPageIcon />}
          label={t('slidebar.codesSystem', { ns: 'common' })}
        />
      )}

      {/* advertisement - требует ADVERTISING_ROLE (4) */}
      {checkUserPermission(ADVERTISING_ROLE, userRole) && (
        <MainNavTabItem
          click={() => setValue(5)}
          to='/advertisements'
          icon={<AdvertisementsPageIcon />}
          label={t('slidebar.advertisement', { ns: 'common' })}
        />
      )}

      {/* serviceCalls - всегда показывается */}
      <MainNavTabItem
        click={() => setValue(6)}
        to='/service-calls'
        icon={<ServiceCallsPageIcon />}
        label={t('slidebar.serviceCalls', { ns: 'common' })}
      />

    </Tabs>
  )
}

export default MainNavTabs
