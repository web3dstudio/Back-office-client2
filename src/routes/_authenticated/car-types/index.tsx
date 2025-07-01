import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import { Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  useCarTypeDeleteMutation,
  useCarTypesQuery,
} from '../../../query/carTypes.query'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'
import { Clear, Edit } from '@mui/icons-material'
import DelDialogModal from '../../../components/AppDialog/AppConfirmDialog'
import type { TCarType } from '../../../types'
import AddCarTypeModal from '../../../components/CarType/AddCarTypeModal'
import EditCarTypeModal from '../../../components/CarType/EditCarTypeModal'
import AppDataGrid from '../../../components/AppDataGrid'
import AppError from '../../../components/AppError'
import { usePriceListTypesQuery } from '../../../query/priceListTypes.querty'

export const Route = createFileRoute('/_authenticated/car-types/')({
  component: CarTypes,
})

function CarTypes() {
  const { t } = useTranslation('carTypes')
  const { t: tCommon } = useTranslation('common')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [selectedCarType, setSelectedCarType] = useState<TCarType | null>(null)

  const {
    data: carTypesData,
    isLoading: carTypesIsLoadind,
    isError: carTypesIsError,
  } = useCarTypesQuery()

  const rows = carTypesData as TCarType[]
  const { } = usePriceListTypesQuery()

  const { mutate: carTypeDeleteMutation, isPending: carTypeDeleteIsPending } =
    useCarTypeDeleteMutation()

  const columns = useMemo<GridColDef<TCarType>[]>(() => {
    return [
      {
        field: 'name',
        headerName: t('carType'),
        hideable: false,
        type: 'string',
        flex: 1,
      },
      {
        field: 'carTypeID',
        headerName: 'ID',
        hideable: true,
        type: 'string',
        flex: 1,
      },
      {
        field: 'priceListType',
        headerName: t('priceListType'),
        hideable: true,
        type: 'string',
        flex: 1,
        valueGetter: (_data, row) => row.priceListType?.name,
      },
      {
        field: 'icon',
        headerName: t('icon'),
        hideable: true,
        sortable: false,
        filterable: false,
        type: 'string',
        width: 100,
      },
      {
        field: 'edit',
        headerName: t('edit'),
        hideable: false,
        sortable: false,
        filterable: false,
        type: 'actions',
        width: 30,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Edit color='primary' />}
            label={t('edit')}
            onClick={() => {
              setSelectedCarType(params.row)
              setEditOpen(true)
            }}
          />,
        ],
      },
      {
        field: 'delete',
        headerName: t('delete'),
        hideable: false,
        sortable: false,
        filterable: false,
        type: 'actions',
        width: 70,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<Clear color='error' />}
            label={t('delete')}
            onClick={() => {
              setSelectedCarType(params.row)
              setDeleteOpen(true)
            }}
          />,
        ],
      },
    ]
  }, [])

  const deleteCarType = async () => {
    carTypeDeleteMutation(selectedCarType?.id as string, {
      onSuccess: () => {
        setDeleteOpen(false)
        setSelectedCarType(null)
      },
    })
  }

  if (carTypesIsError && !carTypesIsLoadind) {
    return <AppError />
  }

  return (
    <>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 3 }}>
        {t('title')}
      </Typography>

      <Button variant='contained' onClick={() => setAddOpen(true)}>
        {tCommon('modals.addCarType')}
      </Button>

      <StyledPaper sx={{ mt: 3 }}>
        <AppDataGrid
          columns={columns}
          rows={rows}
          tableName='carTypes'
          isLoading={false}
        />
      </StyledPaper>

      <DelDialogModal
        isPending={carTypeDeleteIsPending}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSubmit={deleteCarType}
        title={tCommon('modals.approveDelete')}
      />

      <AddCarTypeModal
        onClose={() => setAddOpen(false)}
        open={addOpen}
      />

      {selectedCarType && (
        <EditCarTypeModal
          data={selectedCarType}
          onClose={() => setEditOpen(false)}
          open={editOpen}
        />
      )}
    </>
  )
}
