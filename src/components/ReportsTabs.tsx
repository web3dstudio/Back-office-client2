import { Box, Tabs, Tab } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'

const tabRoutes = [
  { key: 'statistics', path: '/reports/statistics', translationKey: 'statistics' },
  { key: 'user-queries', path: '/reports/search-queries', translationKey: 'user-queries' },
  { key: 'top-queries', path: '/reports/leading-queries', translationKey: 'top-queries' },
  { key: 'new-models', path: '/reports/new-models', translationKey: 'new-models' },
  { key: 'deducted-models', path: '/reports/deducted-models', translationKey: 'deducted-models' },
  { key: 'catalog-items', path: '/reports/catalog-items', translationKey: 'catalog-items' },
  { key: 'differences', path: '/reports/price-differences', translationKey: 'differences' },
  { key: 'figure', path: '/reports/low-year-exceeds-high', translationKey: 'figure' },
  { key: 'subscription', path: '/reports/subscription', translationKey: 'subscription' },
  { key: 'carByYears', path: '/reports/car-by-years', translationKey: 'carByYears' },
]

export default function ReportsTabs() {
  const { t } = useTranslation('reports')
  const navigate = useNavigate()
  const location = useLocation()
  const [currentTab, setCurrentTab] = useState<string>('statistics')

  useEffect(() => {
    // Find current tab based on pathname
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
        aria-label="reports tabs"
        variant="fullWidth"
        scrollButtons="auto"
        sx={{ textTransform: 'none' }}
      >
        {tabRoutes.map((route) => (
          <Tab
            key={route.key}
            label={t(route.translationKey)}
            value={route.key}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>
    </Box>
  )
}

