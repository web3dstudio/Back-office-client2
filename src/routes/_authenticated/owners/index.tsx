import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TOwner } from '../../../types'
import { useOwnerAddMutation, useOwnerDeleteMutation, useOwnersQuery, useOwnerUpdateMutation } from '../../../query/owners.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataTable from '../../../components/AppDataTable'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import OwnersForm from '../../../components/Owners/OwnersForm'
import AppActionButton from '../../../components/AppActionButton'
import AppError from '../../../components/AppError'

export const Route = createFileRoute('/_authenticated/owners/')({
  component: OwnersPage,
})

function OwnersPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TOwner | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: ownersData, isLoading, isError } = useOwnersQuery()
  const { mutate: addMutation } = useOwnerAddMutation()
  const { mutate: updateMutation } = useOwnerUpdateMutation()
  const { mutate: deleteMutation } = useOwnerDeleteMutation()

  const columns = useMemo<ColumnDef<TOwner>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'nameEn',
        header: t('nameEn', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: true,
        size: 300,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'defaultChangePercentage',
        header: t('defaultChangePercentage', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 250,
      },
      {
        accessorKey: 'lessThanYearChangePercentage',
        header: t('lessThanYearChangePercentage', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 250,
      },
      {
        accessorKey: 'ownerCountAdjustmentFactor',
        header: t('ownerCountAdjustmentFactor', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 250,
      },
      {
        accessorKey: 'mileageAdjustmentType',
        header: t('mileageAdjustmentType', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: false,
        size: 120,
        minSize: 100,
        maxSize: 150,
        cell: ({ row }) => {
          switch (row.original.mileageAdjustmentType) {
            case 1: return '−';
            case 2: return '÷';
            case 3: return '×';
            case 4: return '+';
            default: return 'not set';
          }
        },
      },
      {
        accessorKey: 'mileageAdjustmentFactor',
        header: t('mileageAdjustmentFactor', { ns: 'owners' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 250,
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


  const onSubmit = (data: TOwner) => {
    if (selected) {
      updateMutation({ ...data, id: selected.id }, {
        onSuccess: () => {
          setOpenFormDialog(false)
        }
      })
    } else {
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
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {t('title', { ns: 'owners' })}
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
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          tableName='owners'
          data={ownersData ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toLowerCase().includes(filterValue.toLowerCase())
            const nameEnMatch = row.original.nameEn?.toLowerCase().includes(filterValue.toLowerCase())
            const defaultChangeMatch = row.original.defaultChangePercentage?.toString().toLowerCase().includes(filterValue.toLowerCase())
            const lessThanYearMatch = row.original.lessThanYearChangePercentage?.toString().toLowerCase().includes(filterValue.toLowerCase())
            const ownerCountMatch = row.original.ownerCountAdjustmentFactor?.toString().toLowerCase().includes(filterValue.toLowerCase())
            const mileageFactorMatch = row.original.mileageAdjustmentFactor?.toString().toLowerCase().includes(filterValue.toLowerCase())

            // Поиск по символам mileageAdjustmentType
            let typeMatch = false
            switch (row.original.mileageAdjustmentType) {
              case 1: typeMatch = '−'.includes(filterValue) || 'minus'.includes(filterValue.toLowerCase())
                break
              case 2: typeMatch = '÷'.includes(filterValue) || 'divide'.includes(filterValue.toLowerCase())
                break
              case 3: typeMatch = '×'.includes(filterValue) || 'multiply'.includes(filterValue.toLowerCase())
                break
              case 4: typeMatch = '+'.includes(filterValue) || 'plus'.includes(filterValue.toLowerCase())
                break
            }

            return nameMatch || nameEnMatch || defaultChangeMatch || lessThanYearMatch || ownerCountMatch || mileageFactorMatch || typeMatch
          }}
        />
      </StyledPaper>
    </Grid>

    <AppConfirmDialog
      open={openConfirmDialog}
      onClose={() => setOpenConfirmDialog(false)}
      onSubmit={onDelete}
      title={t('modals.approveDelete', { ns: 'common' })}
    />

    <AppDialog
      open={openFormDialog}
      onClose={() => setOpenFormDialog(false)}
      title={selected ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
      maxWidth='sm'
    >
      <OwnersForm
        data={selected}
        isPending={false}
        onCancel={() => setOpenFormDialog(false)}
        onConfirm={(data: TOwner) => onSubmit(data)}
      />
    </AppDialog>
  </>)
}
