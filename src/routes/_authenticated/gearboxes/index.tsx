import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataGrid from '../../../components/AppDataGrid'
import type { TGearbox } from '../../../types'
import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import { useDriveTypesAddMutation, useDriveTypesDeleteMutation, useDriveTypesQuery, useDriveTypesUpdateMutation } from '../../../query/driveTypes.query'
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

  const { data: gearboxes, isLoading, isError } = useGearboxesQuery()
  const { mutate: addMutation } = useGearboxesAddMutation()
  const { mutate: updateMutation } = useGearboxesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useGearboxesDeleteMutation()

  const columns = [
    {
      field: 'name',
      headerName: t('name', { ns: 'gearboxes' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },

    {
      field: 'nameEn',
      headerName: t('nameEn', { ns: 'gearboxes' }),
      editable: false,
      hideable: false,
      type: 'string',
      flex: 1,
    },
    {
      field: 'automaticInd',
      headerName: t('automaticInd', { ns: 'gearboxes' }),
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
            {t('title', { ns: 'engineTypes' })}
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
        <AppDataGrid
          tableName='gearboxesTable'
          rows={gearboxes ?? []}
          columns={columns as GridColDef<TGearbox>[]}
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
