import { Grid, Box, Typography, Button } from '@mui/material'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../components/StyledPaper'
import { useManufacturerAddMutation, useManufacturerDeleteMutation, useManufacturersQuery } from '../../../query/manufacturers.query'
import AppError from '../../../components/AppError'
import AppDataTable from '../../../components/AppDataTable'
import type { TManufacturer } from '../../../types'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import AppActionButton from '../../../components/AppActionButton'
import { useEffect, useState, useMemo } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import ManufacturerForm from '../../../components/Manufacturer/ManufacturerForm'

export const Route = createFileRoute('/_authenticated/manufacturers/')({
  component: ManufacturersPage
})

function ManufacturersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [selected, setSelected] = useState<TManufacturer | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const search = useSearch({ from: '/_authenticated/manufacturers/' }) as { openModal: 'add' | 'edit' }

  useEffect(() => {
    if (search?.openModal === 'add') {
      setOpenFormDialog(true)
    }
  }, [search])

  const { data: manufacturers, isLoading, isError } = useManufacturersQuery()
  const { mutate: deleteMutation, isPending: isDeleting } = useManufacturerDeleteMutation()
  const { mutate: addMutation } = useManufacturerAddMutation()

  const columns = useMemo<ColumnDef<TManufacturer>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'manufacturers' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'engName',
        header: t('engName', { ns: 'manufacturers' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'manufacturerCode',
        header: t('manufacturerCode', { ns: 'manufacturers' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'logo',
        header: t('logo', { ns: 'manufacturers' }) || 'Logo',
        enableSorting: false,
        enableHiding: true,
        size: 60,
        minSize: 50,
        maxSize: 80,
        cell: ({ row }) => {
          const logoImg = row.original.logoDownloadUri;
          if (logoImg) {
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  width: '100%',
                }}
              >
                <img
                  src={logoImg}
                  alt="logo"
                  style={{ width: 20, height: 20, objectFit: 'contain' }}
                />
              </Box>
            )
          }
          return null;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        enableHiding: false,
        size: 80,
        minSize: 80,
        maxSize: 80,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton type='edit' onClick={() => {
              navigate({ to: '/manufacturers/edit/$id', params: { id: row.original.id } })
            }} />
            <AppActionButton type='delete' onClick={() => {
              setSelected(() => row.original)
              setOpenConfirmDialog(true)
            }} />
          </Box>
        ),
      },
    ],
    [t, navigate]
  )

  const onSubmit = (data: TManufacturer) => {
    addMutation(data, {
      onSuccess: () => {
        setOpenFormDialog(false)
      }
    })

  }

  const onDelete = () => {
    if (selected) {
      deleteMutation(selected.id, {
        onSuccess: () => {
          setOpenConfirmDialog(false)
          setSelected(null)
        }
      })
    }
  }


  if (isError && !isLoading) {
    return <AppError />
  }

  return (
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'manufacturers' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            setSelected(null)
            setOpenFormDialog(true)
          }}>
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>

      <StyledPaper
        sx={{
          overflow: 'hidden',
          padding: 3,
          display: 'flex',
          gap: 2,
          maxWidth: '100%',
          width: '100%',
        }}
      >
        <AppDataTable
          tableName='manufacturers'
          data={manufacturers ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={Math.ceil((manufacturers?.length || 0) / pagination.pageSize)}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const engNameMatch = row.original.engName?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const codeMatch = row.original.manufacturerCode?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            return nameMatch || engNameMatch || codeMatch
          }}
        />

      </StyledPaper>


      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={onDelete}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
      />

      <AppDialog
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        title={selected ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
        maxWidth='sm'
      >
        <ManufacturerForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}
