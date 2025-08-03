import { createFileRoute } from '@tanstack/react-router'
import { useCategoriesAddMutation } from '../../../query/category.query'
import { useCategoriesUpdateMutation } from '../../../query/category.query'
import { useCategoriesDeleteMutation } from '../../../query/category.query'
import { useCategoriesQuery } from '../../../query/category.query'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import type { TCategory } from '../../../types'
import AppActionButton from '../../../components/AppActionButton'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppError from '../../../components/AppError'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataGrid from '../../../components/AppDataGrid'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import CategoriesForm from '../../../components/Categories/CategoriesForm'

export const Route = createFileRoute('/_authenticated/categories/')({
  component: CategoriesPage,
})

function CategoriesPage() {

  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCategory | null>(null)

  const { data: categories, isLoading, isError } = useCategoriesQuery()
  const { mutate: addMutation } = useCategoriesAddMutation()
  const { mutate: updateMutation } = useCategoriesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useCategoriesDeleteMutation()

  const columns = [
    {
      field: 'name',
      headerName: t('name', { ns: 'categories' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCategory) => row.name,
    },
    {
      field: 'nameEn',
      headerName: t('nameEn', { ns: 'categories' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TCategory) => row.nameEn,
    },


    {
      field: 'categoryID',
      headerName: t('categoryID', { ns: 'categories' }),
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

  const onSubmit = (data: TCategory) => {
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
            {t('title', { ns: 'categories' })}
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
          tableName='categoriesTable'
          rows={categories ?? []}
          columns={columns as GridColDef<TCategory>[]}
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
        <CategoriesForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data: TCategory) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}
