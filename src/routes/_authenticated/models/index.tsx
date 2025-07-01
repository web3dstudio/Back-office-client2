import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  useModelPatchMutation,
  useModelsQuery,
} from '../../../query/models.query'
import {
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import AppDataGrid from '../../../components/AppDataGrid'
import type { TModel } from '../../../types'
import { useEffect, useState } from 'react'
import {
  GridActionsCellItem,
  type GridColDef,
  type GridRowId,
  type GridRowModesModel,
  GridRowModes,
  type GridEventListener,
  type GridRowModel,
  GridRowEditStopReasons,
  type GridRowClassNameParams,
  type GridRenderEditCellParams,
} from '@mui/x-data-grid'
import { Cancel, Edit, Save } from '@mui/icons-material'
import { useCarTypesQuery } from '../../../query/carTypes.query'

export const Route = createFileRoute('/_authenticated/models/')({
  component: ModelsPage,
})

function ModelsPage() {
  const { t } = useTranslation()
  const theme = useTheme()

  const {
    data: modelsData,
    isLoading: modelsIsLoading,
    // isError: modelsIsError,
  } = useModelsQuery()

  const {
    data: carTypesData,
    // isLoading: carTypesIsLoading,
    // isError: carTypesIsError,
  } = useCarTypesQuery()

  const [rows, setRows] = useState<TModel[]>([])

  useEffect(() => {
    setRows(modelsData as TModel[])
  }, [modelsData])

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({})

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    })
  }

  const columns: GridColDef<TModel>[] = [
    {
      field: 'manufacturerCode',
      headerName: t('manufacturerCode', { ns: 'models' }),
      editable: false,
      hideable: false,
      type: 'number',
      flex: 0,
    },
    {
      field: 'modelCode',
      headerName: t('modelCode', { ns: 'models' }),
      editable: false,
      hideable: false,
      type: 'number',
      flex: 0,
    },
    {
      field: 'yearOfManufacture',
      headerName: t('yearOfManufacture', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'manufacturerName',
      headerName: t('manufacturer', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value, row) => row.manufacturerName,
    },
    {
      field: 'serieName',
      headerName: t('serie', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value, row) => row.serieName,
    },
    {
      field: 'country',
      headerName: t('country', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value, row) => row.manufacturerCountry,
    },
    {
      field: 'finishingLevel',
      headerName: t('finishingLevel', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'name',
      headerName: t('modelName', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'modelType',
      headerName: t('modelType', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'engineCapacity',
      headerName: t('engineCapacity', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'horsepower',
      headerName: t('horsepower', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'fuelType',
      headerName: t('fuelType', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value, row) => row?.fuelType?.name,
    },
    {
      field: 'automaticTransmission',
      headerName: t('automaticTransmission', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'number',
      flex: 1
    },
    {
      field: 'driveTechnology',
      headerName: t('driveTechnology', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value, row) => row?.driveTechnology?.name,
    },
    {
      field: 'bodyType',
      headerName: t('bodyType', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
    },
    {
      field: 'driveType',
      headerName: t('driveType', { ns: 'models' }),
      editable: false,
      hideable: true,
      type: 'string',
      flex: 1,
      valueGetter: (_value, row) => row?.driveType?.name,
    },

    {
      field: 'carType',
      headerName: t('carType', { ns: 'models' }),
      editable: true,
      hideable: true,
      type: 'singleSelect',
      flex: 1,
      cellClassName: 'highlight-column',
      valueOptions:
        carTypesData?.map((carType) => ({
          value: carType.id,
          label: carType.name,
        })) || [],
      renderCell: (params) => params.row.carType?.name,
      renderEditCell: (params: GridRenderEditCellParams) => {
        const { id, value, api } = params

        // Обработчик для изменения значения
        const handleChange = (event: SelectChangeEvent) => {
          const selectedCarType = carTypesData?.find(
            (carType) => carType.id === event.target.value
          )

          // Обновляем значение через DataGrid API
          api.setEditCellValue({ id, field: 'carType', value: selectedCarType })
        }

        return (
          <Select
            value={value?.id || ''} // Выбираем id текущего значения
            onChange={handleChange}
            fullWidth
            sx={{
              '&.MuiOutlinedInput-root': {
                borderRadius: '0px',
                paddingInlineStart: '8px',
                paddingInlineEnd: '8px',
                backgroundColor: 'transparent',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
                outline: 'none'
              },
            }}
          >
            {carTypesData?.map((carType) => (
              <MenuItem key={carType.id} value={carType.id}>
                {carType.name}
              </MenuItem>
            ))}
          </Select>
        )
      },
    },
    {
      field: 'innerCode',
      headerName: t('innerCode', { ns: 'models' }),
      editable: true,
      hideable: true,
      type: 'string',
      flex: 1,
      cellClassName: 'highlight-column',
    },
    {
      field: 'fromYear',
      headerName: t('fromYear', { ns: 'models' }),
      editable: true,
      hideable: true,
      type: 'string',
      flex: 1,
      cellClassName: 'highlight-column',
    },
    {
      field: 'toYear',
      headerName: t('toYear', { ns: 'models' }),
      editable: true,
      hideable: true,
      type: 'string',
      flex: 1,
      cellClassName: 'highlight-column',
    },
    {
      field: 'basePrice',
      headerName: t('basePrice', { ns: 'models' }),
      editable: true,
      hideable: true,
      type: 'string',
      flex: 1,
      cellClassName: 'highlight-column',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      hideable: false,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<Save />}
              label='Save'
              color='primary'
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<Cancel />}
              label='Cancel'
              className='textPrimary'
              onClick={handleCancelClick(id)}
              color='inherit'
            />,
          ]
        }

        return [
          <GridActionsCellItem
            icon={<Edit />}
            label='Edit'
            className='textPrimary'
            onClick={handleEditClick(id)}
            color='inherit'
          />,
        ]
      },
    },
  ]

  const customStyles = {
    '.internalData': {
      backgroundColor: `${theme.palette.primary.main}20`,
      fontWeight: 'bold',
    },
    '.highlight-column': {
      backgroundColor: `${theme.palette.primary.main}20`,
    },
    '.highlight-row': {
      backgroundColor: `${theme.palette.error.main}20`,
    },
  }

  const columnGroupingModel = [
    {
      groupId: 'externalData',
      children: [
        { field: 'manufacturerCode' },
        { field: 'modelCode' },
        { field: 'yearOfManufacture' },
        { field: 'manufacturerName' },
        { field: 'serieName' },
        { field: 'country' },
        { field: 'finishingLevel' },
        { field: 'name' },
        { field: 'engineCapacity' },
        { field: 'horsepower' },
        { field: 'fuelType' },
        { field: 'driveTechnology' },
        { field: 'bodyType' },
        { field: 'driveType' },
      ],
    },
    {
      groupId: 'internalData',
      children: [
        { field: 'innerCode' },
        { field: 'carTypeId' },
        { field: 'fromYear' },
        { field: 'toYear' },
        { field: 'basePrice' },
      ],
      headerClassName: 'internalData',
    },
  ]

  const { mutate } = useModelPatchMutation()

  const processRowUpdate = (newRow: GridRowModel<TModel>) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === newRow.id ? { ...row, ...newRow } : row
      )
    )

    mutate({
      id: newRow.id,
      params: {
        innerCode: newRow.innerCode,
        fromYear: newRow.fromYear,
        toYear: newRow.toYear,
        basePrice: newRow.basePrice,
        carType: newRow.carType,
      },
    })

    return { ...newRow }
  }

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const getRowClassName = (params: GridRowClassNameParams) => {
    return !params.row?.innerCode ? 'highlight-row' : ''
  }

  return (
    <>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 3 }}>
        {t('title', { ns: 'models' })}
      </Typography>
      <StyledPaper sx={{ mt: 3, display: 'flex', flexDirection: 'column' }}>
        <AppDataGrid
          tableName='modelsTable'
          rows={rows}
          columns={columns as GridColDef<TModel>[]}
          editMode='row'
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          isLoading={modelsIsLoading}
          columnGroupingModel={columnGroupingModel}
          sx={customStyles}
          getRowClassName={getRowClassName}
        />
      </StyledPaper>
    </>
  )
}
