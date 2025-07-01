import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import AppIntegralExtrasMultiselect from '../../../components/IntegralExtras/AppIntegralExtrasMultiselect';
import { Button } from '@mui/material';
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import { useIntegralExtrasQuery } from '../../../query/integralExtras.query'
import { useMemo, useEffect } from 'react';
import type { TAppExtrasItemField } from '../../../types';



type TFormInput = any;

export const Route = createFileRoute('/_authenticated/opinions/')({
  component: OpinionsPage,
})

function OpinionsPage() {
  const { data: integralExtrasData } = useIntegralExtrasQuery()


  const defaultValues = useMemo(() => ({
    extras: integralExtrasData
      ? integralExtrasData.map(item => ({
        id: item.id,
        checked: false,
        fieldName: item.name,
        fieldNameEn: item.nameEn,
        selected: false,
        value: 0
      }))
      : []
  }), [integralExtrasData]);

  const schema = yup.object().shape({
    extras: yup.array().of(
      yup.object().shape({
        id: yup.mixed().required(),
        checked: yup.boolean(),
        value: yup.number()
      })
    )
  });

  const methods = useForm<TFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues,
  })

  // Сброс формы при загрузке данных
  useEffect(() => {
    if (integralExtrasData) {
      methods.reset(defaultValues);
    }
  }, [integralExtrasData, methods, defaultValues]);

  const { handleSubmit, formState } = methods
  // const errors = formState.errors

  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    // убираем все, кроме выбранных
    const filteredIntegralExtras = data.extras.filter((item: TAppExtrasItemField) => item.selected);
    console.log(filteredIntegralExtras);
  }

  const isReady = integralExtrasData && defaultValues.extras.length;
  if (!isReady) return null;

  return (<>
    <StyledPaper
      sx={{
        borderRadius: '42px',
        boxShadow:
          '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06);',
        overflow: 'hidden',
        padding: 3,
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        gap: 2,
      }}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AppIntegralExtrasMultiselect name="integralExtras" />
          <Button type="submit">Submit</Button>
        </form>
      </FormProvider>
    </StyledPaper>
  </>)
}