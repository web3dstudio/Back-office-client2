import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TGearbox } from '../../../types'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import { useGearboxesAddMutation, useGearboxesDeleteMutation, useGearboxesQuery, useGearboxesUpdateMutation } from '../../../query/gearboxes.query'
import GearboxesForm from '../../../components/Gearboxes/GearboxesForm'

export const Route = createFileRoute('/_authenticated/gearboxes/')({
  component: GearboxesPage,
})

function GearboxesPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TGearbox | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: gearboxes, isLoading, isError } = useGearboxesQuery()
  const { mutate: addMutation } = useGearboxesAddMutation()
  const { mutate: updateMutation } = useGearboxesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useGearboxesDeleteMutation()

  const columns = useMemo<ColumnDef<TGearbox>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'gearboxes' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'nameEn',
        header: t('nameEn', { ns: 'gearboxes' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'automaticInd',
        header: t('automaticInd', { ns: 'gearboxes' }),
        enableSorting: true,
        enableHiding: true,
        size: 150,
        minSize: 100,
        maxSize: 200,
        cell: ({ row }) => (
          <Box>
            {row.original.automaticInd ? t('yes', { ns: 'common' }) : t('no', { ns: 'common' })}
          </Box>
        ),
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

  const onSubmit = (data: TGearbox) => {
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
            {t('title', { ns: 'gearboxes' })}
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
          tableName='gearboxes'
          data={gearboxes ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          hidePagination={true}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const nameEnMatch = row.original.nameEn?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const automaticMatch = (row.original.automaticInd ? t('yes', { ns: 'common' }) : t('no', { ns: 'common' })).toLowerCase().includes(filterValue.toLowerCase())
            return nameMatch || nameEnMatch || automaticMatch
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
        <GearboxesForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}
