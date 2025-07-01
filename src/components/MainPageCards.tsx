import CarIcon from '../assets/icons/cards/CarIcon'
import OpinionIcon from '../assets/icons/cards/OpinionIcon'
import UsersIcon from '../assets/icons/cards/UsersIcon'
import CheckCarIcon from '../assets/icons/cards/CheckCar'
import MainPageCard from './MainPageCard'
import Grid from '@mui/material/Grid'
import { useHomePageQuery } from '../query/homePage.query'
import { useNavigate } from '@tanstack/react-router'

function MainPageCards() {
  const { data: homePageData } = useHomePageQuery()
  const navigate = useNavigate()

  return (
    <Grid sx={{ my: 3 }} container rowSpacing={3} columnSpacing={3}>
      <Grid size={{ xs: 6, md: 3 }}>
        <MainPageCard
          name={'cars'}
          icon={<CarIcon />}
          count={homePageData?.data?.cars}
          onCardClick={() => navigate({ to: '/catalog' })}
          onButtonClick={() => navigate({ to: '/catalog/new-car' })}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <MainPageCard
          name={'manufacturers'}
          icon={<CheckCarIcon />}
          count={homePageData?.data?.manufacturers}
          onCardClick={() => navigate({ to: '/manufacturers' })}
          onButtonClick={() => navigate({ to: '/manufacturers/new' })}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <MainPageCard
          name={'opinions'}
          icon={<OpinionIcon />}
          count={homePageData?.data?.opinions}
          onCardClick={() => navigate({ to: '/opinions' })}
          onButtonClick={() => navigate({ to: '/opinions/new' })}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <MainPageCard
          name={'customers'}
          icon={<UsersIcon />}
          count={homePageData?.data?.customers}
          onCardClick={() => navigate({ to: '/customers' })}
          onButtonClick={() => navigate({ to: '/customers/new' })}
        />
      </Grid>
    </Grid>
  )
}

export default MainPageCards
