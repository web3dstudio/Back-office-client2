import AppActionButton from '../AppActionButton'
import { useState, useMemo } from 'react'
import AppConfirmDialog from '../AppDialog/AppConfirmDialog'
import AppDialog from '../AppDialog/AppDialog'
import AppError from '../AppError'
import StatusesForm from './StatusesForm'
import { useTranslation } from 'react-i18next'
import type { TInternalStatus } from '../../types'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import AppDataTable from '../AppDataTable'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useInternalStatusesAddMutation, useInternalStatusesDeleteMutation, useInternalStatusesQuery, useInternalStatusesUpdateMutation } from '../../query/internalStatus.query'


function InternalStatusesTable() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TInternalStatus | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: internalStatuses, isLoading, isError } = useInternalStatusesQuery()
  const { mutate: addMutation } = useInternalStatusesAddMutation()
  const { mutate: updateMutation } = useInternalStatusesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useInternalStatusesDeleteMutation()


  const columns = useMemo<ColumnDef<TInternalStatus>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'statuses' }),
        enableSorting: true,
        enableHiding: true,
        size: 250,
        minSize: 200,
        maxSize: 400,
      },
      {
        accessorKey: 'nameEn',
        header: t('nameEn', { ns: 'statuses' }),
        enableSorting: true,
        enableHiding: true,
        size: 250,
        minSize: 200,
        maxSize: 400,
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'statuses' }),
        enableSorting: false,
        enableHiding: false,
        size: 80,
        minSize: 80,
        maxSize: 80,
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
            <AppActionButton type='edit' onClick={() => {
              setSelected(() => row.original)
              setOpenFormDialog(true)
            }} />
            <AppActionButton type='delete' onClick={() => {
              setSelected(() => row.original)
              setOpenConfirmDialog(true)
            }} />
          </Box>
        ),
      },
    ],
    [t]
  )

  const onSubmit = (data: TInternalStatus) => {
    if (selected) {
      updateMutation({ ...data, id: selected.id }, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    } else {
      console.log(data)
      addMutation(data, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    }
  }

  const onDelete = () => {
    if (selected) {
      deleteMutation(selected?.id)
    }
    setOpenConfirmDialog(false)
  }

  if (isError && !isLoading) {
    return <AppError />
  }

  return (
    <>
      <Grid
        size={12}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {t('internalStatuses', { ns: 'statuses' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            setSelected(null)
            setOpenFormDialog(true)
          }

          }>
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>
      <Grid size={12}>
        <AppDataTable
          tableName='internalStatuses'
          data={internalStatuses ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          hidePagination={true}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const nameEnMatch = row.original.nameEn?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            return nameMatch || nameEnMatch
          }}
        />
      </Grid>

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
        <StatusesForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </>
  )
}

export default InternalStatusesTable