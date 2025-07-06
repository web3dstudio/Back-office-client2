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
      {/* <Button disableElevation variant='contained' size='large'>
        App Button
      </Button>
      <Button disableElevation variant='outlined' size='large'>
        App Button Outlined
      </Button>

      <TextField size='small' variant='outlined' />

      <TextField
        defaultValue={'MenuItem 2'}
        select
        size='small'
        variant='outlined'
      >
        <MenuItem value={'MenuItem 1'}>MenuItem 1</MenuItem>
        <MenuItem value={'MenuItem 2'}>MenuItem 2</MenuItem>
        <MenuItem value={'MenuItem 3'}>MenuItem 3</MenuItem>
      </TextField>

      <StyledPaper sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <TextField
            defaultValue={'MenuItem 2'}
            select
            size='small'
            variant='outlined'
          >
            <MenuItem value={'MenuItem 1'}>MenuItem 1</MenuItem>
            <MenuItem value={'MenuItem 2'}>MenuItem 2</MenuItem>
            <MenuItem value={'MenuItem 3'}>MenuItem 3</MenuItem>
          </TextField>

          <TextField
            defaultValue={'MenuItem 2'}
            select
            size='small'
            variant='outlined'
          >
            <MenuItem value={'MenuItem 1'}>MenuItem 1</MenuItem>
            <MenuItem value={'MenuItem 2'}>MenuItem 2</MenuItem>
            <MenuItem value={'MenuItem 3'}>MenuItem 3</MenuItem>
          </TextField>
        </Box>

        <Autocomplete
          disablePortal
          size='small'
          options={currencies}
          renderInput={(params) => <TextField variant='outlined' {...params} />}
        />
      </StyledPaper> */}

      <MainPageCards />

      <StyledPaper sx={{ mt: 3 }}>
        <ReportsStatLineChart
          reportsStatitistics={homePageData?.data.sessions}
        />
      </StyledPaper>
    </>
  )
}
