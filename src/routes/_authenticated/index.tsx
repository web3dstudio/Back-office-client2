import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../components/StyledPaper'
import ReportsStatLineChart from '../../components/ReportsStatLineChart'
import { useHomePageQuery } from '../../query/homePage.query'
import MainPageCards from '../../components/MainPageCards'
import AppLoading from '../../components/AppLoading'

export const Route = createFileRoute('/_authenticated/')({
  component: mainPage,
})


function mainPage() {
  const { data: homePageData, isLoading, isError } = useHomePageQuery()

  if (isLoading && !isError) {
    return <AppLoading />
  }

  return (
    <>
      <MainPageCards />
      <StyledPaper sx={{ mt: 3 }}>
        <ReportsStatLineChart
          reportsStatitistics={homePageData?.sessions}
        />
      </StyledPaper>
    </>
  )
}
