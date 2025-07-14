import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TOwner } from '../../../types'
import { useOwnerAddMutation, useOwnerDeleteMutation, useOwnersQuery, useOwnerUpdateMutation } from '../../../query/owners.query'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataGrid from '../../../components/AppDataGrid'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
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

  const { data: ownersData, isLoading, isError } = useOwnersQuery()
  const { mutate: addMutation } = useOwnerAddMutation()
  const { mutate: updateMutation } = useOwnerUpdateMutation()
  const { mutate: deleteMutation } = useOwnerDeleteMutation()


  const columns = [
    {
      field: 'name',
      headerName: t('name', { ns: 'owners' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOwner) => row.name,
    },
    {
      field: 'nameEn',
      headerName: t('nameEn', { ns: 'owners' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TOwner) => row.nameEn,
    },
    {
      field: 'defaultChangePercentage',
      headerName: t('defaultChangePercentage', { ns: 'owners' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
    },
    {
      field: 'lessThanYearChangePercentage',
      headerName: t('lessThanYearChangePercentage', { ns: 'owners' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
    },
    {
      field: 'ownerCountAdjustmentFactor',
      headerName: t('ownerCountAdjustmentFactor', { ns: 'owners' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
    },
    {
      field: 'mileageAdjustmentType',
      headerName: t('mileageAdjustmentType', { ns: 'owners' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 0,
      valueGetter: (_value: any, row: TOwner) => {
        switch (row.mileageAdjustmentType) {
          case 1: return '−';
          case 2: return '÷';
          case 3: return '×';
          case 4: return '+';
          default: return 'not set';
        }
      },
    },
    {
      field: 'mileageAdjustmentFactor',
      headerName: t('mileageAdjustmentFactor', { ns: 'owners' }),
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
        <AppDataGrid
          tableName='upgradePackagesTable'
          rows={ownersData ?? []}
          columns={columns as GridColDef<TOwner>[]}
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
