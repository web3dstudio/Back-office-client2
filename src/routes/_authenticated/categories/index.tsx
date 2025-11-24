import { createFileRoute } from '@tanstack/react-router'
import { useCategoriesAddMutation } from '../../../query/category.query'
import { useCategoriesUpdateMutation } from '../../../query/category.query'
import { useCategoriesDeleteMutation } from '../../../query/category.query'
import { useCategoriesQuery } from '../../../query/category.query'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import type { TCategory } from '../../../types'
import AppActionButton from '../../../components/AppActionButton'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppError from '../../../components/AppError'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppDataTable from '../../../components/AppDataTable'
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data: categories, isLoading, isError } = useCategoriesQuery()
  const { mutate: addMutation } = useCategoriesAddMutation()
  const { mutate: updateMutation } = useCategoriesUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useCategoriesDeleteMutation()

  const columns = useMemo<ColumnDef<TCategory>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'categories' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'nameEn',
        header: t('nameEn', { ns: 'categories' }),
        enableSorting: true,
        enableHiding: true,
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: 'categoryID',
        header: t('categoryID', { ns: 'categories' }),
        enableSorting: true,
        enableHiding: false,
        size: 150,
        minSize: 100,
        maxSize: 200,
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

  const onSubmit = (data: TCategory) => {
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
        <AppDataTable
          tableName='categories'
          data={categories ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalPages={Math.ceil((categories?.length || 0) / pagination.pageSize)}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const nameEnMatch = row.original.nameEn?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            const categoryIDMatch = row.original.categoryID?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            return nameMatch || nameEnMatch || categoryIDMatch
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
