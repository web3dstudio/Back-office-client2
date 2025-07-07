import { createFileRoute } from '@tanstack/react-router'
import { useManufacturerQuery } from '../../../../query/manufacturers.query'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import { Box, Grid, OutlinedInput, Typography } from '@mui/material'
import AppBackBtn from '../../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../../components/StyledPaper'
import ManufacturerEditForm from '../../../../components/Manufacturer/ManufacturerEditForm'
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import { useEffect, useState, useCallback } from 'react'
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
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { TSerie } from '../../../../types'



export const Route = createFileRoute('/_authenticated/manufacturers/edit/$id')(
  {
    component: MenufacturerEditPage,
  },
)

type TFormInput = any

function MenufacturerEditPage() {
  const { id } = Route.useParams()
  const { t, i18n } = useTranslation()

  const { data: manufacturer, isLoading, isError } = useManufacturerQuery(id)

  const [serieses, setSerieses] = useState<TSerie[]>([])
  useEffect(() => {
    if (manufacturer?.serieses) {
      setSerieses(manufacturer.serieses);
    }
  }, [manufacturer?.serieses]);


  const schema = yup.object().shape({
    name: yup.string().required(t('form-field.required')),
    engName: yup.string().required(t('form-field.required')),
  })

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      engName: '',
      manufacturerCode: '',
      serieses: [],
    },
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    if (manufacturer) {
      reset({
        name: manufacturer.name ?? '',
        engName: manufacturer.engName ?? '',
        manufacturerCode: manufacturer.manufacturerCode ?? '',
        serieses: manufacturer.serieses?.map(serie => ({
          name: serie.name,
          models: serie.models?.map(model => ({
            name: model.name ?? '',
            code: model.code ?? '',
          })) ?? [],
        })) ?? [],
      });
    }
  }, [manufacturer, reset])


  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    console.log(data);
  }


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = serieses.findIndex(s => s.id === active.id);
      const newIndex = serieses.findIndex(s => s.id === over?.id);
      const newSerieses = arrayMove(serieses, oldIndex, newIndex)
        .map((serie, idx) => ({
          ...serie,
          priority: idx + 1, // или idx, если нужно с нуля
        }));


      setSerieses(newSerieses);
      // тут можно вызвать onChange, чтобы сохранить порядок на сервере
    }
  };

  const onSerieDelete = useCallback((serieId: string) => {
    console.log('delete', serieId)
  }, [])



  // if (isLoading) {
  //   return <AppLoading />
  // }

  if (isError && !isLoading) {
    return <AppError />
  }
  console.log('is loading', isLoading)

  return (
    <>
      {!manufacturer && isLoading && <AppLoading />}
      {manufacturer && (
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
                    {`${t('title', { ns: 'manufacturers' })} > ${i18n.language === 'he' ? manufacturer?.name : manufacturer?.engName}`}
                  </Typography>
                </Box>
              </Grid>

              <StyledPaper
                sx={{
                  overflow: 'hidden',
                  padding: 3,
                  width: '100%',
                  // display: 'flex',
                  maxWidth: '100%',
                }}
              >

                <ManufacturerEditForm manufacturer={manufacturer} />
              </StyledPaper>

              <Grid size={12}>
                {/* фильтр по коду */}
                <OutlinedInput
                  placeholder={t('filterByCode', { ns: 'manufacturers' })}
                  onChange={(e) => {
                    console.log(e.target.value)
                  }}
                />
              </Grid>
              {serieses.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={serieses.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {serieses.map((serie, index) => (
                      <SortableSerie
                        key={serie.id}
                        serieIndex={index}
                        serie={serie}
                        onDelete={onSerieDelete}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </Grid>
          </form>
        </FormProvider>
      )}

    </>
  )
}


