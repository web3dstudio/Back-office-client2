import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRenderCellParams, type GridSortModel } from '@mui/x-data-grid';
import { useDeletePriceListMutation, usePriceListsQuery } from '../../../query/priceList.query';
import { usePriceListTypesQuery } from '../../../query/priceListTypes.querty';
import AppActionButton from '../../../components/AppActionButton';
import type { TPriceList } from '../../../types';
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat';
import { Box, Grid, Typography } from '@mui/material';
import AppBackBtn from '../../../components/AppBackBtn';
import StyledPaper from '../../../components/StyledPaper';
import PriceListForm from '../../../components/PriceList/PriceListForm';
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog';

export const Route = createFileRoute('/_authenticated/price-list/')({
  component: PriceListPage,
})


function PriceListPage() {
  const { t } = useTranslation()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selected, setSelected] = useState<TPriceList | null>(null)
  const dateTimeFormat = useDateTimeFormat()

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useLocalStorage('priceListTable', {});

  const { data: priceListTypes } = usePriceListTypesQuery()
  const { data: priceLists, isLoading } = usePriceListsQuery(paginationModel.page, {}, sortModel)
  const { mutate: deletePriceList, isPending: isDeleting } = useDeletePriceListMutation()

  const columns = [

    {
      field: 'date',
      headerName: t('date', { ns: 'priceList' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TPriceList) => dateTimeFormat(row.date),
    },
    {
      field: 'priceListType',
      headerName: t('priceListType', { ns: 'priceList' }),
      editable: false,
      sortable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TPriceList) => priceListTypes?.find(type => type.id === row.priceListType)?.name,
    },

    {
      field: 'carTypes',
      headerName: t('carTypes', { ns: 'priceList' }),
      editable: false,
      sortable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value: any, row: TPriceList) => row.carTypes.map(type => type?.name).join(', '),
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      hideable: false,
      sortable: false,
      getActions: (params: GridRenderCellParams) => [
        <AppActionButton type='view' onClick={() => {
          // navigate({ to: '/customers/$id', params: { id: params.row.id } })
        }} />,
        <AppActionButton type='download' onClick={() => {
          // navigate({
          //   to: '/customers/new',
          //   search: { duplicateId: params.row.id }
          // })
        }} />,
        <AppActionButton
          type='delete'
          onClick={() => {
            setSelected(() => params.row)
            setOpenConfirmDialog(true)
          }}
        />
      ],
    },
  ]

  const handleDeletePriceList = () => {
    if (selected) {
      deletePriceList(selected.id, {
        onSuccess: () => {
          setOpenConfirmDialog(false)
          setSelected(null)
        }
      })
    }
  }

  return (<>
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('title', { ns: 'priceList' })}
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>
      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
        display: 'flex',
        gap: 2,
      }}>
        <PriceListForm />
      </StyledPaper>

      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <DataGrid
          rows={priceLists?.data ?? []}
          columns={columns as GridColDef<TPriceList>[]}
          rowCount={priceLists?.totalRowsNumber ?? 0}
          loading={isLoading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          sortingMode="server"
          sortModel={sortModel}
          disableColumnMenu
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => {
            setColumnVisibilityModel(newModel);
          }}
          onSortModelChange={(model: GridSortModel) => {
            setSortModel(model)
          }}
          onPaginationModelChange={(model: GridPaginationModel) => {
            setPaginationModel(model)
          }}
          getRowId={(row) => row.id}
          pageSizeOptions={[20]}
          sx={{
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#f5f5f5',
            },
          }}
          showToolbar
        />
      </StyledPaper>
    </Grid>

    <AppConfirmDialog
      open={openConfirmDialog}
      onClose={() => setOpenConfirmDialog(false)}
      onSubmit={handleDeletePriceList}
      title={t('modals.approveDelete', { ns: 'common' })}
      isPending={isDeleting}
    />
  </>)
}




