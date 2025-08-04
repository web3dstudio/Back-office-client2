import { createFileRoute } from '@tanstack/react-router'
import { useCarsQuery } from '../../../query/car.query'
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useMemo } from 'react'
import type { TCarsList, } from '../../../types'
import { type ColumnDef, type SortingState, type PaginationState } from '@tanstack/react-table'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataTable from '../../../components/AppDataTable'


export const Route = createFileRoute('/_authenticated/catalog/')({
  component: CatalogPage,
})

function CatalogPage() {
  const { t } = useTranslation()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCarsList | null>(null)
  const dateTimeFormat = useDateTimeFormat()

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination)
  }

  const { data: cars, isLoading } = useCarsQuery(pagination.pageIndex, {}, sorting.map(s => ({ field: s.id, sort: s.desc ? 'desc' : 'asc' })))


  const columns: ColumnDef<TCarsList>[] = useMemo(() => [
    {
      accessorKey: 'manufacturer',
      header: t('manufacturer', { ns: 'carCatalog' }),
      enableSorting: true,
    },
    {
      accessorKey: 'modelCode',
      header: t('modelCode', { ns: 'carCatalog' }),
      enableSorting: true,
    },
    {
      accessorKey: 'model',
      header: t('model', { ns: 'carCatalog' }),
      enableSorting: true,
    },
    {
      accessorKey: 'year',
      header: t('year', { ns: 'carCatalog' }),
      enableSorting: true,
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
      enableSorting: false,
      cell: ({ row }) => (
        <AppActionButton
          type='view'
          onClick={() => {
            const id = row.original.id.toString()
            if (expandedRows.has(id)) {
              setExpandedRows(prev => new Set([...prev].filter(rowId => rowId !== id)))
            } else {
              setExpandedRows(prev => new Set([...prev, id]))
            }
          }}
        />
      ),
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
        {/* <Box>
            <Button variant='contained' onClick={() => {
              navigate({ to: '/opinions/new' })
            }

            }>
              {t('modals.add', { ns: 'common' })}
            </Button>
          </Box> */}
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
          data={cars?.data ?? []}
          columns={columns}
          isLoading={isLoading}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          totalPages={cars?.totalPagesNumber ?? 1}
          currentPage={cars?.currentPageNumber ?? pagination.pageIndex + 1}
          manualPagination={true}
        />
      </StyledPaper>
    </Grid>
  </>)
}

export default CatalogPage