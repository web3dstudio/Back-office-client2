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
import { useForm, type SubmitHandler, FormProvider, useFieldArray } from 'react-hook-form'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
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
import type { TSerie } from '../../../../types'
import useManufacturerSeriesModelsMutation from '../../../../query/manufacturers.query'
import { useSeriesDeleteMutation } from '../../../../query/series.query'

export const Route = createFileRoute('/_authenticated/manufacturers/edit/$id')(
  {
    component: MenufacturerEditPage,
  },
)

function getDirtySeriesAndModels(values: TFormInput, dirtyFields: TFormInput) {
  if (!dirtyFields.serieses) return [];

  return values.serieses
    .map((serie: TSerie, serieIndex: number) => {
      const serieDirty = dirtyFields.serieses[serieIndex];
      if (!serieDirty) return null;

      // Если изменена сама серия или хотя бы одна модель
      const dirtyModels = (serie.models || []).map((model, modelIndex) => {
        if (serieDirty.models && serieDirty.models[modelIndex]) {
          return model;
        }
        return null;
      }).filter(Boolean);

      // Если изменены поля серии или есть изменённые модели
      if (
        Object.keys(serieDirty).some(key => key !== 'models') ||
        dirtyModels.length > 0
      ) {
        return {
          ...serie,
          models: dirtyModels
        };
      }
      return null;
    })
    .filter(Boolean);
}

type TFormInput = any

function MenufacturerEditPage() {
  const { id } = Route.useParams()
  const { t, i18n } = useTranslation()

  const [filterByCode, setFilterByCode] = useState('')
  const [filterByCodeInput, setFilterByCodeInput] = useState('')

  const { data: manufacturer, isLoading, isError, refetch } = useManufacturerQuery(id)

  const { mutate: upsertManufacturer, isPending: isUpsertPending } = useManufacturerSeriesModelsMutation()
  const { mutate: deleteSeries } = useSeriesDeleteMutation()

  const schema = yup.object().shape({
    name: yup.string().required(t('form-field.required')),
    engName: yup.string().required(t('form-field.required')),
    serieses: yup.array().of(
      yup.object().shape({
        name: yup.string().required(t('form-field.required')),
        models: yup.array().of(
          yup.object().shape({
            name: yup.string().required(t('form-field.required')),
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
      manufacturerCode: manufacturer?.manufacturerCode ?? '',
      serieses: manufacturer?.serieses?.map(serie => ({
        dbId: serie.id,
        name: serie.name,
        models: serie.models?.map(model => ({
          dbId: model.id,
          name: model.name,
          code: model.code,
        })) ?? [],
      })) ?? [],
    },
  });

  const { control, handleSubmit, reset } = methods;

  const { fields, prepend, move, remove } = useFieldArray({
    control,
    name: 'serieses',
  });

  useEffect(() => {
    if (manufacturer) {
      reset({
        dbId: manufacturer.id,
        name: manufacturer.name ?? '',
        engName: manufacturer.engName ?? '',
        manufacturerCode: manufacturer.manufacturerCode ?? '',
        serieses: manufacturer.serieses?.map(serie => ({
          dbId: serie.id,
          name: serie.name,
          models: serie.models?.map(model => ({
            dbId: model.id,
            name: model.name,
            code: model.code,
          })) ?? [],
        })) ?? [],
      });
    }
  }, [manufacturer, reset]);

  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    const dirtyData = getDirtySeriesAndModels(data, methods.formState.dirtyFields);

    console.log('dirtyData', { ...data, serieses: dirtyData })

    upsertManufacturer(data, {
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              <ManufacturerEditForm manufacturer={manufacturer} isPending={isUpsertPending} />
            )}
          </StyledPaper>

          <Grid size={12}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>

            {/* Поле фильтра по коду  */}
            <OutlinedInput
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

            <Button variant="contained" onClick={() => prepend({ name: '', dbId: null, models: [] })}>
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
                  const models = (field as TSerie).models ?? [];
                  const hasMatchingModel = models.some(
                    model => (model.code || '').toLowerCase().includes(filterByCode.toLowerCase())
                  );
                  const isNewSerie = !(field as TSerie).dbId;
                  return hasMatchingModel || isNewSerie;
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
  )
}


