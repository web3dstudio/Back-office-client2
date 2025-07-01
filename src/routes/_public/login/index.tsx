import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../../components/StyledPaper'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import LogoPng from '../../../assets/login-bg-text.png'
import CarPng from '../../../assets/login-bg-car.png'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import AppChangeLanguage from '../../../components/AppChangeLanguage'
import { useLoginMutation } from '../../../query/user.query'
import { useAccessTokenStore } from '../../../store/accessTokenStore'
import { useAuthStore } from '../../../store/authStore'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/_public/login/')({
  component: LoginPage,
})

type TFormInput = {
  userName: string
  password: string
}

function LoginPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const accessTokenStore = useAccessTokenStore()
  const authStore = useAuthStore()
  const navigate = useNavigate()


  const schema = object()
    .shape({
      userName: yup.string().required(t('form-field.required')),
      password: yup.string().required(t('form-field.required')),
    })
    .required()

  const methods = useForm<TFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      userName: '',
      password: '',
    },
  })

  const { handleSubmit, control, formState } = methods
  const errors = formState.errors
  const { mutate: loginMutation, isPending } = useLoginMutation()

  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    loginMutation(data, {
      onSuccess: (response) => {
        if (response.status === 0 && response.data?.token) {
          // Тут надо расшифровать токен!!!
          accessTokenStore.setToken(response.data?.token)
          authStore.isAuthenticated = true
          navigate({ to: '/' })
        } else {
          if (response.status === 2) {
            toast.error(`${response.message}`)
          }
        }
      },
      onError: (_error) => {
        toast.error(t('error_occurred') || 'Error!')
      },
    })
  }

  return (
    <>
      <StyledPaper
        sx={{
          borderRadius: '42px',
          boxShadow:
            '0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06);',
          overflow: 'hidden',
          padding: 0,
          mx: 2,
          width: '100vw',
          maxWidth: '1200px',
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', minHeight: '60vh' }}>
          <Box
            sx={{
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '50%',
              py: 12,
            }}
          >
            <img src={LogoPng} width={'60%'} height={'auto'} alt='' />
            <img src={CarPng} width={'90%'} height={'auto'} alt='' />
          </Box>

          <Box
            sx={{
              backgroundColor: theme.palette.primary.dark,
              width: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid
                sx={{ marginTop: '0px', maxWidth: '300px' }}
                container
                rowSpacing={1}
                columnSpacing={3}
              >
                <Grid size={12} sx={{ color: 'white', mb: 2 }}>
                  <AppChangeLanguage />
                </Grid>
                <Grid size={12} sx={{ color: 'white', mb: 2 }}>
                  <Typography variant='h5'>
                    {t('loginTitle', { ns: 'login' })}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Controller
                    name='userName'
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        error={!!errors.userName?.message}
                        fullWidth
                        variant='outlined'
                      >
                        <TextField
                          sx={{
                            '& .MuiInputBase-formControl': {
                              backgroundColor: '#FFF',
                              overflow: 'hidden',
                            },
                          }}
                          id='username'
                          error={!!errors.userName?.message}
                          {...field}
                          variant='outlined'
                          placeholder='Username'
                        />
                        {!errors.userName?.message && (
                          <FormHelperText margin={'dense'}> </FormHelperText>
                        )}
                        {errors.userName?.message && (
                          <FormHelperText margin={'dense'}>
                            {errors.userName?.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <FormControl
                        error={!!errors.password?.message}
                        fullWidth
                        variant='outlined'
                      >
                        <TextField
                          sx={{
                            '& .MuiInputBase-formControl': {
                              backgroundColor: '#FFF',
                              overflow: 'hidden',
                            },
                          }}
                          error={!!errors.password?.message}
                          {...field}
                          placeholder='Password'
                          type='password'
                          id='password'
                        />
                        {!errors.password?.message && (
                          <FormHelperText margin={'dense'}> </FormHelperText>
                        )}
                        {errors.password?.message && (
                          <FormHelperText margin={'dense'}>
                            {errors.password?.message}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Button
                    disabled={
                      !formState.isValid
                      // || (formState.isValid && !formState.isDirty)
                    }
                    sx={{ bgcolor: theme.palette.primary.light }}
                    loading={isPending}
                    fullWidth
                    variant='contained'
                    type='submit'
                  >
                    {t('login', { ns: 'login' })}
                  </Button>
                </Grid>

              </Grid>
            </form>
            {/* <DevTool control={control} /> */}
          </Box>
        </Box>
      </StyledPaper>
    </>
  )
}
