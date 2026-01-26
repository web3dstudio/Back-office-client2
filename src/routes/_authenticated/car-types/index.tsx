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
import { type ColumnDef } from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import type { TCarType, TPriceListType } from '../../../types'
import AppDataTable from '../../../components/AppDataTable'
import { type SortingState } from '@tanstack/react-table'
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
  const [sorting, setSorting] = useState<SortingState>([])

  useIconsQuery()

  const { data: carTypes, isLoading, isError } = useCarTypesQuery()
  usePriceListTypesQuery()
  const { data: priceListTypesList } = usePriceListTypesQuery()


  const { mutate: addMutation } = useCarTypesAddMutation()
  const { mutate: updateMutation } = useCarTypesUpdateMutation()
  const { mutate: deleteMutation } = useCarTypesDeleteMutation()

  const columns = useMemo<ColumnDef<TCarType>[]>(() => [
    {
      accessorKey: 'icon',
      header: t('icon', { ns: 'carTypes' }) || 'Icon',
      enableSorting: false,
      enableHiding: true,
      size: 60,
      cell: ({ row }) => {
        const icon = row.original.icon;
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
      accessorKey: 'name',
      header: t('name', { ns: 'carTypes' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'nameEn',
      header: t('nameEn', { ns: 'carTypes' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'carTypeID',
      header: t('carTypeID', { ns: 'carTypes' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'code',
      header: t('code', { ns: 'carTypes' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'licenseType',
      header: t('licenseType', { ns: 'carTypes' }),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'priceListType',
      header: t('priceListType', { ns: 'carTypes' }),
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => {
        return priceListTypesList?.find(type => String(type?.id) === String(row.original?.priceListType))?.name
      }
    },
    {
      id: 'actions',
      header: 'Actions',
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
  ], [t, priceListTypesList])

  const onSubmit = (data: Omit<TCarType, 'priceListType'> & { priceListType: TPriceListType | null }) => {
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
          maxWidth: '100%',
        }}
      >
        <AppDataTable
          tableName='carTypes'
          data={carTypes ?? []}
          columns={columns}
          isLoading={isLoading}
          manualPagination={false}
          sorting={sorting}
          onSortingChange={setSorting}
          initialColumnVisibility={{
            iconId: false,
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
          onConfirm={(data) => onSubmit(data as Omit<TCarType, 'priceListType'> & { priceListType: TPriceListType | null })}
        />
      </AppDialog>
    </Grid>
  )
}
