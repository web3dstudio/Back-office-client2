import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { TServicePackage, TUpgradePackage } from '../../../types'
import { useServicePackagesAddMutation, useServicePackagesDeleteMutation, useServicePackagesQuery, useServicePackagesUpdateMutation } from '../../../query/servicePackages.query'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import AppError from '../../../components/AppError'
import { Box, Button, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataGrid from '../../../components/AppDataGrid'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import ServicePackagesForm from '../../../components/ServicePackages/ServicePackagesForm'

export const Route = createFileRoute('/_authenticated/service-packages/')({
  component: ServicePackagesPage,
})


function ServicePackagesPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TUpgradePackage | null>(null)

  const { data: servicePackages, isLoading, isError } = useServicePackagesQuery()
  const { mutate: addMutation } = useServicePackagesAddMutation()
  const { mutate: updateMutation } = useServicePackagesUpdateMutation()
  const { mutate: deleteMutation } = useServicePackagesDeleteMutation()

  const columns = [
    {
      field: 'name',
      headerName: t('name', { ns: 'integralExtras' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TUpgradePackage) => row.name,
    },
    {
      field: 'nameEn',
      headerName: t('nameEn', { ns: 'integralExtras' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TUpgradePackage) => row.nameEn,
    },
    {
      field: 'defaultChangePercentage',
      headerName: t('defaultChangePercentage', { ns: 'integralExtras' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      hideable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='edit' onClick={() => {
          setSelected(() => params.row)
          setOpenFormDialog(true)
        }} />,
        <AppActionButton type='delete' onClick={() => {
          setSelected(() => params.row)
          setOpenConfirmDialog(true)
        }} />
      ],
    }
  ]


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
        <AppDataGrid
          tableName='upgradePackagesTable'
          rows={servicePackages ?? []}
          columns={columns as GridColDef<TServicePackage>[]}
          editMode='row'
          isLoading={isLoading}
          hideFooterSelectedRowCount={true}
          initialState={{
            filter: {
              filterModel: {
                items: [],
                quickFilterValues: [],
              },
            },
          }}
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