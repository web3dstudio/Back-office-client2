import { Avatar, Box, IconButton, Typography, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
// import { TAvatarUpload, TCurrentUser, TProfileFormInput } from '../../types'
import LoadingButton from '@mui/lab/LoadingButton'
import { useEffect, useState } from 'react'
import {
  AccountCircle,
  DeleteOutline,
  PhotoCameraOutlined,
} from '@mui/icons-material'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledDatePicker } from '../AppControlledDatePicker'
import type { TCurrentUser, TAvatarUpload, TProfileFormInput } from '../../types'

type TAppProfileFormProps = {
  user: TCurrentUser | undefined
  onProfileSave: (data: TProfileFormInput, avatar: TAvatarUpload | null) => void
  isPending: boolean
}

function AppProfileForm({
  user,
  onProfileSave,
  isPending,
}: TAppProfileFormProps) {
  const { t } = useTranslation()

  const schema = object()
    .shape({
      imageFileName: yup.string(),
      firstName: yup.string().required(),
      middleName: yup.string(),
      lastName: yup.string().required(),
      tz: yup.string().required(),
      email: yup.string().email().required(),
      mobileNumber: yup.string().required(),
      phoneNumber: yup.string(),
      address: yup.string(),
      department: yup.string(),
      position: yup.string().required(),
      password: yup.string().required(),
      approvePassword: yup
        .string()
        .oneOf([yup.ref('password'), undefined], 'Passwords must match')
        .required(),
    })
    .required()

  const methods = useForm<TProfileFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      imageFileName: user?.imageFileName || '',
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      tz: user?.tz || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      phoneNumber: user?.phoneNumber || '',
      company: user?.company || '',
      companyTZ: user?.companyTZ || '',
      department: user?.department || '',
      position: user?.position || '',
      branch: user?.branch || '',
      password: user?.password || '',
      approvePassword: user?.password || '',
      allowedMonths: user?.allowedMonths || 0,
    },
  })

  const { handleSubmit, control, formState, reset, setValue } = methods
  const errors = formState.errors

  useEffect(() => {
    if (user) {
      reset({
        imageFileName: user?.imageFileName || '',
        firstName: user?.firstName || '',
        middleName: user?.middleName || '',
        lastName: user?.lastName || '',
        tz: user?.tz || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '',
        phoneNumber: user?.phoneNumber || '',
        company: user?.company || '',
        companyTZ: user?.companyTZ || '',
        department: user?.department || '',
        position: user?.position || '',
        branch: user?.branch || '',
        password: user?.password || '',
        approvePassword: user?.password || '',
        allowedMonths: user?.allowedMonths || 0,
      })
      setPreview(user.imageDownloadUri ? user.imageDownloadUri : null)
    }
  }, [reset, user])

  const [selectedImage, setSelectedImage] = useState<File | null>()
  const [preview, setPreview] = useState<string | null>(null)

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
    setValue('imageFileName', undefined, { shouldDirty: true })
    setSelectedImage(null)
    setPreview(null)
  }

  const onSubmit: SubmitHandler<TProfileFormInput> = (data) => {
    console.log('OnSubmit Profile')
    if (selectedImage && data.imageFileName) {
      const avatar: TAvatarUpload = {
        imageUploadUri: '', // this from update profile response!!!
        filename: data.imageFileName,
        file: selectedImage,
      }
      onProfileSave(data, avatar)
    } else {
      onProfileSave(data, null)
    }
  }

  return (
    <>
      <Box>
        <Grid
          sx={{
            borderRadius: '24px',
            padding: '38px',
            boxShadow: '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06)',
            width: '100%',
            display: 'flex',
            marginBottom: 3,
            backgroundColor: 'background.paper',
          }}
          container
          columns={{ xs: 12 }}
          spacing={3}
        >
          <Grid
            size={{ xs: 12 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ position: 'relative', mb: 3 }}>
              {preview && (
                <Avatar
                  sx={{ width: 140, height: 140 }}
                  alt={`${user?.firstName} ${user?.lastName} `}
                  src={`${preview}`}
                />
              )}
              {!preview && (
                <Avatar
                  sx={{ width: 140, height: 140 }}
                  alt={`${user?.firstName} ${user?.lastName} `}
                >
                  <AccountCircle sx={{ width: 140, height: 140 }} />
                </Avatar>
              )}

              {preview && (
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
            <Typography variant='h4' fontWeight={'bold'}>
              {`${user?.firstName} ${user?.lastName}`}
            </Typography>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='imageFileName'
            control={control}
            render={({ field }) => (
              <input type='hidden' id='imageFileName' {...field} />
            )}
          />

          {/* Personal information */}
          <Grid
            sx={{
              borderRadius: '24px',
              padding: '38px',
              boxShadow: '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06)',
              width: '100%',
              marginBottom: 3,
              backgroundColor: 'background.paper',
            }}
            container
            columns={{ xs: 12 }}
            columnSpacing={3}
            rowSpacing={2}
          >
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' fontWeight={'bold'}>
                {t('personalDetails', { ns: 'userProfile' })}
              </Typography>
            </Grid>

            {/* firstName */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                required
                name='firstName'
                control={control}
                errors={errors}
                label={t('firstName', { ns: 'userProfile' })}
                placeholder={t('firstName', { ns: 'userProfile' })}
              />
            </Grid>

            {/* middleName */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                name='middleName'
                control={control}
                errors={errors}
                label={t('middleName', { ns: 'userProfile' })}
                placeholder={t('middleName', { ns: 'userProfile' })}
              />
            </Grid>

            {/* lastName */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                required
                name='lastName'
                control={control}
                errors={errors}
                label={t('lastName', { ns: 'userProfile' })}
                placeholder={t('lastName', { ns: 'userProfile' })}
              />
            </Grid>

            {/* TZ */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                required
                name='tz'
                control={control}
                errors={errors}
                label={t('tz', { ns: 'userProfile' })}
                placeholder={t('tz', { ns: 'userProfile' })}
              />
            </Grid>


            {/* Contact information */}

            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' fontWeight={'bold'}>
                {t('contactDetails', { ns: 'userProfile' })}
              </Typography>
            </Grid>

            {/* email */}
            <Grid size={{ xs: 12, sm: 12, md: 3 }}>
              <AppControlledTextField
                required
                name='email'
                control={control}
                errors={errors}
                label={t('email', { ns: 'userProfile' })}
                placeholder={t('email', { ns: 'userProfile' })}
              />
            </Grid>

            {/* mobileNumber */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                required
                name='mobile'
                control={control}
                errors={errors}
                label={t('mobile', { ns: 'userProfile' })}
                placeholder={t('mobile', { ns: 'userProfile' })}
              />
            </Grid>

            {/* phoneNumber */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                name='phone'
                control={control}
                errors={errors}
                label={t('phone', { ns: 'userProfile' })}
                placeholder={t('phone', { ns: 'userProfile' })}
              />
            </Grid>

            {/* address */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                name='address'
                control={control}
                errors={errors}
                label={t('address', { ns: 'userProfile' })}
                placeholder={t('address', { ns: 'userProfile' })}
              />
            </Grid>

            {/* Professional Details */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' fontWeight={'bold'}>
                {t('professionalDetails', { ns: 'userProfile' })}
              </Typography>
            </Grid>

            {/* department */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledTextField
                name='department'
                control={control}
                errors={errors}
                label={t('department', { ns: 'userProfile' })}
                placeholder={t('department', { ns: 'userProfile' })}
              />
            </Grid>

            {/* position */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledTextField
                required
                name='position'
                control={control}
                errors={errors}
                label={t('position', { ns: 'userProfile' })}
                placeholder={t('position', { ns: 'userProfile' })}
              />
            </Grid>

            {/* start work date */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledDatePicker
                name='startWorkDate'
                control={control}
                errors={errors}
                label={t('startDate', { ns: 'userProfile' })}
              />
            </Grid>

            {/* user name */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledTextField
                required
                name='userName'
                control={control}
                errors={errors}
                label={t('userName', { ns: 'userProfile' })}
                placeholder={t('userName', { ns: 'userProfile' })}
              />
            </Grid>


            {/* Password fields */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' fontWeight={'bold'}>
                {t('pass', { ns: 'userProfile' })}
              </Typography>
            </Grid>

            {/* password */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledTextField
                required
                type='password'
                name='password'
                control={control}
                errors={errors}
                label={t('pass', { ns: 'userProfile' })}
                placeholder={t('pass', { ns: 'userProfile' })}
              />
            </Grid>

            {/* approvePassword */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledTextField
                required
                type='password'
                name='approvePassword'
                control={control}
                errors={errors}
                label={t('confirmPass', { ns: 'userProfile' })}
                placeholder={t('confirmPass', { ns: 'userProfile' })}
              />
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{ display: 'flex', justifyContent: 'end' }}
            >
              <LoadingButton
                sx={{ width: '100px', textTransform: 'none' }}
                loading={isPending}
                // disabled={!formState.isValid}
                variant='contained'
                type='submit'
              >
                <Box> {t('keeping', { ns: 'userProfile' })}</Box>
              </LoadingButton>
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  )
}

export default AppProfileForm
