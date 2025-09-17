import { Grid, Box, Typography, Button } from '@mui/material'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../components/StyledPaper'
import { useManufacturerAddMutation, useManufacturerDeleteMutation, useManufacturersQuery } from '../../../query/manufacturers.query'
import AppError from '../../../components/AppError'
import AppDataGrid from '../../../components/AppDataGrid'
import type { TManufacturer } from '../../../types'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import AppActionButton from '../../../components/AppActionButton'
import { useEffect, useState } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import ManufacturerForm from '../../../components/Manufacturer/ManufacturerForm'

export const Route = createFileRoute('/_authenticated/manufacturers/')({
  component: ManufacturersPage
})

function ManufacturersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [selected, setSelected] = useState<TManufacturer | null>(null)

  const search = useSearch({ from: '/_authenticated/manufacturers/' }) as { openModal: 'add' | 'edit' }

  useEffect(() => {
    if (search?.openModal === 'add') {
      setOpenFormDialog(true)
    }
  }, [search])

  const { data: manufacturers, isLoading, isError } = useManufacturersQuery()
  const { mutate: deleteMutation, isPending: isDeleting } = useManufacturerDeleteMutation()
  const { mutate: addMutation } = useManufacturerAddMutation()

  const columns = [
    {
      field: 'name',
      headerName: t('name', { ns: 'manufacturers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'engName',
      headerName: t('engName', { ns: 'manufacturers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'manufacturerCode',
      headerName: t('manufacturerCode', { ns: 'manufacturers' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      minWidth: 200
    },

    {
      field: 'icon',
      headerName: t('logo', { ns: 'manufacturers' }) || 'Logo',
      editable: false,
      hideable: true,
      type: 'string',
      width: 60,
      minWidth: 50,
      renderCell: (params: GridRenderCellParams<TManufacturer>) => {
        const logoImg = params.row.logoDownloadUri;
        if (logoImg) {
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
                src={logoImg}
                alt="logo"
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            </Box>
          )
        }
        return null;
      },
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      hideable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='edit' onClick={() => {
          // setSelected(() => params.row)
          // setOpenFormDialog(true)
          navigate({ to: '/manufacturers/edit/$id', params: { id: params.row.id } })
        }} />,
        <AppActionButton type='delete' onClick={() => {
          setSelected(() => params.row)
          setOpenConfirmDialog(true)
        }} />
      ],
    }
  ]

  const onSubmit = (data: TManufacturer) => {
    addMutation(data, {
      onSuccess: () => {
        setOpenFormDialog(false)
      }
    })

  }

  const onDelete = () => {
    if (selected) {
      deleteMutation(selected.id, {
        onSuccess: () => {
          setOpenConfirmDialog(false)
          setSelected(null)
        }
      })
    }
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
            {t('title', { ns: 'manufacturers' })}
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
          overflow: 'hidden',
          padding: 3,
          display: 'flex',
          gap: 2,
          maxWidth: '100%',
          width: '100%',
        }}
      >
        <AppDataGrid
          tableName='manufacturersTable'
          rows={manufacturers ?? []}
          columns={columns as GridColDef<TManufacturer>[]}
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
        <ManufacturerForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}
