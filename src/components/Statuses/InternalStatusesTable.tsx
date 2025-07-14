import AppActionButton from '../AppActionButton'
import { useState } from 'react'
import AppConfirmDialog from '../AppDialog/AppConfirmDialog'
import AppDialog from '../AppDialog/AppDialog'
import AppError from '../AppError'
import StatusesForm from './StatusesForm'
import { useTranslation } from 'react-i18next'
import type { TInternalStatus } from '../../types'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import AppDataGrid from '../AppDataGrid'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useInternalStatusesAddMutation, useInternalStatusesDeleteMutation, useInternalStatusesQuery, useInternalStatusesUpdateMutation } from '../../query/internalStatus.query'


function InternalStatusesTable() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TInternalStatus | null>(null)

  const { data: internalStatuses, isLoading, isError } = useInternalStatusesQuery()
  const { mutate: addMutation } = useInternalStatusesAddMutation()
  const { mutate: updateMutation } = useInternalStatusesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useInternalStatusesDeleteMutation()


  const columns = [
    {
      field: 'name',
      headerName: t('name', { ns: 'statuses' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TInternalStatus) => row.name,
    },
    {
      field: 'nameEn',
      headerName: t('nameEn', { ns: 'statuses' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TInternalStatus) => row.nameEn,
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
        <AppDataGrid
          tableName='internalStatusesTable'
          rows={internalStatuses ?? []}
          columns={columns as GridColDef<TInternalStatus>[]}
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