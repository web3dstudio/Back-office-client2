import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { TUpgradePackage } from '../../../types'
import { useUpgradePackagesAddMutation, useUpgradePackagesDeleteMutation, useUpgradePackagesQuery, useUpgradePackagesUpdateMutation } from '../../../query/upgradePackages.query'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { type ColumnDef } from '@tanstack/react-table'
import { type SortingState } from '@tanstack/react-table'
import AppError from '../../../components/AppError'
import { Box, Button, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataTable from '../../../components/AppDataTable'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import UpgradePackagesForm from '../../../components/UpgradePackages/UpgradePackagesForm'

export const Route = createFileRoute('/_authenticated/upgrade-packages/')({
  component: UpgradePackagesPage,
})




function UpgradePackagesPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TUpgradePackage | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: upgradePackages, isLoading, isError } = useUpgradePackagesQuery()
  const { mutate: addMutation } = useUpgradePackagesAddMutation()
  const { mutate: updateMutation } = useUpgradePackagesUpdateMutation()
  const { mutate: deleteMutation } = useUpgradePackagesDeleteMutation()

  const columns = useMemo<ColumnDef<TUpgradePackage>[]>(() => [
    {
      accessorKey: 'name',
      header: t('name', { ns: 'integralExtras' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'nameEn',
      header: t('nameEn', { ns: 'integralExtras' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'defaultChangePercentage',
      header: t('defaultChangePercentage', { ns: 'integralExtras' }),
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      meta: {
        align: 'right'
      },
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
          <AppActionButton type='edit' onClick={() => {
            setSelected(row.original)
            setOpenFormDialog(true)
          }} />
          <AppActionButton type='delete' onClick={() => {
            setSelected(row.original)
            setOpenConfirmDialog(true)
          }} />
        </Box>
      ),
    }
  ], [t])


  const onSubmit = (data: TUpgradePackage) => {
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
            {t('title', { ns: 'upgradePackages' })}
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
          boxShadow:
            '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06);',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <AppDataTable
          data={upgradePackages ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          tableName='upgradePackages'
        />
      </StyledPaper>

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
        <UpgradePackagesForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data: TUpgradePackage) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}