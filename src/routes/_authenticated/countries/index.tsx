import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { TCountry } from '../../../types'
import { useCountriesAddMutation, useCountriesDeleteMutation, useCountriesQuery, useCountriesUpdateMutation } from '../../../query/countries.query'
import { type ColumnDef } from '@tanstack/react-table'
import { type SortingState } from '@tanstack/react-table'
import AppActionButton from '../../../components/AppActionButton'
import { Box, Button, Grid, Typography } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import AppError from '../../../components/AppError'
import AppDataTable from '../../../components/AppDataTable'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppDialog from '../../../components/AppDialog/AppDialog'
import StyledPaper from '../../../components/StyledPaper'
import CountryForm from '../../../components/Countries/CountryForm'

export const Route = createFileRoute('/_authenticated/countries/')({
  component: Countries,
})

function Countries() {
  const { t } = useTranslation()
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TCountry | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])


  const { data: countries, isLoading, isError } = useCountriesQuery()

  const { mutate: addMutation } = useCountriesAddMutation()
  const { mutate: updateMutation } = useCountriesUpdateMutation()
  const { mutate: deleteMutation } = useCountriesDeleteMutation()

  const columns = useMemo<ColumnDef<TCountry>[]>(() => [
    {
      accessorKey: 'name',
      header: t('name', { ns: 'countries' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'nameEn',
      header: t('nameEn', { ns: 'countries' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: t('actions', { ns: 'countries' }),
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      meta: {
        align: 'right'
      },
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'end' }}>
          <AppActionButton type='edit' onClick={() => {
            console.log('params.row', row.original)
            setSelected(row.original)
            setOpenFormDialog(true)
          }} />
          <AppActionButton type='delete' onClick={() => {
            setSelected(row.original)
            setOpenConfirmDialog(true)
          }} />
        </Box>
      ),
    }
  ], [t])

  const onSubmit = (data: TCountry) => {
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
            {t('title', { ns: 'countries' })}
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
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
          maxWidth: '100%',
        }}
      >
        <AppDataTable
          tableName='countries'
          data={countries ?? []}
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
        <CountryForm
          data={selected}
          isPending={false}
          onCancel={() => setOpenFormDialog(false)}
          onConfirm={(data) => onSubmit(data)}
        />
      </AppDialog>
    </Grid>
  )
}