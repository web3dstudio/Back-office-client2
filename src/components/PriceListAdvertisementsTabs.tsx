import { Box, Tabs, Tab } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'

const tabRoutes: Array<
  | { key: string; path: string; translationKey: string; label?: never }
  | { key: string; path: string; label: string; translationKey?: never }
> = [
    { key: 'test', path: '/price-list/advertisements/test', label: 'test' },
    { key: 'layouts', path: '/price-list/advertisements/layouts', translationKey: 'layouts' },
  ]

export default function PriceListAdvertisementsTabs() {
  const { t } = useTranslation('priceListAdvertisements')
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTab, setCurrentTab] = useState<string>('layouts')

  useEffect(() => {
    const currentRoute = tabRoutes.find(route => location.pathname.includes(route.path))
    if (currentRoute) {
      setCurrentTab(currentRoute.key)
    }
  }, [location.pathname])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    const route = tabRoutes.find(r => r.key === newValue)
    if (route) {
      setCurrentTab(newValue)
      navigate({ to: route.path })
    }
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="price list advertisements tabs"
        variant="fullWidth"
        scrollButtons="auto"
        sx={{ textTransform: 'none' }}
      >
        {tabRoutes.map((route) => (
          <Tab
            key={route.key}
            label={'label' in route ? route.label : t(route.translationKey)}
            value={route.key}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>
    </Box>
  )
}


