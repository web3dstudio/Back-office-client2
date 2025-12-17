import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { TServicePackage, TUpgradePackage } from '../../../types'
import { useServicePackagesAddMutation, useServicePackagesDeleteMutation, useServicePackagesQuery, useServicePackagesUpdateMutation } from '../../../query/servicePackages.query'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import AppError from '../../../components/AppError'
import { Box, Button, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataTable from '../../../components/AppDataTable'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import ServicePackagesForm from '../../../components/ServicePackages/ServicePackagesForm'
import { useIconsQuery } from '../../../query/icons.query'

export const Route = createFileRoute('/_authenticated/service-packages/')({
  component: ServicePackagesPage,
})


function ServicePackagesPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TUpgradePackage | null>(null)

  const { data: servicePackages, isLoading, isError } = useServicePackagesQuery()
  const { data: icons } = useIconsQuery()
  const { mutate: addMutation } = useServicePackagesAddMutation()
  const { mutate: updateMutation } = useServicePackagesUpdateMutation()
  const { mutate: deleteMutation } = useServicePackagesDeleteMutation()

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<TServicePackage>[]>(
    () => [
      {
        id: 'icon',
        header: t('icon', { ns: 'servicePackages' }),
        enableSorting: false,
        enableHiding: true,
        size: 70,
        cell: ({ row }) => {
          const iconId = (row.original as any)?.iconId as string | null | undefined
          const iconSrc = iconId ? (icons || []).find(i => i.id === iconId)?.downloadUri : null
          if (!iconSrc) return null
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={iconSrc} alt="icon" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </Box>
          )
        },
      },
      {
        accessorKey: 'name',
        header: t('name', { ns: 'servicePackages' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 100,
        maxSize: 300,
      },
      {
        accessorKey: 'nameEn',
        header: t('nameEn', { ns: 'servicePackages' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 100,
        maxSize: 300,
      },
      {
        accessorKey: 'defaultChangePercentage',
        header: t('defaultChangePercentage', { ns: 'servicePackages' }),
        enableSorting: true,
        enableHiding: false,
        size: 200,
        minSize: 150,
        maxSize: 250,
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'servicePackages' }),
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
    [t, icons]
  )


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
            {t('title', { ns: 'servicePackages' })}
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
          tableName='servicePackages'
          data={servicePackages ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
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
        <ServicePackagesForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data: TServicePackage) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}