import { Grid, Box, Typography, Button } from '@mui/material'
import AppTextField from '../../../components/AppTextField'
import { AppAutocomplete } from '../../../components/AppAutocomplete'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../components/StyledPaper'
import { useCodesQuery, useCodeDeleteMutation } from '../../../query/codes.query'
import AppError from '../../../components/AppError'
import AppDataTable from '../../../components/AppDataTable'
import type { TCodeList } from '../../../types'
import type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import type { GridSortModel } from '@mui/x-data-grid'
import AppActionButton from '../../../components/AppActionButton'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'

export const Route = createFileRoute('/_authenticated/codes/')({
  component: CodesPage,
})

type CodesFilters = {
  modelCode: string
  year: string
}

function CodesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate({ from: '/codes' })
  const [filtersDraft, setFiltersDraft] = useState<CodesFilters>({
    modelCode: '',
    year: '',
  })
  const [filters, setFilters] = useState<CodesFilters>(filtersDraft)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedCode, setSelectedCode] = useState<TCodeList | null>(null)

  const sortModel: GridSortModel | undefined = sorting.length > 0
    ? [{ field: sorting[0].id, sort: sorting[0].desc ? 'desc' : 'asc' }]
    : undefined

  const { data: codesData, isLoading, isError } = useCodesQuery(
    pagination.pageIndex,
    {
      ModelCode: filters.modelCode,
      Year: filters.year,
    },
    sortModel
  )
  const { mutate: deleteCode, isPending: isDeleting } = useCodeDeleteMutation()

  const columns = useMemo<ColumnDef<TCodeList>[]>(
    () => [
      {
        accessorKey: 'manufacturerName',
        header: t('manufacturerName', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: 'innerCode',
        header: t('modelCode', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'modelName',
        header: t('modelName', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 250,
        minSize: 200,
        maxSize: 300,
      },
      {
        accessorKey: 'year',
        header: t('year', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: 'carType',
        header: t('carType', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'isAuto',
        header: t('isAuto', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'innerCarTypeCode',
        header: t('innerCarTypeCode', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 180,
        minSize: 150,
        maxSize: 250,
      },
      {
        accessorKey: 'innerSubCode',
        header: t('innerSubCode', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 120,
        maxSize: 200,
      },
      {
        accessorKey: 'chassis',
        header: t('chassis', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 120,
        maxSize: 200,
        cell: ({ row }) => {
          return row.original.chassisName || ''
        },
      },
      {
        accessorKey: 'fromYear',
        header: t('fromYear', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'toYear',
        header: t('toYear', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: 'description',
        header: t('description', { ns: 'codes' }),
        enableSorting: true,
        enableHiding: true,
        size: 300,
        minSize: 200,
        maxSize: 400,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        size: 140,
        minSize: 140,
        maxSize: 140,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton type='edit' onClick={() => {
              navigate({ to: '/codes/$id', params: { id: row.original.id } })
            }} />
            <AppActionButton type='delete' onClick={() => {
              setSelectedCode(row.original)
              setOpenConfirmDialog(true)
            }} />
          </Box>
        ),
      },
    ],
    [t, navigate]
  )

  const handleResetFilter = () => {
    setFiltersDraft({ modelCode: '', year: '' })
    setFilters({ modelCode: '', year: '' })
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleSearch = () => {
    setFilters(filtersDraft)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  // Generate years from current year down to 1990
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)

  if (isError && !isLoading) {
    return <AppError />
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'codes' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            onClick={() => navigate({ to: '/codes/new' })}
          >
            {t('addNew', { ns: 'codes' })}
          </Button>
          <Button
            variant='contained'
            onClick={() => navigate({ to: '/codes/sync' })}
          >
            {t('assignments', { ns: 'codes' })}
          </Button>
        </Box>
      </Grid>

      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
        }}
      >
        <Grid container columns={12} columnSpacing={2} rowSpacing={2}>
          <Grid size={4}>
            <AppTextField
              name="modelCode"
              label={t('modelCode', { ns: 'codes' })}
              value={filtersDraft.modelCode}
              onChange={(value) => setFiltersDraft(prev => ({ ...prev, modelCode: value }))}
            />
          </Grid>
          <Grid size={4}>
            <AppAutocomplete
              value={filtersDraft.year ? Number(filtersDraft.year) : null}
              onChange={(value) => setFiltersDraft(prev => ({ ...prev, year: value ? String(value) : '' }))}
              options={years}
              getOptionLabel={(option) => option.toString()}
              isOptionEqualToValue={(option, value) => option === value}
              label={t('year', { ns: 'codes' })}
            />
          </Grid>
          <Grid size={4} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="outlined" onClick={handleResetFilter}>
              {t('resetFilter', { ns: 'codes' })}
            </Button>
            <Button variant="contained" onClick={handleSearch}>
              {t('search', { ns: 'codes' })}
            </Button>
          </Grid>
        </Grid>
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
          tableName='codes'
          data={(codesData?.data as TCodeList[]) ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={true}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={codesData?.totalPagesNumber ?? 1}
          currentPage={codesData?.currentPageNumber ?? pagination.pageIndex + 1}
        />
      </StyledPaper>

      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => {
          setOpenConfirmDialog(false)
          setSelectedCode(null)
        }}
        onSubmit={() => {
          if (selectedCode) {
            deleteCode(selectedCode.id, {
              onSuccess: () => {
                setOpenConfirmDialog(false)
                setSelectedCode(null)
              },
            })
          }
        }}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
      />
    </Grid>
  )
}
