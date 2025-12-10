import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography, Button, TextField, Autocomplete } from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import AppDataTable from '../../../components/AppDataTable'
import { useCodesFromApiQuery, useCodesSyncQuery, useCodeAddMutation, useCodeDeleteMutation } from '../../../query/codesFromApi.query'
import { useManufacturersWithSeriesAndModelsQuery } from '../../../query/manufacturers.query'
import { useCarTypesQuery } from '../../../query/carTypes.query'
import { useChassisQuery } from '../../../query/chassis.query'
import type { TCodeFromApi } from '../../../types'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/_authenticated/codes/sync')({
  component: SyncPage,
})

type YearOption = {
  id: string
  name: string
}

function SyncPage() {
  const { t } = useTranslation()
  const [years, setYears] = useState<YearOption[]>([])
  const [selectedYears, setSelectedYears] = useState<YearOption[]>([])
  const [rows, setRows] = useState<TCodeFromApi[]>([])

  const { data: codesData, isLoading: codesIsLoading } = useCodesFromApiQuery()
  const { data: manufacturers } = useManufacturersWithSeriesAndModelsQuery()
  const { data: carTypes } = useCarTypesQuery()
  const { data: chassisList } = useChassisQuery()

  const selectedYearsNames = useMemo(() => selectedYears.map(y => y.name), [selectedYears])
  const { data: syncData, refetch: syncRefetch } = useCodesSyncQuery(selectedYearsNames)
  const { mutate: codeAddMutation } = useCodeAddMutation()
  const { mutate: codeDeleteMutation } = useCodeDeleteMutation()
  const { t: tNotifications } = useTranslation('notifications')
  const processedSyncDataRef = useRef<typeof syncData>(undefined)

  useEffect(() => {
    const start = 1995
    const end = new Date().getFullYear() + 1
    const range = Array.from({ length: end - start + 1 }, (_, i) => end - i)
    const object = range.map(i => ({ id: i.toString(), name: i.toString() }))
    setYears(object)
  }, [])

  useEffect(() => {
    if (codesData && manufacturers) {
      setRows(
        codesData.map(row => {
          if (row.manufacturerId && row.seriesId) return row

          const manufacturer = manufacturers.find(m =>
            m.serieses?.some(s => s.models?.some(mdl => mdl.id === row.modelId))
          )
          if (!manufacturer) return row

          const series = manufacturer.serieses?.find(s =>
            s.models?.some(mdl => mdl.id === row.modelId)
          )
          if (!series) return row

          return {
            ...row,
            manufacturerId: manufacturer.id,
            seriesId: series.id,
          }
        })
      )
    }
  }, [codesData, manufacturers])

  useEffect(() => {
    if (syncData && processedSyncDataRef.current !== syncData) {
      processedSyncDataRef.current = syncData
      toast.success(tNotifications('codes_sync_successfully'))
    }
  }, [syncData, tNotifications])

  const generateModelDescription = (row: TCodeFromApi): string => {
    const transmission = row.automaticTransmission ? 'Automatic' : ''
    const serieName = row.serieName ?? ''
    const modelName = row.modelName ?? ''
    const engineCapacity = row.engineCapacity > 0 ? row.engineCapacity + 'cC' : ''
    const horsepower = row.horsepower > 0 ? row.horsepower + 'ks' : ''
    const finishingLevel = row.finishingLevel ?? ''

    return `${serieName} ${modelName} ${engineCapacity} ${horsepower} ${transmission} ${finishingLevel}`.trim()
  }

  const getNewCodes = () => {
    syncRefetch()
  }

  const addCode = (data: TCodeFromApi) => {
    const newCode = {
      carTypeId: data.carTypeId || '',
      chassis: data.chassis,
      description: '',
      year: data.yearOfManufacture || 0,
      fromYear: data.fromYear || data.yearOfManufacture || 0,
      toYear: data.toYear || 0,
      innerCarTypeCode: `${data.manufacturerCode.padStart(5, '0')}-${data.modelCode.padStart(5, '0')}`,
      innerCode: data.innerCode || '',
      innerSubCode: data.modelType?.toLowerCase() || '',
      isAuto: data.automaticTransmission?.toString() || '0',
      manufacturerId: '',
      modelDescription: generateModelDescription(data),
      modelId: data.modelId || '',
    }
    codeAddMutation(newCode)
  }

  const removeCode = (codeId: string) => {
    codeDeleteMutation(codeId)
  }

  const columns = useMemo<ColumnDef<TCodeFromApi>[]>(() => [
    {
      accessorKey: 'manufacturerCode',
      header: t('tozeretCd', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'modelCode',
      header: t('degemCd', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'yearOfManufacture',
      header: t('year', { ns: 'codes' }),
      size: 100,
    },
    {
      accessorKey: 'automaticTransmission',
      header: t('isAuto', { ns: 'codes' }),
      size: 100,
      cell: ({ row }) => row.original.automaticTransmission ? 'Yes' : 'No',
    },
    {
      accessorKey: 'manufacturerName',
      header: t('manufacturerName', { ns: 'codes' }),
      size: 200,
      cell: ({ row }) => `${row.original.manufacturerName} ${row.original.country}`,
    },
    {
      accessorKey: 'description',
      header: t('modelName', { ns: 'codes' }),
      size: 300,
      cell: ({ row }) => generateModelDescription(row.original),
    },
    {
      accessorKey: 'modelType',
      header: t('sugDegem', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'manufacturerId',
      header: t('manufacturerName', { ns: 'codes' }),
      size: 200,
      cell: ({ row }) => {
        const manufacturer = manufacturers?.find(m => m.id === row.original.manufacturerId)
        return manufacturer?.name || ''
      },
    },
    {
      accessorKey: 'seriesId',
      header: t('series', { ns: 'newCode' }),
      size: 200,
      cell: ({ row }) => {
        const manufacturer = manufacturers?.find(m => m.id === row.original.manufacturerId)
        const series = manufacturer?.serieses?.find(s => s.id === row.original.seriesId)
        return series?.name || ''
      },
    },
    {
      accessorKey: 'modelId',
      header: t('modelName', { ns: 'codes' }),
      size: 200,
      cell: ({ row }) => {
        const manufacturer = manufacturers?.find(m => m.id === row.original.manufacturerId)
        const series = manufacturer?.serieses?.find(s => s.id === row.original.seriesId)
        const model = series?.models?.find(m => m.id === row.original.modelId)
        return model?.name || ''
      },
    },
    {
      accessorKey: 'carTypeId',
      header: t('carType', { ns: 'codes' }),
      size: 150,
      cell: ({ row }) => {
        const selectedCarType = carTypes?.find(option => option.id === row.original.carTypeId)
        return selectedCarType?.name || ''
      },
    },
    {
      accessorKey: 'chassis',
      header: t('chassis', { ns: 'codes' }),
      size: 150,
      cell: ({ row }) => {
        const selectedChassis = chassisList?.find(option => option.id === row.original.chassis)
        return selectedChassis?.name || ''
      },
    },
    {
      accessorKey: 'bodyType',
      header: t('bodyType', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'innerCode',
      header: t('innerCode', { ns: 'newCode' }),
      size: 120,
    },
    {
      accessorKey: 'fromYear',
      header: t('fromYear', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => {
        return row.original.fromYear || row.original.yearOfManufacture || ''
      },
    },
    {
      accessorKey: 'toYear',
      header: t('toYear', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => {
        return row.original.toYear || ''
      },
    },
    {
      id: 'actions',
      header: t('actions', { ns: 'common' }),
      size: 120,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        return (
          <Button
            disabled={!hasCodeId ? (!row.original.innerCode || !row.original.modelId || !row.original.carTypeId) : false}
            variant="outlined"
            color={hasCodeId ? 'secondary' : 'primary'}
            size="small"
            fullWidth
            onClick={() => hasCodeId ? removeCode(row.original.codeId) : addCode(row.original)}
          >
            {hasCodeId ? t('remove', { ns: 'common' }) : t('add', { ns: 'common' })}
          </Button>
        )
      },
    },
  ], [manufacturers, carTypes, chassisList, t])

  return (
    <Grid container spacing={3}>
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
            {t('assignments', { ns: 'codes' })}
          </Typography>
        </Box>
      </Grid>

      <StyledPaper sx={{
        borderRadius: '24px',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
      }}>
        <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 3 }}>
          <Grid size={4}>
            <Typography sx={{ mb: 1 }}>{t('year', { ns: 'codes' })}</Typography>
            <Autocomplete
              multiple
              options={years}
              getOptionLabel={(option) => option.name}
              value={selectedYears}
              onChange={(_, data) => setSelectedYears(data)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" size="small" />
              )}
            />
          </Grid>
          <Grid size={2}>
            <Button
              disabled={selectedYears.length === 0}
              onClick={getNewCodes}
              variant="contained"
              fullWidth
            >
              {t('import', { ns: 'codes' })}
            </Button>
          </Grid>
        </Grid>

        <AppDataTable
          tableName="codesFromApi"
          data={rows}
          columns={columns}
          isLoading={codesIsLoading}
        />
      </StyledPaper>
    </Grid>
  )
}
