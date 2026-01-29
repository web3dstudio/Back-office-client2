import { Avatar, Box, IconButton, Typography, Switch, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import { useEffect, useState } from 'react'
import {
  AccountCircle,
  DeleteOutline,
  PhotoCameraOutlined,
} from '@mui/icons-material'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledDatePicker } from '../AppControlledDatePicker'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import { useAdUsersQuery } from '../../query/users.query'
import { roleRows, initRolesState, createRolesState, createRole } from '../../utils/roles'
import type { TAvatarUpload, TUser, TAdUser } from '../../types'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Paper } from '@mui/material'
import AppConfirmDialog from '../AppDialog/AppConfirmDialog'

type TUserFormInput = {
  imageFileName?: string | null | undefined
  firstName: string
  middleName?: string | undefined
  lastName: string
  tz: string
  email: string
  mobileNumber: string
  phoneNumber?: string | undefined
  address?: string
  department?: string
  position?: string
  userName: string
  startWorkDate: any
  password: string
  confirmPassword: string
  adUser: boolean
  adSid: TAdUser | null
  roles: Record<number, boolean>
}

type TUserFormProps = {
  user: TUser | null | undefined
  onUserSave: (data: any, avatar: TAvatarUpload | null) => void
  isPending: boolean
}

function UserForm({
  user,
  onUserSave,
  isPending,
}: TUserFormProps) {
  const { t } = useTranslation()

  const schema = object()
    .shape({
      imageFileName: yup.string().optional(),
      firstName: yup.string().required(),
      middleName: yup.string().optional(),
      lastName: yup.string().required(),
      tz: yup.string().required().length(9, 'TZ must be 9 digits').matches(/^\d+$/, 'TZ must contain only digits'),
      email: yup.string().email().required(),
      mobileNumber: yup.string().required(),
      phoneNumber: yup.string().optional(),
      address: yup.string().optional(),
      department: yup.string().optional(),
      position: yup.string().optional(),
      userName: yup.string().required(),
      startWorkDate: yup.mixed().required(),
      password: yup.string().required(),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), undefined], 'Passwords must match')
        .required(),
      adUser: yup.boolean().optional(),
      adSid: yup.mixed().nullable().optional(),
      roles: yup.object().optional(),
    })
    .required()

  const { data: adUsers, isLoading: adUsersLoading } = useAdUsersQuery()


  const methods = useForm<TUserFormInput>({
    resolver: yupResolver(schema) as any,
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
      address: user?.address || '',
      department: user?.department || '',
      position: user?.position || '',
      userName: user?.userName || '',
      startWorkDate: user?.startWorkDate || null,
      password: user?.password || '',
      confirmPassword: user?.password || '',
      adUser: user?.adUser || false,
      adSid: null,
      roles: user?.role ? createRolesState(user.role) : { ...initRolesState },
    },
  })

  const { handleSubmit, control, formState, reset, setValue } = methods
  const errors = formState.errors

  useEffect(() => {
    if (user && adUsers) {
      const selectedAdUser = user.adSid ? adUsers.find(u => u.id === user.adSid) || null : null
      reset({
        imageFileName: user?.imageFileName || '',
        firstName: user?.firstName || '',
        middleName: user?.middleName || '',
        lastName: user?.lastName || '',
        tz: user?.tz || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        department: user?.department || '',
        position: user?.position || '',
        userName: user?.userName || '',
        startWorkDate: user?.startWorkDate || null,
        password: user?.password || '',
        confirmPassword: user?.password || '',
        adUser: user?.adUser || false,
        adSid: selectedAdUser,
        roles: user?.role ? createRolesState(user.role) : { ...initRolesState },
      })
      setPreview(user.imageDownloadUri ? user.imageDownloadUri : null)
    } else if (!user) {
      reset({
        imageFileName: '',
        firstName: '',
        middleName: '',
        lastName: '',
        tz: '',
        email: '',
        mobileNumber: '',
        phoneNumber: '',
        address: '',
        department: '',
        position: '',
        userName: '',
        startWorkDate: null,
        password: '',
        confirmPassword: '',
        adUser: false,
        adSid: null,
        roles: { ...initRolesState },
      })
      setPreview(null)
    }
  }, [reset, user, adUsers])

  const handleAdUserChange = (adUserData: TAdUser | null) => {
    if (adUserData) {
      setValue('adSid', adUserData)
      setValue('firstName', adUserData.givenName || '')
      setValue('lastName', adUserData.surname || '')
      setValue('email', adUserData.emailAddress || '')
      setValue('userName', adUserData.samAccountName || '')
      setValue('mobileNumber', adUserData.voiceTelephoneNumber || '')
    } else {
      setValue('adSid', null)
    }
  }

  const [selectedImage, setSelectedImage] = useState<File | null>()
  const [preview, setPreview] = useState<string | null>(null)
  const [confirmFillAdOpen, setConfirmFillAdOpen] = useState(false)
  const [pendingAdUser, setPendingAdUser] = useState<TAdUser | null>(null)

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

  const onSubmit: SubmitHandler<TUserFormInput> = (data) => {
    console.log('OnSubmit User')
    const { adUser, adSid, roles, confirmPassword, ...profileData } = data

    // Формируем данные в формате, который ожидает бэкенд
    const submitData: any = {
      ...(user?.id && { id: user.id }), // Добавляем id только при обновлении
      userName: profileData.userName || '',
      firstName: profileData.firstName || '',
      middleName: profileData.middleName || '',
      lastName: profileData.lastName || '',
      email: profileData.email || '',
      tz: profileData.tz || '',
      mobileNumber: profileData.mobileNumber || '',
      phoneNumber: profileData.phoneNumber || '',
      address: profileData.address || '',
      department: profileData.department || '',
      position: profileData.position || '',
      password: profileData.password || '',
      adSid: adSid?.id || null,
      adUser: adUser,
      role: createRole(roles),
      imageFileName: profileData.imageFileName === undefined ? null : profileData.imageFileName,
    }

    // Форматируем startWorkDate в ISO строку
    if (profileData.startWorkDate) {
      if (profileData.startWorkDate instanceof Date) {
        submitData.startWorkDate = profileData.startWorkDate.toISOString()
      } else if (typeof profileData.startWorkDate === 'string') {
        submitData.startWorkDate = profileData.startWorkDate
      } else {
        submitData.startWorkDate = new Date().toISOString() // Fallback на текущую дату
      }
    } else {
      submitData.startWorkDate = new Date().toISOString() // Fallback на текущую дату
    }

    if (selectedImage && submitData.imageFileName) {
      const avatar: TAvatarUpload = {
        imageUploadUri: '',
        filename: submitData.imageFileName,
        file: selectedImage,
      }
      onUserSave(submitData, avatar)
    } else {
      onUserSave(submitData, null)
    }
  }

  const adUserValue = methods.watch('adUser')

  return (
    <>
      <Box>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Active Directory User Section */}
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
            columnSpacing={1}
            rowSpacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <AppControlledAutocomplete<TAdUser>
                name="adSid"
                control={control}
                options={adUsers || []}
                errors={errors}
                disabled={!adUserValue}
                loading={adUsersLoading}
                required={false}
                getOptionLabel={(option) => option.samAccountName || option.displayName || option.id}
                isOptionEqualToValue={(option, value) => option.id === (value as TAdUser)?.id}
                label={t('activeDirectoryUser', { ns: 'users' })}
                placeholder={t('selectActiveDirectoryUser', { ns: 'users' })}
                onUserChange={(value) => {
                  const adUser = value as TAdUser | null
                  if (adUser) {
                    setPendingAdUser(adUser)
                    setConfirmFillAdOpen(true)
                  } else {
                    handleAdUserChange(null)
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 1 }}>
                <Typography>{t('activeDirectoryUser', { ns: 'users' })}</Typography>
                <Controller
                  name="adUser"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked)
                        if (!e.target.checked) {
                          setValue('adSid', null)
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>
          </Grid>

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
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    src={`${preview}`}
                  />
                )}
                {!preview && (
                  <Avatar
                    sx={{ width: 140, height: 140 }}
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
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
                {user ? `${user.firstName} ${user.lastName}` : t('newUser', { ns: 'users' })}
              </Typography>
            </Grid>
          </Grid>

          <Controller
            name='imageFileName'
            control={control}
            render={({ field }) => (
              <input type='hidden' id='imageFileName' {...field} value={field.value || ''} />
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
                name='mobileNumber'
                control={control}
                errors={errors}
                label={t('mobile', { ns: 'userProfile' })}
                placeholder={t('mobile', { ns: 'userProfile' })}
              />
            </Grid>

            {/* phoneNumber */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AppControlledTextField
                name='phoneNumber'
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
                required
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

            {/* confirmPassword */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <AppControlledTextField
                required
                type='password'
                name='confirmPassword'
                control={control}
                errors={errors}
                label={t('confirmPass', { ns: 'userProfile' })}
                placeholder={t('confirmPass', { ns: 'userProfile' })}
              />
            </Grid>

            {/* Roles */}
            <Grid size={{ xs: 12 }}>
              <Typography variant='h6' fontWeight={'bold'} sx={{ mb: 2 }}>
                {t('userRoles', { ns: 'userProfile' })}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: '12px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ py: 1 }}>{t('roleName', { ns: 'users' })}</TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>{t('permission', { ns: 'users' })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roleRows.map((role) => (
                      <TableRow
                        key={role.id}
                        sx={{
                          '& td': { py: 0.5 },
                          '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        }}
                      >
                        <TableCell sx={{ py: 0.5 }}>
                          {t(role.name, { ns: 'userProfile' })}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.5 }}>
                          <Controller
                            name={`roles.${role.id}` as any}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                checked={field.value || false}
                                onChange={(e) => field.onChange(e.target.checked)}
                                color="primary"
                              />
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid
              size={{ xs: 12 }}
              sx={{ display: 'flex', justifyContent: 'end' }}
            >
              <Button
                sx={{ width: '100px', textTransform: 'none' }}
                loading={isPending}
                variant='contained'
                type='submit'
                disabled={!formState.isValid}
              >
                <Box> {t('keeping', { ns: 'userProfile' })}</Box>
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      <AppConfirmDialog
        open={confirmFillAdOpen}
        onClose={() => {
          setConfirmFillAdOpen(false)
          setPendingAdUser(null)
          setValue('adSid', null)
        }}
        onSubmit={() => {
          handleAdUserChange(pendingAdUser)
          setConfirmFillAdOpen(false)
          setPendingAdUser(null)
        }}
        title={t('fillDataFromAdTitle', { ns: 'users' })}
        confirmText={t('fillDataFromAdYes', { ns: 'users' })}
        confirmColor='primary'
        cancelText={t('fillDataFromAdNo', { ns: 'users' })}
      >
        <Typography>{t('fillDataFromAdMessage', { ns: 'users' })}</Typography>
      </AppConfirmDialog>
    </>
  )
}

export default UserForm

