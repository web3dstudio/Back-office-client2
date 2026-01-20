import { createFileRoute } from '@tanstack/react-router'
import { Box, Button, Grid, TableRow, TableCell, useTheme, alpha } from '@mui/material'
import { ArrowDownward, ArrowUpward, Remove } from '@mui/icons-material'
import { useReportsPriceDifferencesQuery } from '../../../../query/statistics/reportsPriceDifferences.query'
import { useState, useMemo, useEffect } from 'react'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import StyledPaper from '../../../../components/StyledPaper'
import { AppAutocomplete } from '../../../../components/AppAutocomplete'
import AppTextField from '../../../../components/AppTextField'
import { useTranslation } from 'react-i18next'
import AppDataTable from '../../../../components/AppDataTable'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import type { TReportPriceDifferenceCar, TCountry } from '../../../../types'
import useCurrencyFormat from '../../../../hooks/useCurrencyFormat'
import { useCountriesQuery } from '../../../../query/countries.query'

export const Route = createFileRoute('/_authenticated/reports/price-differences/')({
  component: PriceDifferencesPage,
})

function PriceDifferencesPage() {
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  const { formatCurrency } = useCurrencyFormat()
  const { data: countries } = useCountriesQuery()
  const currentYear = new Date().getFullYear()
  const years = useMemo(() => {
    const result: number[] = []
    for (let y = currentYear; y >= 2005; y--) result.push(y)
    return result
  }, [currentYear])

  const defaultCountry = useMemo(() => countries?.[0] || null, [countries])

  const [filtersDraft, setFiltersDraft] = useState<{ countryId: string | null; manufacturerYear: number | null; modelCode: string }>({
    countryId: null,
    manufacturerYear: null,
    modelCode: '',
  })
  const [filters, setFilters] = useState<{ countryId: string; manufacturerYear: number; modelCode: string } | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    if (defaultCountry && filtersDraft.countryId === null) {
      setFiltersDraft(prev => ({ ...prev, countryId: defaultCountry.id }))
    }
  }, [defaultCountry])

  const handleSearch = () => {
    if (filtersDraft.countryId && filtersDraft.manufacturerYear !== null && filtersDraft.modelCode.trim() !== '') {
      setFilters({
        countryId: filtersDraft.countryId,
        manufacturerYear: filtersDraft.manufacturerYear,
        modelCode: filtersDraft.modelCode.trim(),
      })
    }
  }

  const isSearchDisabled = !filtersDraft.countryId || filtersDraft.manufacturerYear === null || filtersDraft.modelCode.trim() === ''

  const { data: priceDifferencesData, isLoading, error } = useReportsPriceDifferencesQuery(
    filters || { countryId: '', manufacturerYear: 0, modelCode: '' }
  )

  // Преобразуем данные в плоский массив для таблицы
  const tableData = useMemo(() => {
    if (!priceDifferencesData) return []
    const result: (TReportPriceDifferenceCar & { manufacturerName: string; modelName: string; modelCode: string; id: string })[] = []
    priceDifferencesData.cars.forEach(car => {
      result.push({
        ...car,
        id: car.carId,
        manufacturerName: priceDifferencesData.manufacturerName,
        modelName: priceDifferencesData.modelName,
        modelCode: priceDifferencesData.modelCode,
      })
    })
    return result
  }, [priceDifferencesData])

  // Все строки всегда раскрыты
  const expandedRows = useMemo(() => {
    const set = new Set<string>()
    tableData.forEach(car => set.add(car.carId))
    return set
  }, [tableData])

  const columns = useMemo<ColumnDef<TReportPriceDifferenceCar & { manufacturerName: string; modelName: string; modelCode: string }>[]>(
    () => [
      {
        accessorKey: 'manufacturerName',
        header: t('ManufacturerName', { ns: 'priceDifferences' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
        cell: ({ row }) => (
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {row.original.manufacturerName}
          </Box>
        ),
      },
      {
        accessorKey: 'modelName',
        header: t('ModelName', { ns: 'priceDifferences' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
        cell: ({ row }) => (
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {row.original.modelName}
          </Box>
        ),
      },
      {
        accessorKey: 'manufacturerYear',
        header: t('ManufacturerYear', { ns: 'priceDifferences' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => (
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {row.original.manufacturerYear}
          </Box>
        ),
      },
      {
        accessorKey: 'basePrice',
        header: t('BasePrice', { ns: 'priceDifferences' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          const price = row.original.basePrice
          if (price === null || price === undefined) return '–'
          const formatted = formatCurrency(price)
          return (
            <Box component="span" sx={{ fontWeight: 'bold' }}>
              {formatted || String(price)}
            </Box>
          )
        },
      },
      {
        accessorKey: 'basePriceYear',
        header: t('Year', { ns: 'priceDifferences' }),
        enableSorting: true,
        enableHiding: true,
        size: 100,
        minSize: 80,
        maxSize: 120,
        cell: ({ row }) => (
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            {row.original.basePriceYear}
          </Box>
        ),
      },
      {
        id: 'month',
        header: t('Month', { ns: 'priceDifferences' }),
        enableSorting: false,
        enableHiding: true,
        size: 100,
        minSize: 80,
        maxSize: 120,
        cell: () => '',
      },
      {
        id: 'difference',
        header: t('Difference', { ns: 'priceDifferences' }),
        enableSorting: false,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: () => '',
      },
      {
        id: 'price',
        header: t('Price', { ns: 'priceDifferences' }),
        enableSorting: false,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: () => '',
      },
    ],
    [t, formatCurrency, i18n.language]
  )

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <AppAutocomplete<TCountry>
              value={countries?.find(c => c.id === filtersDraft.countryId) || null}
              onChange={(v) => setFiltersDraft(prev => ({ ...prev, countryId: v?.id || null }))}
              options={countries || []}
              getOptionLabel={(opt) => i18n.language === 'he' ? opt.name : (opt.nameEn || opt.name)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              label="priceDifferences:country"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AppAutocomplete<number>
              value={filtersDraft.manufacturerYear}
              onChange={(v) => setFiltersDraft(prev => ({ ...prev, manufacturerYear: v }))}
              options={years}
              getOptionLabel={(opt) => String(opt)}
              label="priceDifferences:ManufacturerYear"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <AppTextField
              name="modelCode"
              label="priceDifferences:modelCode"
              value={filtersDraft.modelCode}
              onChange={(value) => setFiltersDraft(prev => ({ ...prev, modelCode: value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearchDisabled}
              fullWidth
            >
              {t('search', { ns: 'priceDifferences' })}
            </Button>
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : error ? (
          <AppError error={error} />
        ) : (
          <AppDataTable
            tableName="priceDifferences"
            data={tableData}
            columns={columns}
            isLoading={isLoading}
            manualPagination={false}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={pagination}
            onPaginationChange={setPagination}
            totalPages={Math.ceil((tableData.length || 0) / pagination.pageSize) || 1}
            expandedRows={expandedRows}
            hidePagination={true}
            getRowSx={() => ({
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            })}
            renderSubComponent={({ row, table }) => {
              const car = row as TReportPriceDifferenceCar & { manufacturerName: string; modelName: string; modelCode: string }
              return (
                <>
                  {car.prices.map((price, index) => (
                    <TableRow key={`${price.id}-${index}`} sx={{ backgroundColor: 'transparent' }}>
                      {table.getVisibleLeafColumns().map((column: any) => {
                        if (column.accessorKey === 'manufacturerName' || column.accessorKey === 'modelName' || column.accessorKey === 'modelCode' || column.accessorKey === 'manufacturerYear') {
                          return <TableCell key={column.id} size="small"></TableCell>
                        } else if (column.id === 'month') {
                          return (
                            <TableCell key={column.id} size="small">
                              {price.month}
                            </TableCell>
                          )
                        } else if (column.accessorKey === 'basePriceYear' || column.id === 'basePriceYear') {
                          return (
                            <TableCell key={column.id} size="small">
                              {price.year}
                            </TableCell>
                          )
                        } else if (column.accessorKey === 'basePrice') {
                          return <TableCell key={column.id} size="small"></TableCell>
                        } else if (column.id === 'price') {
                          const priceValue = price.price
                          const formatted = priceValue !== null && priceValue !== undefined ? formatCurrency(priceValue) : null

                          // Сравниваем с предыдущей ценой
                          let priceChangeIcon = null
                          if (index > 0 && priceValue !== null && priceValue !== undefined) {
                            const previousPrice = car.prices[index - 1]?.price
                            if (previousPrice !== null && previousPrice !== undefined) {
                              if (priceValue > previousPrice) {
                                // Цена увеличилась - зеленая стрелка вверх
                                priceChangeIcon = <ArrowUpward sx={{ fontSize: 16, color: 'success.main', ml: 0.5 }} />
                              } else if (priceValue < previousPrice) {
                                // Цена уменьшилась - красная стрелка вниз
                                priceChangeIcon = <ArrowDownward sx={{ fontSize: 16, color: 'error.main', ml: 0.5 }} />
                              } else {
                                // Цена не изменилась - серая горизонтальная линия
                                priceChangeIcon = <Remove sx={{ fontSize: 16, color: 'grey.500', ml: 0.5 }} />
                              }
                            }
                          }

                          return (
                            <TableCell key={column.id} size="small">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {formatted || (priceValue !== null && priceValue !== undefined ? String(priceValue) : '–')}
                                {priceChangeIcon}
                              </Box>
                            </TableCell>
                          )
                        } else if (column.id === 'difference') {
                          return (
                            <TableCell key={column.id} size="small">
                              {new Intl.NumberFormat(i18n.language, {
                                maximumFractionDigits: 1,
                                minimumFractionDigits: 1,
                              }).format(price.difference) + '%'}
                            </TableCell>
                          )
                        } else {
                          return <TableCell key={column.id} size="small"></TableCell>
                        }
                      })}
                    </TableRow>
                  ))}
                </>
              )
            }}
          />
        )}
      </StyledPaper>
    </Box>
  )
}
