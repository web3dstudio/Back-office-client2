import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TDriveType } from '../../../types'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import { useDriveTypesAddMutation, useDriveTypesDeleteMutation, useDriveTypesQuery, useDriveTypesUpdateMutation } from '../../../query/driveTypes.query'
import DriveTypesForm from '../../../components/DriveTypes/DriveTypesForm'


export const Route = createFileRoute('/_authenticated/drive-types/')({
  component: DriveTypesPage,
})

function DriveTypesPage() {

  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TDriveType | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: driveTypes, isLoading, isError } = useDriveTypesQuery()
  const { mutate: addMutation } = useDriveTypesAddMutation()
  const { mutate: updateMutation } = useDriveTypesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useDriveTypesDeleteMutation()

  const columns = useMemo<ColumnDef<TDriveType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'driveTypes' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'code',
        header: t('code', { ns: 'driveTypes' }),
        enableSorting: true,
        enableHiding: false,
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'driveTypes' }),
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

  const onSubmit = (data: TDriveType) => {
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
            {t('title', { ns: 'driveTypes' })}
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

      <StyledPaper
        sx={{
          overflow: 'hidden',
          padding: 3,
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          tableName='driveTypes'
          data={driveTypes ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          hidePagination={true}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const codeMatch = row.original.code?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            return nameMatch || codeMatch
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
        <DriveTypesForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}
