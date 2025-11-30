import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import UserForm from '../../../components/Users/UserForm'
import { useGetUserQuery, useUpdateUserMutation } from '../../../query/users.query'
import AppLoading from '../../../components/AppLoading'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: EditUserPage,
})

function EditUserPage() {
  const { t } = useTranslation()
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const { data: user, isLoading } = useGetUserQuery(id)
  const { mutate: updateUser, isPending } = useUpdateUserMutation()

  const saveUser = (data: any, avatar: any | null) => {
    console.log(data)
    updateUser(
      { id: id, data, avatar },
      {
        onSuccess: () => {
          navigate({ to: '/users' })
        },
      }
    )
  }

  if (isLoading) return <AppLoading />

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
            {t('editUser', { ns: 'users' })} {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>

      <Grid size={12}>
        <UserForm
          isPending={isPending}
          user={user || null}
          onUserSave={saveUser}
        />
      </Grid>
    </Grid>
  )
}

