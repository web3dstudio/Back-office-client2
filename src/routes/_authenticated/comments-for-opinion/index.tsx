import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppDataTable from '../../../components/AppDataTable'
import type { TCommentsForOpinion } from '../../../types'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import CommentsForOpinionForm from '../../../components/Opinions/CommentsForOpinionForm'
import { useCommentsForOpinionAddMutation, useCommentsForOpinionDeleteMutation, useCommentsForOpinionQuery, useCommentsForOpinionUpdateMutation } from '../../../query/commentsForOpinion.query'

export const Route = createFileRoute('/_authenticated/comments-for-opinion/')({
  component: CommentsForOpinionPage,
})

function CommentsForOpinionPage() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCommentsForOpinion | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: commentsForOpinion, isLoading, isError } = useCommentsForOpinionQuery()
  const { mutate: addMutation } = useCommentsForOpinionAddMutation()
  const { mutate: updateMutation } = useCommentsForOpinionUpdateMutation()
  const { mutate: deleteMutation, isPending: isDeleting } = useCommentsForOpinionDeleteMutation()

  const columns = useMemo<ColumnDef<TCommentsForOpinion>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name', { ns: 'commentsForOpinion' }),
        enableSorting: true,
        enableHiding: false,
        size: 300,
        minSize: 200,
        maxSize: 500,
      },
      {
        id: 'actions',
        header: t('actions', { ns: 'commentsForOpinion' }),
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

  const onSubmit = (data: TCommentsForOpinion) => {
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
            {t('title', { ns: 'commentsForOpinion' })}
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
          tableName='commentsForOpinion'
          data={commentsForOpinion ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          hidePagination={true}
          globalFilterFn={(row, _columnId, filterValue) => {
            const nameMatch = row.original.name?.toString().toLowerCase().includes(filterValue.toLowerCase()) || false
            return nameMatch
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
        <CommentsForOpinionForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )

}