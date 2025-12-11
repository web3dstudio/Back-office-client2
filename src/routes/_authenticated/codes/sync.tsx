import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography, Button, TextField, Autocomplete, Select, MenuItem, FormControl } from '@mui/material'
import StyledPaper from '../../../components/StyledPaper'
import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import SyncTable from '../../../components/Codes/SyncTable'
import { useCodesFromApiQuery, useCodesSyncQuery } from '../../../query/codesFromApi.query'
import { useManufacturersWithSeriesAndModelsQuery } from '../../../query/manufacturers.query'
import { useCarTypesQuery } from '../../../query/carTypes.query'
import { useChassisQuery } from '../../../query/chassis.query'
import type { TCodeFromApi } from '../../../types'


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
  const { data: manufacturers, isLoading: manufacturersIsLoading } = useManufacturersWithSeriesAndModelsQuery()
  const { data: carTypes, isLoading: carTypesIsLoading } = useCarTypesQuery()
  const { data: chassisList, isLoading: chassisIsLoading } = useChassisQuery()

  const isLoading = codesIsLoading || manufacturersIsLoading || carTypesIsLoading || chassisIsLoading

  const selectedYearsNames = useMemo(() => selectedYears.map(y => y.name), [selectedYears])
  const { refetch: syncRefetch } = useCodesSyncQuery(selectedYearsNames)

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

  const addCode = (row: TCodeFromApi) => {
    console.log(row)
    // TODO: Add logic
  }

  const removeCode = (codeId: string) => {
    // TODO: Remove logic
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
      accessorKey: 'modelType',
      header: t('sugDegem', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'bodyType',
      header: t('bodyType', { ns: 'codes' }),
      size: 120,
    },
    {
      accessorKey: 'manufacturerId',
      header: t('manufacturerName', { ns: 'codes' }),
      size: 200,
    },
    {
      accessorKey: 'seriesId',
      header: t('series', { ns: 'newCode' }),
      size: 200,
    },
    {
      accessorKey: 'modelId',
      header: t('modelName', { ns: 'codes' }),
      size: 200,
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
      accessorKey: 'chassis',
      header: t('chassis', { ns: 'codes' }),
      size: 150,
      cell: ({ row }) => {
        const hasCodeId = row.original.codeId && row.original.codeId !== '00000000-0000-0000-0000-000000000000'
        if (hasCodeId) {
          const chassis = chassisList?.find(c => c.id === row.original.chassis)
          return chassis?.name || ''
        }
        return (
          <FormControl size="small" fullWidth>
            <Select
              value={row.original.chassis || ''}
              onChange={(e) => {
                const newValue = e.target.value as string
                setRows(prevRows =>
                  prevRows.map(r =>
                    r.id === row.original.id
                      ? { ...r, chassis: newValue || null }
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
              {chassisList?.map((chassis) => (
                <MenuItem key={chassis.id} value={chassis.id}>
                  {chassis.name}
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
          <TextField
            defaultValue={currentValue}
            onBlur={(e) => {
              const value = e.target.value
              setRows(prevRows =>
                prevRows.map(r =>
                  r.id === row.original.id
                    ? { ...r, innerCode: value || null }
                    : r
                )
              )
            }}
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
  ], [carTypes, chassisList, t, generateModelDescription, years, setRows])

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

        <SyncTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          columnGroups={[
            { label: 'Imported', startIndex: 0, endIndex: 7, hasBackground: true },
            { label: 'Levi Data', startIndex: 8, endIndex: 15, hasBackground: false }
          ]}
        />
      </StyledPaper>
    </Grid>
  )
}
