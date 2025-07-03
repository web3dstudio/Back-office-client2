import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  useCarTypesAddMutation,
  useCarTypesDeleteMutation,
  useCarTypesQuery,
  useCarTypesUpdateMutation,
} from '../../../query/carTypes.query'
import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid'
import { useState } from 'react'
import type { TCarType } from '../../../types'
import AppDataGrid from '../../../components/AppDataGrid'
import AppError from '../../../components/AppError'
import AppActionButton from '../../../components/AppActionButton'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import CarTypeForm from '../../../components/CarType/CarTypeForm'
import { usePriceListTypesQuery } from '../../../query/priceListTypes.querty'
import { useIconsQuery } from '../../../query/icons.query'


export const Route = createFileRoute('/_authenticated/car-types/')({
  component: CarTypes,
})

function CarTypes() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCarType | null>(null)

  useIconsQuery()

  const { data: carTypes, isLoading, isError } = useCarTypesQuery()
  usePriceListTypesQuery()
  const { data: priceListTypesList } = usePriceListTypesQuery()


  const { mutate: addMutation } = useCarTypesAddMutation()
  const { mutate: updateMutation } = useCarTypesUpdateMutation()
  const { mutate: deleteMutation } = useCarTypesDeleteMutation()

  const columns = [
    {
      field: 'icon',
      headerName: t('icon', { ns: 'carTypes' }) || 'Icon',
      editable: false,
      hideable: true,
      type: 'string',
      width: 60,
      renderCell: (params: GridRenderCellParams<TCarType>) => {
        const icon = params.row.icon;
        if (icon && icon.downloadUri) {
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
              }}
            >
              <img
                src={icon.downloadUri}
                alt="icon"
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            </Box>
          )
        }
        return null;
      },
    },
    {
      field: 'name',
      headerName: t('name', { ns: 'carTypes' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'carTypeID',
      headerName: t('carTypeID', { ns: 'carTypes' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'code',
      headerName: t('code', { ns: 'carTypes' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'licenseType',
      headerName: t('licenseType', { ns: 'carTypes' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'priceListType',
      headerName: t('priceListType', { ns: 'carTypes' }),
      hideable: true,
      editable: false,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCarType) => {
        return priceListTypesList?.find(type => String(type?.id) === String(row?.priceListType))?.name
      }
    },
    {
      field: 'iconId',
      headerName: 'iconId',
      editable: false,
      hideable: false,
      type: 'string',
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      hideable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='edit' onClick={() => {
          console.log('params.row', params.row)
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

  const onSubmit = (data: TCarType) => {
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
            {t('title', { ns: 'carTypes' })}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            setSelected(null)
            setOpenFormDialog(true)
          }}>
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
        <AppDataGrid
          tableName='carTypesTable'
          rows={carTypes ?? []}
          columns={columns as GridColDef<TCarType>[]}
          editMode='row'
          isLoading={isLoading}
          hideFooterSelectedRowCount={true}
          columnVisibilityModel={{
            iconId: false,
          }}
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
        <CarTypeForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}
