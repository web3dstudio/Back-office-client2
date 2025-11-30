import { Box, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AppProfileForm from '../../../components/Profile/AppProfileForm'

import { useCurrentUserQuery } from '../../../query/user.query'
// import { TAvatarUpload, TProfileFormInput } from '../../../types'
import {
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from '../../../query/user.query'
import AppLoading from '../../../components/AppLoading'
import AppError from '../../../components/AppError'
import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'



export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { t } = useTranslation()

  const {
    data: currentUser,
    isPending: currentUserIsPending,
    isError: currentUserIsError,
  } = useCurrentUserQuery()
  const { mutate: updateProfileMutation, isPending: updateProfileIsPending } = useUpdateProfileMutation()
  const { mutate: updateAvatarMutation } = useUpdateAvatarMutation()


  const saveProfile = (
    data: any,
    avatar: any | null
  ) => {
    if (currentUser?.id) {
      updateProfileMutation(
        { ...currentUser, ...data },
        {
          onSuccess: (response) => {
            if (avatar && response?.imageUploadUri) {
              updateAvatarMutation({
                ...avatar,
                imageUploadUri: response?.imageUploadUri,
              })
            }
          },
        }
      )
    }
  }

  if (currentUserIsPending) return <AppLoading />
  if (currentUserIsError) return <AppError />

  return (<>
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('title', { ns: 'userProfile' })}
          </Typography>
        </Box>
        <Box>

        </Box>
      </Grid>

      <AppProfileForm
        isPending={updateProfileIsPending}
        user={currentUser}
        onProfileSave={saveProfile}
      />
    </Grid>
  </>)


}
