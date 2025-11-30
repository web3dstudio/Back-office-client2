import { createFileRoute } from '@tanstack/react-router'
import { Box, Grid, Typography, Switch, Divider } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import { useEffect } from 'react'
import AppControlledTextField from '../../../components/AppControlledTextField'
import AppLoading from '../../../components/AppLoading'
import AppError from '../../../components/AppError'
import AppBackBtn from '../../../components/AppBackBtn'
import LoadingButton from '@mui/lab/LoadingButton'
import StyledPaper from '../../../components/StyledPaper'
import { useSystemSettingsQuery, useSystemSettingsUpdateMutation } from '../../../query/settings.query'
import type { TSystemSettings } from '../../../types'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation()
  const {
    data: settings,
    isPending: settingsIsPending,
    isError: settingsIsError,
  } = useSystemSettingsQuery()
  const { mutate: updateSettings, isPending: updateIsPending } = useSystemSettingsUpdateMutation()

  const schema = object()
    .shape({
      twoFA: yup.boolean().required(),
      inactiveUsersDisconnectInterval: yup.number().typeError(t('form-field.invalid')).min(0).required(t('form-field.required')),
      inactiveAssessorsUsersDisconnectInterval: yup.number().typeError(t('form-field.invalid')).min(0).required(t('form-field.required')),
      inactiveOpinionsUsersDisconnectInterval: yup.number().typeError(t('form-field.invalid')).min(0).required(t('form-field.required')),
      adminAproveForNewUsers: yup.boolean().required(),
      defaultDailyUserQueries: yup.number().typeError(t('form-field.invalid')).min(0).required(t('form-field.required')),
      unsuccessfulLoginAttempts: yup.number().typeError(t('form-field.invalid')).min(0).required(t('form-field.required')),
      preventUserMultiLogins: yup.boolean().required(),
    })
    .required()

  const methods = useForm<TSystemSettings>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      id: '',
      twoFA: false,
      inactiveUsersDisconnectInterval: 5,
      inactiveAssessorsUsersDisconnectInterval: 5,
      inactiveOpinionsUsersDisconnectInterval: 5,
      adminAproveForNewUsers: false,
      defaultDailyUserQueries: 30,
      unsuccessfulLoginAttempts: 3,
      preventUserMultiLogins: false,
    },
  })

  const { handleSubmit, control, formState, reset } = methods
  const errors = formState.errors

  useEffect(() => {
    if (settings) {
      reset(settings)
    }
  }, [settings, reset])

  const onSubmit = (data: TSystemSettings) => {
    updateSettings(data)
  }

  if (settingsIsPending) return <AppLoading />
  if (settingsIsError) return <AppError />

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid
        size={12}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('title', { ns: 'settings' })}
          </Typography>
        </Box>
      </Grid>

      <StyledPaper
        sx={{
          overflow: 'hidden',
          padding: 3,
          display: 'flex',
          gap: 2,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <Grid container spacing={1}>
            {/* Active two factor authentication - Switch */}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>{t('active2FA', { ns: 'settings' })}</Typography>
                <Controller
                  name="twoFA"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0.5 }}>
              <Divider />
            </Grid>

            {/* Disconnect inactive user after*/}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{t('disconnectUsers', { ns: 'settings' })}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200 }}>
                  <AppControlledTextField
                    name="inactiveUsersDisconnectInterval"
                    control={control}
                    errors={errors}
                    label=""
                    placeholder=""
                    type="number"
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { marginTop: 1, marginBottom: -2 }, '& label + &': { marginTop: 0 } }}
                  />
                  <Typography>{t('subtlety', { ns: 'settings' })}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0 }}>
              <Divider />
            </Grid>

            {/* Disconnect inactive assessors user after*/}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{t('disconnectAssessorsUsers', { ns: 'settings' })}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200 }}>
                  <AppControlledTextField
                    name="inactiveAssessorsUsersDisconnectInterval"
                    control={control}
                    errors={errors}
                    label=""
                    placeholder=""
                    type="number"
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { marginTop: 1, marginBottom: -2 }, '& label + &': { marginTop: 0 } }}
                  />
                  <Typography>{t('subtlety', { ns: 'settings' })}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0 }}>
              <Divider />
            </Grid>

            {/* Disconnect inactive opinions user after X minutes */}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{t('disconnectOpinionsUsers', { ns: 'settings' })}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200 }}>
                  <AppControlledTextField
                    name="inactiveOpinionsUsersDisconnectInterval"
                    control={control}
                    errors={errors}
                    label=""
                    placeholder=""
                    type="number"
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { marginTop: 1, marginBottom: -2 }, '& label + &': { marginTop: 0 } }}
                  />
                  <Typography>{t('subtlety', { ns: 'settings' })}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0 }}>
              <Divider />
            </Grid>

            {/* Need admin approve after registration */}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography>{t('needAdminApprove', { ns: 'settings' })}</Typography>
                <Controller
                  name="adminAproveForNewUsers"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0.5 }}>
              <Divider />
            </Grid>

            {/* Default daily queries for user */}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{t('defaultQueries', { ns: 'settings' })}</Typography>
                <Box sx={{ flex: 1, maxWidth: 200 }}>
                  <AppControlledTextField
                    name="defaultDailyUserQueries"
                    control={control}
                    errors={errors}
                    label=""
                    placeholder=""
                    type="number"
                    sx={{ '& .MuiOutlinedInput-root': { marginTop: 1, marginBottom: -2 }, '& label + &': { marginTop: 0 } }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0.5 }}>
              <Divider />
            </Grid>

            {/* Block user after - bad logins */}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{t('blockUser', { ns: 'settings' })}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200 }}>
                  <AppControlledTextField
                    name="unsuccessfulLoginAttempts"
                    control={control}
                    errors={errors}
                    label=""
                    placeholder=""
                    type="number"
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { marginTop: 1, marginBottom: -2 }, '& label + &': { marginTop: 0 } }}
                  />
                  <Typography sx={{ whiteSpace: 'nowrap' }}>{t('loginTry', { ns: 'settings' })}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={12} sx={{ py: 0.5 }}>
              <Divider />
            </Grid>

            {/* Block double login - Switch */}
            <Grid size={12} sx={{ py: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>{t('blockDoubleLogin', { ns: 'settings' })}</Typography>
                <Controller
                  name="preventUserMultiLogins"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <LoadingButton
                  color="primary"
                  type="submit"
                  variant="contained"
                  loading={updateIsPending}
                >
                  <Typography sx={{ textWrap: 'nowrap' }}>
                    {t('keeping', { ns: 'settings' })}
                  </Typography>
                </LoadingButton>
              </Box>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Grid>
  )
}
