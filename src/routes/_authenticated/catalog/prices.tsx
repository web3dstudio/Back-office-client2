import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useState, useMemo, useEffect } from 'react'
import { Grid, Box, Typography, Tabs, Tab } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppLoading from '../../../components/AppLoading'
import { AppAutocomplete } from '../../../components/AppAutocomplete'
import AddPriceChanges from '../../../components/PriceChanges/AddPriceChanges'
import { usePriceChangesQuery } from '../../../query/priceChanges.query'
import { useCountriesQuery } from '../../../query/countries.query'
import { FIX_CHANGE, ONE_TIME_CHANGE } from '../../../components/PriceChanges/constants'
import type { TCountry } from '../../../types'

export const Route = createFileRoute('/_authenticated/catalog/prices')({
  component: CatalogPricesPage,
})

function CatalogPricesPage() {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedCountry, setSelectedCountry] = useState<TCountry | null>(null)

  // Получаем страны
  const { data: countries } = useCountriesQuery()

  // Устанавливаем первую страну по умолчанию
  useEffect(() => {
    if (countries && countries.length > 0 && !selectedCountry) {
      setSelectedCountry(countries[0])
    }
  }, [countries, selectedCountry])

  // Получаем изменения цен для выбранной страны
  const { data: allChanges, isLoading } = usePriceChangesQuery(selectedCountry?.id || null)

  // Фильтруем изменения для fixes таба
  const fixesChanges = useMemo(() => {
    if (Array.isArray(allChanges)) {
      return allChanges.filter(change => change.type === FIX_CHANGE)
    }
    return []
  }, [allChanges])

  // Фильтруем изменения для oneTime таба
  const oneTimeChanges = useMemo(() => {
    if (Array.isArray(allChanges)) {
      return allChanges.filter(change => change.type === ONE_TIME_CHANGE)
    }
    return []
  }, [allChanges])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  if (isLoading) {
    return <AppLoading />
  }

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid
        size={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('title', { ns: 'prices' })}
          </Typography>
        </Box>
        <Box sx={{ width: '200px' }}>
          <AppAutocomplete<TCountry>
            value={selectedCountry}
            onChange={setSelectedCountry}
            options={countries || []}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            label={t('countries', { ns: 'carCatalog' })}
          />
        </Box>
      </Grid>
      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="price changes tabs"
            sx={{ textTransform: 'none' }}
          >
            <Tab
              label={t('fixes', { ns: 'prices' })}
              value={0}
              sx={{ textTransform: 'none' }}
            />
            <Tab
              label={t('oneTime', { ns: 'prices' })}
              value={1}
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>
        {selectedTab === 0 && (
          <Box>
            <AddPriceChanges
              type={FIX_CHANGE}
              countryId={selectedCountry?.id || null}
              existingChanges={fixesChanges}
              allExistingChanges={allChanges || []}
            />
          </Box>
        )}
        {selectedTab === 1 && (
          <Box>
            <AddPriceChanges
              type={ONE_TIME_CHANGE}
              countryId={selectedCountry?.id || null}
              existingChanges={oneTimeChanges}
              allExistingChanges={allChanges || []}
            />
          </Box>
        )}
      </StyledPaper>
    </Grid>
  )
}

