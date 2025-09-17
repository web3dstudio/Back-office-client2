import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AppLoading from '../../../components/AppLoading'
import { useTranslation } from 'react-i18next'
import { useCarQuery } from '../../../query/car.query'
import { Grid, Box, Typography, Button, styled, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import { useCountriesQuery } from '../../../query/countries.query'
import type { TCountry } from '../../../types'
import { AppAutocomplete } from '../../../components/AppAutocomplete'
import useCurrencyFormat from '../../../hooks/useCurrencyFormat'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_authenticated/catalog/$id')({
  component: ViewCarPage,
})

const NO_DATA = '–'

function ViewCarPage() {
  const { id } = Route.useParams()
  const { t, i18n } = useTranslation()
  const { formatCurrency } = useCurrencyFormat()
  const { data: car, isLoading } = useCarQuery(id)
  const navigate = useNavigate()
  const { data: countries, isLoading: isCountriesLoading } = useCountriesQuery()



  const StyledBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    boxShadow: theme.shadows[3],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    textWrap: 'nowrap',
  }))

  const InfoBox = ({ title, text }: { title: string, text: string }) => (
    <StyledBox>
      <Typography component={'p'} variant="body1" color={'primary'}>
        {title}
      </Typography>
      {text && (
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {text}
        </Typography>
      )}
    </StyledBox>
  )

  const prices = useMemo(() => {
    if (!car?.carPrices) return []
    return car.carPrices.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year
      }
      return b.month - a.month
    })
  }, [car?.carPrices])


  // Массив месяцев от 1 до 12
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1)
  }, [])

  // Массив уникальных годов из цен
  const years = useMemo(() => {
    if (!prices) return []
    const uniqueYears = [...new Set(prices.map(price => price.year))]
    return uniqueYears.sort((a, b) => b - a) // По убыванию
  }, [prices])

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const filteredPrices = useMemo(() => {
    if (!prices) return []

    return prices.filter(price => {
      // Если выбран месяц - фильтруем по месяцу
      if (selectedMonth && price.month !== selectedMonth) {
        return false
      }
      // Если выбран год - фильтруем по году
      if (selectedYear && price.year !== selectedYear) {
        return false
      }
      return true
    })
  }, [prices, selectedMonth, selectedYear])

  if (isLoading) return <AppLoading />

  return (
    <>
      <Grid container columns={12} spacing={3} >
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
              {`${car?.model?.series?.manufacturer?.name} ${car?.model?.series?.name} ${car?.model?.name}`}
            </Typography>
          </Box>
          <Box>
          </Box>
        </Grid>
        <Grid container columns={12} columnSpacing={3} sx={{ width: '100%' }}>
          <Grid size={10}>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => {
              if (id) {
                navigate({ to: '/catalog/edit/$id', params: { id: id } })
              } else {
                navigate({ to: '/catalog/new-car' })
              }
            }}>
              {t('edit', { ns: 'newCar' })}
            </Button>
          </Grid>
          <Grid size={2}>
            <AppAutocomplete<TCountry>
              value={car?.country || null}
              onChange={(value) => {
                console.log(value)
              }}
              options={countries || []}
              label={t('country', { ns: 'newCar' })}
              placeholder={t('country', { ns: 'newCar' })}
              required
              loading={isCountriesLoading}
              getOptionLabel={(option) => i18n.language === 'he' ? option.name || '' : option.nameEn || option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid container columns={12} spacing={6} >
        <Grid size={5}>
          <Grid container columns={12} spacing={3}>
            <Grid size={6}>
              <InfoBox
                title={t('carType', { ns: 'newCar' })}
                text={car?.carType?.name || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('manufacturer', { ns: 'newCar' })}
                text={car?.model?.series?.manufacturer?.name || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('series', { ns: 'newCar' })}
                text={car?.model?.series?.name || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('modelName', { ns: 'newCar' })}
                text={car?.model?.name || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('modelCode', { ns: 'newCar' })}
                text={car?.model?.code || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('manufacturerYear', { ns: 'newCar' })}
                text={car?.manufacturerYear?.toString() || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('volume', { ns: 'newCar' })}
                text={car?.model?.volume?.toString() || NO_DATA}
              />
            </Grid>
            <Grid size={6}>
              <InfoBox
                title={t('gearbox', { ns: 'newCar' })}
                text={car?.model?.gearbox?.name || NO_DATA}
              />
            </Grid>
            <Grid size={12}>
              <InfoBox
                title={t('newCarPrice', { ns: 'newCar' })}
                text={formatCurrency(car?.newCarPrice as number) || NO_DATA}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={7}>
          <Grid container columns={12} columnSpacing={3} rowSpacing={0}>
            <Grid size={12}>
              <Typography component={'p'} variant="body1" color={'primary'}>
                {t('details', { ns: 'newCar' })}
              </Typography>
              <Typography variant="body1" >
                {car?.details || NO_DATA}
              </Typography>
            </Grid>
            <Grid size={12} sx={{ mt: 3, mb: 2 }}>
              <Typography component={'p'} variant="body1" color={'primary'}>
                {t('prices', { ns: 'viewCar' })}
              </Typography>
            </Grid>
            <Grid size={3}>
              <AppAutocomplete<number>
                value={selectedMonth}
                onChange={(value) => {
                  setSelectedMonth(value)
                }}
                options={months}
                getOptionLabel={(option) => option.toString()}
                isOptionEqualToValue={(option, value) => option === value}
                placeholder={t('month', { ns: 'viewCar' })}
                label={t('month', { ns: 'viewCar' })}
              />
            </Grid>
            <Grid size={3}>
              <AppAutocomplete<number>
                value={selectedYear}
                onChange={(value) => {
                  setSelectedYear(value)
                }}
                options={years}
                getOptionLabel={(option) => option.toString()}
                isOptionEqualToValue={(option, value) => option === value}
                placeholder={t('year', { ns: 'viewCar' })}
                label={t('year', { ns: 'viewCar' })}
              />
            </Grid>
            <Grid size={12}>
              <TableContainer component={Box} sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('month', { ns: 'viewCar' })}</TableCell>
                      <TableCell>{t('year', { ns: 'viewCar' })}</TableCell>
                      <TableCell>{t('price', { ns: 'viewCar' })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPrices?.map((price) => (
                      <TableRow key={price.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{price?.month || NO_DATA}</TableCell>
                        <TableCell>{price?.year || NO_DATA}</TableCell>
                        <TableCell>{formatCurrency(price.totalPrice as number) || NO_DATA}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}


