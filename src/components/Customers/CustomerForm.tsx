import { useTranslation } from "react-i18next"
import type { TCustomer } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Avatar, Box, Button, Grid, IconButton, Typography } from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"
import { useCustomerTypesQuery } from "../../query/customerTypes.query"
import AppControlledCheckboxesTags from "../AppControlledCheckboxesTags"
import { AppControlledDatePicker } from "../AppControlledDatePicker"
import { useState } from "react"
import { AccountCircle, DeleteOutline, PhotoCameraOutlined } from "@mui/icons-material"
import AppFormSection from "../AppFormSection"
import { useCustomersAddMutation, useCustomersUpdateMutation } from "../../query/customers.query"
import { useNavigate } from "@tanstack/react-router"


interface Props {
  customer: TCustomer | null
}

type TFormInput = Omit<TCustomer, 'id'> & { confirmPassword?: string }

function CustomerForm({ customer }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: customerTypes, isLoading: isCustomerTypesLoading } = useCustomerTypesQuery()
  const { mutate: updateCustomer, isPending: isUpdatingCustomer } = useCustomersUpdateMutation()
  const { mutate: createCustomer, isPending: isCreatingCustomer } = useCustomersAddMutation()

  const schema = object()
    .shape({
      firstName: yup.string().required(t('form-field.required')),
      lastName: yup.string().required(t('form-field.required')),
      email: yup.string().email(t('form-field.email')).required(t('form-field.required')),
      mobileNumber: yup.string().required(t('form-field.required')),

    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      customerTypes: customer?.customerTypes || [],
      numberOfUsers: customer?.numberOfUsers || 0,
      subscriptionValidity: customer?.subscriptionValidity || '',
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      middleName: customer?.middleName || '',
      tz: customer?.tz || '',
      email: customer?.email || '',
      mobileNumber: customer?.mobileNumber || '',
      phoneNumber: customer?.phoneNumber || '',
      city: customer?.city || '',
      street: customer?.street || '',
      houseNumber: customer?.houseNumber || '',
      zipCode: customer?.zipCode || '',
      company: customer?.company || '',
      branch: customer?.branch || '',
      position: customer?.position || '',
      companyTZ: customer?.companyTZ || '',
      password: customer?.password || '',
      confirmPassword: customer?.password || '',
      dailyQueries: customer?.dailyQueries || 0,
      allowedMonths: customer?.allowedMonths || 0,
      comments: customer?.comments || '',

    },
  })

  const { handleSubmit, control, formState, setValue, watch } = methods
  const errors = formState.errors

  const [selectedImage, setSelectedImage] = useState<File | null>()
  const [preview, setPreview] = useState<string | null>(customer?.imageDownloadUri || null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setValue('imageFileName', file.name, { shouldDirty: true })
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
    }
  }

  const handleRemoveImage = () => {
    setValue('imageFileName', null, { shouldDirty: true })
    setSelectedImage(null)
    setPreview(null)
  }

  const selectedCustomerTypes = watch('customerTypes')
  const hasCompanyUser = selectedCustomerTypes?.some((type: any) => type.value === 16)

  const onSubmit = (data: any) => {
    // Если поле numberOfUsers отключено, устанавливаем его в null
    if (!hasCompanyUser) {
      data.numberOfUsers = null
    }

    // Создаем FormData для отправки файла
    const formData = new FormData()

    // Добавляем JSON данные в поле 'data'
    formData.append('data', JSON.stringify(data))

    // Добавляем файл изображения, если он выбран
    if (selectedImage) {
      formData.append('image', selectedImage)
    }

    if (customer?.id) {
      formData.append('id', customer.id)
      updateCustomer(formData, {
        onSuccess: () => {
          navigate({ to: '/customers' })
        }
      })
    } else {
      createCustomer(formData, {
        onSuccess: (data) => {
          navigate({ to: '/customers/$id', params: { id: data.id } })
        }
      })
    }
    // reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      <AppFormSection title={t('customerType', { ns: 'customer' })} />
      <Grid container columns={12} columnSpacing={2}>

        <Grid size={8}>
          <AppControlledCheckboxesTags
            name="customerTypes"
            loading={isCustomerTypesLoading}
            control={control}
            errors={errors}
            label={t('customerType', { ns: 'customer' })}
            options={customerTypes as any[] || []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledTextField
            required={hasCompanyUser}
            disabled={!hasCompanyUser}
            type='number'
            name='numberOfUsers'
            control={control}
            errors={errors}
            label={t('numberOfUsers', { ns: 'customer' })}
            placeholder={t('numberOfUsers', { ns: 'customer' })}
          />
        </Grid>

        <Grid size={2}>
          <AppControlledDatePicker
            name='subscriptionValidity'
            required
            control={control}
            errors={errors}
            label={t('subscriptionValidity', { ns: 'customer' })}
            placeholder={t('subscriptionValidity', { ns: 'customer' })}
          />
        </Grid>

      </Grid>

      <AppFormSection title={t('profileImg', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid
          size={'auto'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ position: 'relative', mb: 3, mx: 2 }}>
            {(preview) && (
              <Avatar
                sx={{ width: 100, height: 100 }}
                alt={`${customer?.firstName} ${customer?.lastName} `}
                src={preview || customer?.imageDownloadUri || undefined}
              />
            )}
            {!preview && (
              <Avatar
                sx={{ width: 100, height: 100 }}
                alt={`${customer?.firstName} ${customer?.lastName} `}
              >
                <AccountCircle sx={{ width: 100, height: 100 }} />
              </Avatar>
            )}

            {(preview) && (
              <IconButton
                size='large'
                color='error'
                onClick={handleRemoveImage}
                sx={{ position: 'absolute', bottom: -20, right: -20 }}
              >
                <DeleteOutline />
              </IconButton>
            )}

            <IconButton
              size='large'
              color='primary'
              component='label'
              aria-label='upload picture'
              sx={{ position: 'absolute', bottom: -20, left: -20 }}
            >
              <input
                hidden
                accept='image/*'
                type='file'
                onChange={handleImageChange}
              />
              <PhotoCameraOutlined />
            </IconButton>
          </Box>
        </Grid>
        <Grid size={11}>

          <Controller
            name='imageFileName'
            control={control}
            render={({ field }) => (
              <input
                type='hidden'
                id='imageFileName'
                {...field}
                value={field.value || ''}
              />
            )}
          />
        </Grid>
      </Grid>

      <AppFormSection title={t('personalDetails', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid size={3}>
          <AppControlledTextField
            required
            name='firstName'
            control={control}
            errors={errors}
            label={t('firstName', { ns: 'customer' })}
            placeholder={t('firstName', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='middleName'
            control={control}
            errors={errors}
            label={t('middleName', { ns: 'customer' })}
            placeholder={t('middleName', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='lastName'
            required
            control={control}
            errors={errors}
            label={t('lastName', { ns: 'customer' })}
            placeholder={t('lastName', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='tz'
            required
            control={control}
            errors={errors}
            label={t('tz', { ns: 'customer' })}
            placeholder={t('tz', { ns: 'customer' })}
          />
        </Grid>
      </Grid>

      <AppFormSection title={t('contactDetails', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid size={4}>
          <AppControlledTextField
            name='email'
            required
            control={control}
            errors={errors}
            label={t('email', { ns: 'customer' })}
            placeholder={t('email', { ns: 'customer' })}
          />
        </Grid>

        <Grid size={4}>
          <AppControlledTextField
            name='mobileNumber'
            required
            control={control}
            errors={errors}
            label={t('mobileNumber', { ns: 'customer' })}
            placeholder={t('mobileNumber', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={4}>
          <AppControlledTextField
            name='phoneNumber'
            control={control}
            errors={errors}
            label={t('phoneNumber', { ns: 'customer' })}
            placeholder={t('phoneNumber', { ns: 'customer' })}
          />
        </Grid>

        <Grid size={3}>
          <AppControlledTextField
            name='city'
            control={control}
            errors={errors}
            label={t('city', { ns: 'customer' })}
            placeholder={t('city', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='street'
            control={control}
            errors={errors}
            label={t('street', { ns: 'customer' })}
            placeholder={t('street', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='houseNumber'
            control={control}
            errors={errors}
            label={t('houseNumber', { ns: 'customer' })}
            placeholder={t('houseNumber', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='zipCode'
            control={control}
            errors={errors}
            label={t('zipCode', { ns: 'customer' })}
            placeholder={t('zipCode', { ns: 'customer' })}
          />
        </Grid>
      </Grid>

      <AppFormSection title={t('professionalDetails', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid size={3}>
          <AppControlledTextField
            name='company'
            control={control}
            errors={errors}
            label={t('company', { ns: 'customer' })}
            placeholder={t('company', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='branch'
            required
            control={control}
            errors={errors}
            label={t('branch', { ns: 'customer' })}
            placeholder={t('branch', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='position'
            required
            control={control}
            errors={errors}
            label={t('position', { ns: 'customer' })}
            placeholder={t('position', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='companyTZ'
            control={control}
            errors={errors}
            label={t('companyTZ', { ns: 'customer' })}
            placeholder={t('companyTZ', { ns: 'customer' })}
          />
        </Grid>
      </Grid>

      <AppFormSection title={t('password', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid size={3}>
          <AppControlledTextField
            name='password'
            required
            control={control}
            errors={errors}
            label={t('password', { ns: 'customer' })}
            placeholder={t('password', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='confirmPassword'
            required
            control={control}
            errors={errors}
            label={t('confirmPassword', { ns: 'customer' })}
            placeholder={t('confirmPassword', { ns: 'customer' })}
          />
        </Grid>
      </Grid>

      <AppFormSection title={t('queries', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid size={3}>
          <AppControlledTextField
            name='dailyQueries'
            type='number'
            required
            control={control}
            errors={errors}
            label={t('dailyQueries', { ns: 'customer' })}
            placeholder={t('dailyQueries', { ns: 'customer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name='allowedMonths'
            type='number'
            required
            control={control}
            errors={errors}
            label={t('allowedMonths', { ns: 'customer' })}
            placeholder={t('allowedMonths', { ns: 'customer' })}
          />
        </Grid>
      </Grid>

      <AppFormSection title={t('comments', { ns: 'customer' })} sx={{ mt: 3 }} />

      <Grid container columns={12} columnSpacing={2}>

        <Grid size={12}>
          <AppControlledTextField
            name='comments'
            control={control}
            errors={errors}
            label={t('comments', { ns: 'customer' })}
            placeholder={t('comments', { ns: 'customer' })}
            multiline
            minRows={3}
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            {/* <Button
              color='primary'
              size='small'
              onClick={() => { }}
              variant='outlined'
            >
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.cancel', { ns: 'common' })}
              </Typography>
            </Button> */}
            <Button
              color='primary'
              type='submit'
              variant='contained'
              disabled={!formState.isValid}
              loading={isUpdatingCustomer || isCreatingCustomer}
            >
              <Typography sx={{ textWrap: 'nowrap' }}>
                {t('modals.save', { ns: 'common' })}
              </Typography>
            </Button>
          </Box>
        </Grid>
      </Grid>


    </form>

  )
}

export default CustomerForm