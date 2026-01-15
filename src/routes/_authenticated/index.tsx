import { createFileRoute } from '@tanstack/react-router'
import StyledPaper from '../../components/StyledPaper'
import ReportsStatLineChart from '../../components/ReportsStatLineChart'
import { useHomePageQuery } from '../../query/homePage.query'
import MainPageCards from '../../components/MainPageCards'
import AppLoading from '../../components/AppLoading'
import { useLeadingQuery } from '../../query/statistics/reportLeadingQuery.query'
import { useReportDailyVisitsQuery } from '../../query/statistics/reportDailyVisits.query'
import AppLeadingQueries from '../../components/AppLeadingQueries'
import AppError from '../../components/AppError'

export const Route = createFileRoute('/_authenticated/')({
  component: mainPage,
})


function mainPage() {
  const { isLoading, isError } = useHomePageQuery()
  useLeadingQuery()
  const {
    data: dailyVisits,
    isLoading: isLoadingDailyVisits,
    isError: isErrorDailyVisits,
    error: dailyVisitsError,
  } = useReportDailyVisitsQuery()


  if (isLoading && !isError) {
    return <AppLoading />
  }

  return (
    <>
      <MainPageCards />
      <StyledPaper sx={{ mt: 3 }}>
        {isLoadingDailyVisits ? (
          <AppLoading />
        ) : isErrorDailyVisits ? (
          <AppError error={dailyVisitsError} />
        ) : (
          <ReportsStatLineChart dataset={dailyVisits ?? []} />
        )}
      </StyledPaper>
      <StyledPaper sx={{ mt: 3 }}>
        <AppLeadingQueries />
      </StyledPaper>
    </>
  )
}
