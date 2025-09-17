import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCarsQuery, useCarYearsQuery } from '../../../query/car.query'
import { useTranslation } from 'react-i18next'
import { useState, useMemo, useEffect } from 'react'
import type { TCarsList, TCarYears } from '../../../types'
import { type ColumnDef, type SortingState, type PaginationState } from '@tanstack/react-table'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Button, TableCell, TableRow, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataTable from '../../../components/AppDataTable'
import AppLoading from '../../../components/AppLoading'


export const Route = createFileRoute('/_authenticated/catalog/')({
  component: CatalogPage,
})

function CatalogPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>()
  const [carYearsData, setCarYearsData] = useState<Record<string, TCarYears[]>>({})

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination)
  }

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting)
    setPagination(prev => ({ ...prev, pageIndex: 0 })) // сброс на первую страницу
  }

  const { data: cars, isLoading } = useCarsQuery(pagination.pageIndex, {}, sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' })))
  const { data: carYears } = useCarYearsQuery(selectedModelId || '')

  // Сохраняем данные в состояние при получении
  useEffect(() => {
    if (carYears && selectedModelId) {
      setCarYearsData(prev => ({
        ...prev,
        [selectedModelId]: carYears
      }))
    }
  }, [carYears, selectedModelId])

  const columns: ColumnDef<TCarsList>[] = useMemo(() => [
    {
      accessorKey: 'manufacturer',
      accessorFn: (row) => row.manufacturerName,
      header: t('manufacturer', { ns: 'carCatalog' }),
      enableSorting: true,
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: 'series',
      accessorFn: (row) => row.seriesName,
      header: t('series', { ns: 'carCatalog' }),
      enableSorting: true,
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: 'model',
      accessorFn: (row) => row.modelName,
      header: t('model', { ns: 'carCatalog' }),
      enableSorting: true,
    },
    {
      accessorKey: 'modelCode',
      header: t('modelCode', { ns: 'carCatalog' }),
      enableSorting: true,
    },

    {
      accessorKey: 'year',
      header: t('year', { ns: 'carCatalog' }),
      enableSorting: true,
      enableHiding: false,
      cell: ({ row }) => {
        const car = row.original
        return car.fromYear === car.toYear ? car.fromYear.toString() : `${car.fromYear} - ${car.toYear}`
      },
    },
    {
      accessorKey: 'volume',
      header: t('vol', { ns: 'carCatalog' }),
      enableSorting: true,
    },
    {
      accessorKey: 'gearbox',
      header: t('gearbox', { ns: 'carCatalog' }),
      enableSorting: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      minSize: 50,
      maxSize: 100,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const count = row.original.count || 0
        if (count > 1) {
          const isExpanded = expandedRows.has(row.original.id.toString())
          return (
            <AppActionButton
              type={isExpanded ? 'remove' : 'add'}
              onClick={() => {
                const id = row.original.id.toString()
                setSelectedModelId(row.original.modelId)

                if (expandedRows.has(id)) {
                  setExpandedRows(prev => new Set([...prev].filter(rowId => rowId !== id)))
                } else {
                  setExpandedRows(prev => new Set([...prev, id]))
                }
              }}
            />
          )
        } else {
          return (
            <Box display='flex' gap={1} >
              <AppActionButton
                type='view'
                onClick={() => {
                  navigate({ to: '/catalog/$id', params: { id: row.original.id } })
                }}
              />
              <AppActionButton
                type='edit'
                onClick={() => {
                  navigate({ to: '/catalog/edit/$id', params: { id: row.original.id } })
                }}
              />
              <AppActionButton
                type='duplicate'
                onClick={() => {
                  // Логика дублирования
                  console.log('Duplicate car:', row.original.id)
                }}
              />
            </Box>
          )
        }
      },
    },
  ], [t, expandedRows, setExpandedRows])


  return (<>
    <Grid container spacing={3} >
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
            {t('catalog', { ns: 'carCatalog' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            navigate({ to: '/catalog/new-car' })
          }

          }>
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>
      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
        display: 'flex',
        gap: 2,
      }}>
        {/* <OpinionsFilter
          filters={filtersDraft}
          setFilters={setFiltersDraft}
          onSearch={() => {
            setFilters(filtersDraft);
            setPaginationModel(model => ({ ...model, page: 0 })); // сбросить страницу при поиске
          }}
        /> */}
      </StyledPaper>

      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          tableName='carsCatalog'
          data={cars?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          totalPages={cars?.totalPagesNumber ?? 1}
          currentPage={cars?.currentPageNumber ?? pagination.pageIndex + 1}
          manualPagination={true}
          renderSubComponent={({ row, table }) => {
            const modelYears = carYearsData[row.modelId]
            if (modelYears) {
              return (
                <>
                  {modelYears.map((year: any, index: number) => (
                    <TableRow key={index}>
                      {table.getVisibleLeafColumns().map((column: any) => {
                        if ((column as any).accessorKey === 'year' || column.id === 'year') {
                          return (
                            <TableCell key={column.id} sx={{ backgroundColor: '#f8f9fa' }}>
                              {year.year}
                            </TableCell>
                          )
                        } else if (column.id === 'actions') {
                          return (
                            <TableCell key={column.id} sx={{ backgroundColor: '#f8f9fa' }}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <AppActionButton
                                  type='view'
                                  onClick={() => {
                                    navigate({ to: '/catalog/$id', params: { id: year.carId } })
                                  }}
                                />
                                <AppActionButton
                                  type='edit'
                                  onClick={() => {
                                    navigate({ to: '/catalog/edit/$id', params: { id: year.carId } })
                                  }}
                                />
                                <AppActionButton
                                  type='duplicate'
                                  onClick={() => { console.log('Duplicate car:', year.carId) }}
                                />
                              </Box>
                            </TableCell>
                          )
                        } else {
                          return (
                            <TableCell key={column.id} sx={{ backgroundColor: '#f8f9fa' }}>
                            </TableCell>
                          )
                        }
                      })}
                    </TableRow>
                  ))}
                </>
              )
            }
            return (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <AppLoading />
                </TableCell>
              </TableRow>
            )
          }}
        />
      </StyledPaper>
    </Grid>
  </>)
}

export default CatalogPage