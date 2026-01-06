import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography, Button, TextField, Autocomplete, Select, MenuItem, FormControl } from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import SyncTable from '../../../components/Codes/SyncTable'
import { useCodesFromApiQuery, useCodesSyncQuery, useCodeAddMutation, useCodeDeleteMutation } from '../../../query/codesFromApi.query'
import { useManufacturersWithSeriesAndModelsQuery } from '../../../query/manufacturers.query'
import { useCarTypesQuery } from '../../../query/carTypes.query'
import { useBodyTypesQuery } from '../../../query/bodyTypes.query'
import type { TCodeFromApi } from '../../../types'
import type { TCodeCreate } from '../../../query/codes.query'


export const Route = createFileRoute('/_authenticated/codes/sync')({
  component: SyncPage,
})

type YearOption = {
  id: string
  name: string
}

const DebouncedTextField = ({ value, onChange, debounce = 500, ...props }: { value: string, onChange: (value: string) => void, debounce?: number } & Omit<React.ComponentProps<typeof TextField>, 'onChange'>) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounce)

    return () => clearTimeout(timeout)
  }, [localValue, debounce, onChange, value])

  return (
    <TextField
      {...props}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      size="small"
      variant="standard"
      fullWidth
      sx={{
        '& .MuiInputBase-root': {
          fontSize: '0.875rem',
          '&:before': {
            display: 'none',
          },
          '&:after': {
            display: 'none',
          },
        },
      }}
    />
  )
}

// Memoized Select Components to prevent re-renders
const ManufacturerSelect = ({ row, manufacturers, setRows }: { row: TCodeFromApi, manufacturers: any[], setRows: React.Dispatch<React.SetStateAction<TCodeFromApi[]>> }) => {
  const selectedManufacturer = useMemo(
    () => manufacturers?.find(m => m.id === row.manufacturerId) || null,
    [manufacturers, row.manufacturerId]
  )

  const handleChange = useCallback((_: any, newValue: any | null) => {
    const newId = newValue?.id ?? null
    setRows(prevRows =>
      prevRows.map(r =>
        r.id === row.id
          ? { ...r, manufacturerId: newId, seriesId: null, modelId: null }
          : r
      )
    )
  }, [row.id, setRows])

  return (
    <Autocomplete
      value={selectedManufacturer}
      onChange={handleChange}
      options={manufacturers || []}
      getOptionLabel={(option: any) => option?.name ?? ''}
      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
      disablePortal
      disableClearable
      fullWidth
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
              '&:before': { display: 'none' },
              '&:after': { display: 'none' },
            },
          }}
        />
      )}
    />
  )
}

const SeriesSelect = ({ row, manufacturers, setRows }: { row: TCodeFromApi, manufacturers: any[], setRows: React.Dispatch<React.SetStateAction<TCodeFromApi[]>> }) => {
  const manufacturer = useMemo(() => manufacturers?.find(m => m.id === row.manufacturerId), [manufacturers, row.manufacturerId])
  const serieses = manufacturer?.serieses || []

  const selectedSeries = useMemo(
    () => serieses?.find((s: any) => s.id === row.seriesId) || null,
    [serieses, row.seriesId]
  )

  const handleChange = useCallback((_: any, newValue: any | null) => {
    const newId = newValue?.id ?? null
    setRows(prevRows =>
      prevRows.map(r =>
        r.id === row.id
          ? { ...r, seriesId: newId, modelId: null }
          : r
      )
    )
  }, [row.id, setRows])

  return (
    <Autocomplete
      value={selectedSeries}
      onChange={handleChange}
      options={serieses || []}
      getOptionLabel={(option: any) => option?.name ?? ''}
      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
      disablePortal
      disableClearable
      disabled={!row.manufacturerId}
      fullWidth
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
              '&:before': { display: 'none' },
              '&:after': { display: 'none' },
            },
          }}
        />
      )}
    />
  )
}

const ModelSelect = ({ row, manufacturers, setRows }: { row: TCodeFromApi, manufacturers: any[], setRows: React.Dispatch<React.SetStateAction<TCodeFromApi[]>> }) => {
  const manufacturer = useMemo(() => manufacturers?.find(m => m.id === row.manufacturerId), [manufacturers, row.manufacturerId])
  const serie = useMemo(() => manufacturer?.serieses?.find((s: any) => s.id === row.seriesId), [manufacturer, row.seriesId])
  const models = serie?.models || []

  const selectedModel = useMemo(
    () => models?.find((m: any) => m.id === row.modelId) || null,
    [models, row.modelId]
  )

  const handleChange = useCallback((_: any, newValue: any | null) => {
    const newId = newValue?.id ?? null
    setRows(prevRows =>
      prevRows.map(r =>
        r.id === row.id
          ? { ...r, modelId: newId }
          : r
      )
    )
  }, [row.id, setRows])

  return (
    <Autocomplete
      value={selectedModel}
      onChange={handleChange}
      options={models || []}
      getOptionLabel={(option: any) => option?.name ?? ''}
      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
      disablePortal
      disableClearable
      disabled={!row.seriesId}
      fullWidth
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          sx={{
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
              '&:before': { display: 'none' },
              '&:after': { display: 'none' },
            },
          }}
        />
      )}
    />
  )
}

function SyncPage() {
  const { t, i18n } = useTranslation()
  const [years, setYears] = useState<YearOption[]>([])
  const [selectedYears, setSelectedYears] = useState<YearOption[]>([])
  const [rows, setRows] = useState<TCodeFromApi[]>([])

  const { data: codesData, isLoading: codesIsLoading } = useCodesFromApiQuery()
  const { data: manufacturers, isLoading: manufacturersIsLoading } = useManufacturersWithSeriesAndModelsQuery()
  const { data: carTypes, isLoading: carTypesIsLoading } = useCarTypesQuery()
  const { data: bodyTypes, isLoading: bodyTypesIsLoading } = useBodyTypesQuery()

  const isLoading = codesIsLoading || manufacturersIsLoading || carTypesIsLoading || bodyTypesIsLoading

  const selectedYearsNames = useMemo(() => selectedYears.map(y => y.name), [selectedYears])
  const { refetch: syncRefetch, isFetching: isSyncing } = useCodesSyncQuery(selectedYearsNames)

  useEffect(() => {
    const start = 1995
    const end = new Date().getFullYear() + 1
    const range = Array.from({ length: end - start + 1 }, (_, i) => end - i)
    const object = range.map(i => ({ id: i.toString(), name: i.toString() }))
    setYears(object)
  }, [])

  useEffect(() => {
    if (codesData) {
      setRows(codesData)
    }
  }, [codesData])


  const getNewCodes = () => {
    syncRefetch()
  }

  const generateModelDescription = (row: TCodeFromApi) => {
    const transmission = row.automaticTransmission ? 'Automatic' : ''
    const serieName = row.serieName ?? ''
    const modelName = row.modelName ?? ''
    const engineCapacity = row.engineCapacity > 0 ? row.engineCapacity + 'cC' : ''
    const horsepower = row.horsepower > 0 ? row.horsepower + 'ks' : ''
    const finishingLevel = row.finishingLevel ?? ''

    const description =
      serieName +
      ' ' +
      modelName +
      ' ' +
      engineCapacity +
      ' ' +
      horsepower +
      ' ' +
      transmission +
      ' ' +
      finishingLevel

    return description
  }

  const { mutate: addCodeMutation } = useCodeAddMutation()
  const { mutate: deleteCodeMutation } = useCodeDeleteMutation()

  const addCode = (row: TCodeFromApi) => {
    const payload: TCodeCreate = {
      carTypeId: row.carTypeId!,
      innerCarTypeCode: row.manufacturerCode.padStart(5, '0') + '-' + row.modelCode.padStart(5, '0'),
      manufacturerId: row.manufacturerId!,
      seriesId: row.seriesId!,
      modelId: row.modelId!,
      innerCode: row.innerCode!,
      innerSubCode: row.innerSubCode || '',
      isAuto: row.automaticTransmission ? '1' : '0',
      bodyTypeId: row.bodyTypeId!,
      // bodyTypeId: row.BodyTypeFromApi,
      year: row.yearOfManufacture,
      fromYear: row.fromYear || row.yearOfManufacture,
      toYear: row.toYear || row.yearOfManufacture,
      modelDescription: row.modelDescription || generateModelDescription(row),
      description: row.description || '',
      taxGroup: row.taxGroup ?? row.taxGroupFromApi,
    }

    addCodeMutation(payload, {
      onSuccess: (newCode) => {
        // syncRefetch()
        const manufacturer = manufacturers?.find(m => m.id === row.manufacturerId)
        const serie = manufacturer?.serieses?.find((s: any) => s.id === row.seriesId)
        const model = serie?.models?.find((m: any) => m.id === row.modelId)

        setRows(prevRows => prevRows.map(r =>
          r.id === row.id
            ? {
              ...r,
              codeId: newCode.id,
              systemManufacturerName: manufacturer?.name,
              systemSerieName: serie?.name,
              systemModelName: model?.name,
              modelDescription: row.modelDescription || generateModelDescription(row)
            }
            : r
        ))
      }
    })
  }

  const removeCode = (codeId: string) => {
    deleteCodeMutation(codeId, {
      onSuccess: () => {
        setRows(prevRows => prevRows.map(r =>
          r.codeId === codeId
            ? {
              ...r,
              codeId: '00000000-0000-0000-0000-000000000000',
              carTypeId: null,
              chassis: null,
              modelId: null,
              innerCode: null,
              seriesId: null,
              manufacturerId: null
            }
            : r
        ))
      }
    })
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
    },
    {
      accessorKey: 'modelName',
      header: t('modelName', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => generateModelDescription(row.original),
    },
    {
      accessorKey: 'taxGroupFromApi',
      header: t('taxGroupFromApi', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => row.original.taxGroupFromApi ?? '',
    },
    {
      accessorKey: 'modelType',
      header: t('sugDegem', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'bodyTypeFromApi',
      header: t('bodyType', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'manufacturerId',
      header: t('manufacturerName', { ns: 'codes' }),
      size: 200,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          return row.original.systemManufacturerName || row.original.manufacturerName || ''
        }
        return (
          <ManufacturerSelect row={row.original} manufacturers={manufacturers || []} setRows={setRows} />
        )
      },
    },
    {
      accessorKey: 'seriesId',
      header: t('series', { ns: 'newCode' }),
      size: 200,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          return row.original.systemSerieName || row.original.serieName || ''
        }

        return (
          <SeriesSelect row={row.original} manufacturers={manufacturers || []} setRows={setRows} />
        )
      },
    },
    {
      accessorKey: 'modelId',
      header: t('modelName', { ns: 'codes' }),
      size: 200,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          return row.original.systemModelName || row.original.modelName || ''
        }

        return (
          <ModelSelect row={row.original} manufacturers={manufacturers || []} setRows={setRows} />
        )
      },
    },
    {
      accessorKey: 'taxGroup',
      header: t('taxGroup', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          return row.original.taxGroup ?? ''
        }

        const defaultValue = row.original.taxGroup ?? row.original.taxGroupFromApi
        const value = defaultValue !== null && defaultValue !== undefined ? defaultValue.toString() : ''

        return (
          <FormControl size="small" fullWidth>
            <Select
              value={value}
              onChange={(e) => {
                const newValue = Number(e.target.value)
                setRows(prevRows =>
                  prevRows.map(r =>
                    r.id === row.original.id
                      ? { ...r, taxGroup: newValue }
                      : r
                  )
                )
              }}
              variant="standard"
              disableUnderline
              size='small'
              sx={{
                border: 'none',
                fontSize: '0.875rem',
                '&:before': {
                  display: 'none',
                },
                '&:after': {
                  display: 'none',
                },
              }}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={7}>7</MenuItem>
            </Select>
          </FormControl>
        )
      },
    },
    {
      accessorKey: 'carTypeId',
      header: t('carType', { ns: 'codes' }),
      size: 150,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          const carType = carTypes?.find(c => c.id === row.original.carTypeId)
          return carType?.name || ''
        }
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={row.original.carTypeId || ''}
              onChange={(e) => {
                const newValue = e.target.value as string
                setRows(prevRows =>
                  prevRows.map(r =>
                    r.id === row.original.id
                      ? { ...r, carTypeId: newValue || null }
                      : r
                  )
                )
              }}
              displayEmpty
              variant="standard"
              disableUnderline
              size='small'
              sx={{
                border: 'none',
                fontSize: '0.875rem',
                '&:before': {
                  display: 'none',
                },
                '&:after': {
                  display: 'none',
                },
              }}
              renderValue={(value) => {
                if (!value) return ''
                const carType = carTypes?.find(c => c.id === value)
                return carType?.name || ''
              }}
            >
              {carTypes?.map((carType) => (
                <MenuItem key={carType.id} value={carType.id}>
                  {carType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      },
    },
    {
      accessorKey: 'bodyTypeId',
      header: t('bodyType', { ns: 'codes' }),
      size: 150,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          const bodyType = bodyTypes?.find(bodyTypeOption => bodyTypeOption.id === row.original.bodyTypeId)
          if (!bodyType) return ''
          return i18n.language === 'en' ? (bodyType.nameEn || bodyType.name) : bodyType.name
        }

        const bodyTypeIdFromApi =
          bodyTypes?.find(bodyTypeOption => bodyTypeOption.name === row.original.bodyTypeFromApi)?.id ?? ''

        const selectValue = row.original.bodyTypeId ?? bodyTypeIdFromApi

        return (
          <FormControl size="small" fullWidth>
            <Select
              value={selectValue}
              onChange={(e) => {
                const newValue = e.target.value as string
                setRows(prevRows =>
                  prevRows.map(r =>
                    r.id === row.original.id
                      ? { ...r, bodyTypeId: newValue || null }
                      : r
                  )
                )
              }}
              displayEmpty
              variant="standard"
              disableUnderline
              size='small'
              sx={{
                border: 'none',
                fontSize: '0.875rem',
                '&:before': {
                  display: 'none',
                },
                '&:after': {
                  display: 'none',
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {bodyTypes?.map((bodyTypeOption) => (
                <MenuItem key={bodyTypeOption.id} value={bodyTypeOption.id}>
                  {i18n.language === 'en' ? (bodyTypeOption.nameEn || bodyTypeOption.name) : bodyTypeOption.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      },
    },
    {
      accessorKey: 'innerCode',
      header: t('innerCode', { ns: 'newCode' }),
      size: 120,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        const currentValue = row.original.innerCode ?? ''
        if (hasCodeId) {
          return currentValue
        }
        return (
          <DebouncedTextField
            value={currentValue}
            onChange={(value: string) => {
              setRows(prevRows =>
                prevRows.map(r =>
                  r.id === row.original.id
                    ? { ...r, innerCode: value || null }
                    : r
                )
              )
            }}
          />
        )
      },
    },
    {
      accessorKey: 'fromYear',
      header: t('fromYear', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          const defaultValue = row.original.fromYear || row.original.yearOfManufacture
          return defaultValue && defaultValue > 0 ? defaultValue.toString() : ''
        }
        const defaultValue = row.original.fromYear || row.original.yearOfManufacture
        const yearValue = defaultValue && defaultValue > 0 ? defaultValue.toString() : ''
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={yearValue}
              onChange={(e) => {
                const newValue = e.target.value ? Number(e.target.value) : null
                setRows(prevRows =>
                  prevRows.map(r =>
                    r.id === row.original.id
                      ? { ...r, fromYear: newValue || 0 }
                      : r
                  )
                )
              }}
              displayEmpty
              variant="standard"
              disableUnderline
              size='small'
              sx={{
                border: 'none',
                fontSize: '0.875rem',
                '&:before': {
                  display: 'none',
                },
                '&:after': {
                  display: 'none',
                },
              }}
            >
              {years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      },
    },
    {
      accessorKey: 'toYear',
      header: t('toYear', { ns: 'codes' }),
      size: 120,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          return row.original.toYear && row.original.toYear > 0 ? row.original.toYear.toString() : ''
        }
        const yearValue = row.original.toYear && row.original.toYear > 0 ? row.original.toYear.toString() : ''
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={yearValue}
              onChange={(e) => {
                const newValue = e.target.value ? Number(e.target.value) : null
                setRows(prevRows =>
                  prevRows.map(r =>
                    r.id === row.original.id
                      ? { ...r, toYear: newValue || 0 }
                      : r
                  )
                )
              }}
              displayEmpty
              variant="standard"
              disableUnderline
              size='small'
              sx={{
                border: 'none',
                fontSize: '0.875rem',
                '&:before': {
                  display: 'none',
                },
                '&:after': {
                  display: 'none',
                },
              }}
            >
              {years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      },
    },
    {
      id: 'actions',
      header: t('actions', { ns: 'codes' }),
      enableSorting: false,
      enableHiding: false,
      size: 90,
      minSize: 80,
      maxSize: 100,
      meta: { align: 'right' },
      cell: ({ row }) => {
        return !row.original.codeId ||
          row.original.codeId === '00000000-0000-0000-0000-000000000000'
          ? (
            <Button
              disabled={
                !row.original.innerCode
                || !row.original.manufacturerId
                || !row.original.seriesId
                || !row.original.modelId
                || !row.original.carTypeId
              }
              variant="text"
              color="primary"
              size="small"
              fullWidth
              onClick={() => addCode(row.original)}
            >
              {t('add', { ns: 'codes' })}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="text"
              color="error"
              size="small"
              onClick={() => removeCode(row.original.codeId)}
            >
              {t('remove', { ns: 'codes' })}
            </Button>
          )
      },
    },
  ], [carTypes, bodyTypes, i18n.language, t, generateModelDescription, years, setRows])

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
              loading={isSyncing}
            >
              {t('import', { ns: 'codes' })}
            </Button>
          </Grid>
        </Grid>

        <SyncTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          columnGroups={[
            { label: 'Imported', startIndex: 0, endIndex: 8, hasBackground: true },
            { label: 'Levi Data', startIndex: 9, endIndex: 17, hasBackground: false }
          ]}
          getRowSx={(row) => {
            const isSynced = row.codeId && row.codeId !== '00000000-0000-0000-0000-000000000000'

            if (isSynced) return {}

            const isReady =
              row.innerCode &&
              row.manufacturerId &&
              row.seriesId &&
              row.modelId &&
              row.carTypeId

            if (isReady) {
              return { backgroundColor: 'rgba(25, 118, 210, 0.08)' } // Light primary blue
            }

            return { backgroundColor: 'rgba(255, 0, 0, 0.1)' }
          }}
        />
      </StyledPaper>
    </Grid>
  )
}
