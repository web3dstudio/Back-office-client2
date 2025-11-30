import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import UserForm from '../../../components/Users/UserForm'
import { useCreateUserMutation } from '../../../query/users.query'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users/new')({
  component: NewUserPage,
})

function NewUserPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createUser, isPending } = useCreateUserMutation()

  const saveUser = (data: any, avatar: any | null) => {
    createUser(
      { data, avatar },
      {
        onSuccess: () => {
          navigate({ to: '/users' })
        },
      }
    )
  }

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
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('addNewUser', { ns: 'users' })}
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>

      <Grid size={12}>
        <UserForm
          isPending={isPending}
          user={null}
          onUserSave={saveUser}
        />
      </Grid>
    </Grid>
  )
}

