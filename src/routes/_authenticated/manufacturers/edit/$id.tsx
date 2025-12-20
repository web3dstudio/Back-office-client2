import { createFileRoute } from '@tanstack/react-router'
import { useManufacturerQuery } from '../../../../query/manufacturers.query'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import { Box, Grid, OutlinedInput, Typography, Button, IconButton, InputAdornment } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear';
import AppBackBtn from '../../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../../components/StyledPaper'
import ManufacturerEditForm from '../../../../components/Manufacturer/ManufacturerEditForm'
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, type SubmitHandler, FormProvider, useFieldArray, useWatch } from 'react-hook-form'
import * as yup from 'yup'
import { useEffect, useState, useRef } from 'react'
import ManufacturerCodesDialog from '../../../../components/Manufacturer/ManufacturerCodesDialog'
import SortableSerie from '../../../../components/Manufacturer/SortableSerie'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { TModel, TSerie } from '../../../../types'
import useManufacturerSeriesModelsMutation from '../../../../query/manufacturers.query'
import { useSeriesDeleteMutation } from '../../../../query/series.query'
import AppExtrasMultiselect from '../../../../components/AppExtrasMultiselect'

export const Route = createFileRoute('/_authenticated/manufacturers/edit/$id')(
  {
    component: MenufacturerEditPage,
  },
)


type TFormInput = any

function MenufacturerEditPage() {
  const { id } = Route.useParams()
  const { t, i18n } = useTranslation()

  const [filterByCode, setFilterByCode] = useState('')
  const [filterByCodeInput, setFilterByCodeInput] = useState('')
  const [openCodesDialog, setOpenCodesDialog] = useState(false)

  const { data: manufacturer, isLoading, isError, refetch } = useManufacturerQuery(id)

  const { mutate: upsertManufacturer, isPending: isUpsertPending } = useManufacturerSeriesModelsMutation()
  const { mutate: deleteSeries } = useSeriesDeleteMutation()

  const schema = yup.object().shape({
    name: yup.string().required(t('form-field.required')),
    engName: yup.string().required(t('form-field.required')),
    serieses: yup.array().of(
      yup.object().shape({
        name: yup.string().required(t('form-field.required')),
        seriesCode: yup.string(),
        models: yup.array().of(
          yup.object().shape({
            name: yup.string().required(t('form-field.required')),
            volume: yup.number().required(t('form-field.required')),
            engineType: yup.object().nullable(),
            code: yup.string().required(t('form-field.required')),
          })
        ),
      })
    ),
  })

  const methods = useForm<TFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      dbId: manufacturer?.id ?? '',
      name: manufacturer?.name ?? '',
      engName: manufacturer?.engName ?? '',
      seriesExtras: ((manufacturer as any)?.seriesExtras || []).map((serie: any) => ({
        seriesId: serie.seriesId,
        seriesName: serie.seriesName,
        extras: Array.isArray(serie.extras)
          ? serie.extras.map((ex: any) => ({
            id: ex.extraId,
            fieldName: ex.extraName,
            fieldNameEn: ex.extraName,
            checked: !!ex.includeInPriceList,
            selected: true,
            value: ex.changePercentage ?? 0,
            fromYear: ex.fromYear,
            toYear: ex.toYear,
          }))
          : [],
      })),
      serieses: manufacturer?.serieses?.map(serie => ({
        dbId: serie.id,
        name: serie.name,
        seriesCode: serie.seriesCode ?? '',
        priority: serie.priority ?? 0,
        models: serie.models?.map(model => ({
          dbId: model.id,
          name: model.name,
          volume: model.volume ?? 0,
          engineType: model.engineType ?? null,
          codes: model.codes || null,
          code: model.code ?? '',
          priority: model.priority ?? 0,
        })) ?? [],
      })) ?? [],
    },
  });

  const { control, handleSubmit, reset } = methods;
  const seriesExtrasFromForm = useWatch({ control, name: 'seriesExtras' }) || []

  const { fields, prepend, move, remove } = useFieldArray({
    control,
    name: 'serieses',
  });

  const prevManufacturerRef = useRef<string>('')


  useEffect(() => {
    if (manufacturer) {
      // Создаем ключ для сравнения без поля codes
      const manufacturerKey = JSON.stringify({
        id: manufacturer.id,
        name: manufacturer.name,
        engName: manufacturer.engName,
        // manufacturerCode: manufacturer.manufacturerCode,
        serieses: manufacturer.serieses
      })

      // Обновляем форму только если изменились поля, кроме codes
      if (prevManufacturerRef.current !== manufacturerKey) {
        prevManufacturerRef.current = manufacturerKey
        reset({
          dbId: manufacturer.id,
          name: manufacturer.name ?? '',
          engName: manufacturer.engName ?? '',
          seriesExtras: ((manufacturer as any)?.seriesExtras || []).map((serie: any) => ({
            seriesId: serie.seriesId,
            seriesName: serie.seriesName,
            extras: Array.isArray(serie.extras)
              ? serie.extras.map((ex: any) => ({
                id: ex.extraId,
                fieldName: ex.extraName,
                fieldNameEn: ex.extraName,
                checked: !!ex.includeInPriceList,
                selected: true,
                value: ex.changePercentage ?? 0,
                fromYear: ex.fromYear,
                toYear: ex.toYear,
              }))
              : [],
          })),
          serieses: manufacturer.serieses?.map(serie => ({
            dbId: serie.id,
            name: serie.name,
            seriesCode: serie.seriesCode ?? '',
            priority: serie.priority ?? 0,
            models: serie.models?.map(model => ({
              dbId: model.id,
              name: model.name,
              volume: model.volume ?? 0,
              engineType: model.engineType ?? null,
              code: model.code ?? '',
              codes: model.codes || null,
              manufacturerCode: model.manufacturerCode ?? '',
              priority: model.priority ?? 0,
            })) ?? [],
          })) ?? [],
        });
      }
    }
  }, [manufacturer, reset]);

  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    const seriesExtraSettings = ((data as any)?.seriesExtras || []).flatMap((serie: any) => {
      const seriesId = serie?.seriesId
      const items = Array.isArray(serie?.extras) ? serie.extras : []
      return items.map((it: any) => ({
        manufacturerSeriesId: seriesId,
        extraId: it.id,
        includeInPriceList: !!it.checked,
        changePercentage: Number(it.value) || 0,
      }))
    })

    const seriesesWithPriority = data.serieses.map((serie: TSerie, serieIdx: number) => ({
      ...serie,
      priority: serieIdx + 1,
      models: Array.isArray(serie.models)
        ? serie.models.map((model: TModel, modelIdx: number) => ({
          ...model,
          priority: modelIdx + 1,
        }))
        : [],
    }));

    // Do NOT send seriesExtras in payload; backend expects seriesExtraSettings instead
    const { seriesExtras: _seriesExtras, ...dataToSend } = data as any
    upsertManufacturer({ ...dataToSend, seriesExtraSettings, serieses: seriesesWithPriority }, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex(s => s.id === active.id);
      const newIndex = fields.findIndex(s => s.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const onSerieDelete = (index: number, serie: TSerie) => {
    if (serie?.dbId == null) {
      remove(index);
    } else {
      deleteSeries(serie.dbId, {
        onSuccess: () => {
          remove(index);
          refetch()
        }
      })
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilterByCode(filterByCodeInput);
    }, 300); // 300 мс задержка

    return () => clearTimeout(handler);
  }, [filterByCodeInput]);

  if (isLoading) {
    return <AppLoading />
  }

  if (isError && !isLoading) {
    return <AppError />
  }

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} >
            <Grid size={12}>
              <AppBackBtn to="/manufacturers" children={t('back', { ns: 'common' })} />
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
                  {`${t('title', { ns: 'manufacturers' })} > ${i18n.language === 'he'
                    ? manufacturer?.name || manufacturer?.engName
                    : manufacturer?.engName || manufacturer?.name}`}
                </Typography>
              </Box>
            </Grid>

            <StyledPaper
              sx={{
                overflow: 'hidden',
                padding: 3,
                width: '100%',
                maxWidth: '100%',
              }}
            >
              {manufacturer && (
                <ManufacturerEditForm
                  manufacturer={manufacturer}
                  isPending={isUpsertPending}
                  onOpenCodesDialog={() => setOpenCodesDialog(true)}
                />
              )}
            </StyledPaper>

            <StyledPaper
              sx={{
                overflow: 'hidden',
                padding: 3,
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {t('extras', { ns: 'manufacturers' })}
                  </Typography>
                </Grid>
                <Grid size={12}>
                  {seriesExtrasFromForm.map((serie: any, idx: number) => (
                    <Box key={serie.seriesId || idx} sx={{ mb: 2 }}>
                      <Typography sx={{ mb: 1, fontWeight: 600 }}>
                        {serie.seriesName}
                      </Typography>
                      <AppExtrasMultiselect name={`seriesExtras.${idx}.extras`} />
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </StyledPaper>

            <Grid size={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>

              {/* Поле фильтра по коду  */}
              <OutlinedInput
                size="small"
                placeholder={t('filter', { ns: 'manufacturers' })}
                value={filterByCodeInput}
                onChange={(e) => setFilterByCodeInput(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFilterByCodeInput('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />

              <Button variant="contained" onClick={() => prepend({ name: '', seriesCode: '', dbId: null, models: [] })}>
                {t('addSerie', { ns: 'manufacturers' })}
              </Button>
            </Grid>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields
                  .map((field, originalIndex) => ({ field, originalIndex }))
                  .filter(({ field }) => {
                    if (!filterByCode) return true;
                    const isNewSerie = !(field as TSerie).dbId;
                    return isNewSerie;
                  })
                  .map(({ field, originalIndex }) => (
                    <SortableSerie
                      key={field.id}
                      serie={field as TSerie}
                      serieIndex={originalIndex}
                      onDelete={(serie) => onSerieDelete(originalIndex, serie)}
                      filterByCode={filterByCode}
                    />
                  ))
                }
              </SortableContext>
            </DndContext>

          </Grid>
        </form>
      </FormProvider>

      {manufacturer && (
        <ManufacturerCodesDialog
          open={openCodesDialog}
          onClose={() => setOpenCodesDialog(false)}
          manufacturerId={manufacturer.id}
          codes={manufacturer.codes || []}
        />
      )}
    </>
  )
}


