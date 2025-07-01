import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type GridColDef,
  type GridRowId,
} from '@mui/x-data-grid'
import {
  useImportNewModelsMutation,
  useNewModelsQuery,
} from '../../../../query/newModels.query'
import type { TNewModel } from '../../../../types'
import StyledPaper from '../../../../components/StyledPaper'
import AppError from '../../../../components/AppError'
import Grid from '@mui/material/Grid'
import AppDataGrid from '../../../../components/AppDataGrid'


export const Route = createFileRoute('/_authenticated/models/sync/')({
  component: ModelsSyncPage,
})

function ModelsSyncPage() {
  const { t } = useTranslation()
  const theme = useTheme()

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from(
      { length: currentYear - 1996 + 1 },
      (_, index) => 1996 + index
    ).reverse()
  }, [])

  const [selectedYears, setSelectedYears] = useState<number[]>([])

  const {
    data: newModels,
    isLoading: newModelsIsLoading,
    isError: newModelsIsError,
    refetch: refetchNemModels,
  } = useNewModelsQuery(selectedYears)

  const getNewModels = () => {
    refetchNemModels()
  }

  const columns = useMemo<GridColDef<TNewModel>[]>(() => {
    return [
      {
        field: 'id',
        headerName: t('id', { ns: 'syncModels' }),
        editable: false,
        hideable: false,
        type: 'string',
        flex: 1,
      },
      {
        field: 'tozar',
        headerName: t('tozar', { ns: 'syncModels' }),
        editable: false,
        hideable: false,
        type: 'string',
        flex: 1,
      },
      {
        field: 'kinuyMishari',
        headerName: t('kinuyMishari', { ns: 'syncModels' }),
        editable: false,
        hideable: false,
        type: 'string',
        flex: 1,
      },
      {
        field: 'ramatGimur',
        headerName: t('ramatGimur', { ns: 'syncModels' }),
        editable: false,
        hideable: true,
        type: 'string',
        flex: 1,
      },
      {
        field: 'shnatYitzur',
        headerName: t('year', { ns: 'syncModels' }),
        editable: false,
        hideable: true,
        type: 'string',
        flex: 1,
      },
      {
        field: 'degemNm',
        headerName: t('degemNm', { ns: 'syncModels' }),
        editable: false,
        hideable: true,
        type: 'string',
        flex: 1,
      },
      {
        field: 'innerCarTypeCode',
        headerName: t('innerCarTypeCode'),
        type: 'string',
        flex: 1,
        editable: false,
        hideable: true,
        valueGetter: (_value, row) => {
          let tozeret_cd = row.tozeretCd.toString()
          let degem_cd = row.degemCd.toString()
          for (let i = 0; i < 6; i++) {
            if (tozeret_cd.length < 5) tozeret_cd = '0' + tozeret_cd
            if (degem_cd.length < 5) degem_cd = '0' + degem_cd
          }
          return tozeret_cd + '-' + degem_cd
        },
      },
      {
        field: 'tozeretCd',
        headerName: t('tozeretCd', { ns: 'syncModels' }),
        editable: false,
        hideable: true,
        type: 'string',
        flex: 1,
      },
      {
        field: 'degemCd',
        headerName: t('degemCd', { ns: 'syncModels' }),
        editable: false,
        hideable: true,
        type: 'string',
        flex: 1,
      },

      {
        field: 'sugDegem',
        headerName: t('sugDegem', { ns: 'syncModels' }),
        editable: false,
        hideable: true,
        type: 'string',
        flex: 1,
      },
    ]
  }, [t])

  const [selectedIds, setSelectedIds] = useState<GridRowId[]>([])
  const { mutate, isPending } = useImportNewModelsMutation()
  const addSelectedModels = () => {
    if (selectedIds.length > 0) {
      mutate({ ids: selectedIds } as { ids: number[] })
    }
  }

  if (newModelsIsError) return <AppError />

  return (
    <>
      <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 3 }}>
        {t('title', { ns: 'syncModels' })}
      </Typography>

      <Grid container columns={{ xs: 9 }} spacing={1}>
        <Grid size={{ xs: 'grow' }} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'end' }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              id='years'
              size='small'
              options={years}
              getOptionLabel={(option) => option.toString()}
              onChange={(_, data) => {
                setSelectedYears(data)
              }}
              filterSelectedOptions
              renderInput={(params) => (
                <FormControl fullWidth variant='outlined' size='small'>
                  <InputLabel shrink sx={{ fontSize: '20px' }}>
                    {t('selectYears')}
                  </InputLabel>
                  <TextField
                    {...params}
                    sx={{
                      minWidth: 400,
                      '& .MuiOutlinedInput-root': {
                        'label + &': {
                          marginTop: theme.spacing(2),
                        },
                      },
                    }}
                  />
                </FormControl>
              )}
            />
            <Button variant='contained' onClick={getNewModels}>
              {t('getNewModels', { ns: 'syncModels' })}
            </Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 'auto' }}>
          <Button
            loading={isPending}
            sx={{ mt: 2 }}
            disabled={selectedIds.length === 0}
            variant='contained'
            onClick={addSelectedModels}
          >
            {t('import', { ns: 'syncModels' })}
          </Button>
        </Grid>
      </Grid>

      <StyledPaper sx={{ mt: 3, display: 'flex', flexDirection: 'column' }}>
        <AppDataGrid
          tableName='newModelsTable'
          rows={newModels || []}
          columns={columns as GridColDef<TNewModel>[]}
          isLoading={newModelsIsLoading}
          checkboxSelection={true}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setSelectedIds([...newRowSelectionModel])
          }}
        />
      </StyledPaper>
    </>
  )
}
