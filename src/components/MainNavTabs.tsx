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

function MainNavTabs() {

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
      <MainNavTabItem
        click={() => setValue(0)}
        to='/'
        icon={<MainPageIcon />}
        label={t('slidebar.mainPage', { ns: 'common' })}
      />

      <MainNavTabItem
        click={() => setValue(1)}
        to='/opinions'
        icon={<OptionsPageIcon />}
        label={t('slidebar.options', { ns: 'common' })}
      />

      <MainNavTabItemSubmenu
        click={() => setValue(2)}
        icon={<PriceListPageIcon />}
        label={t('slidebar.priceList', { ns: 'common' })}
      />

      <MainNavTabItem
        click={() => setValue(3)}
        to='/customers'
        icon={<CustomersPageIcon />}
        label={t('slidebar.customers', { ns: 'common' })}
      />

      <MainNavTabItem
        click={() => setValue(4)}
        to='/codes'
        icon={<CodesPageIcon />}
        label={t('slidebar.codesSystem', { ns: 'common' })}
      />

      <MainNavTabItem
        click={() => setValue(5)}
        to='/advertisements'
        icon={<AdvertisementsPageIcon />}
        label={t('slidebar.advertisement', { ns: 'common' })}
      />

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
