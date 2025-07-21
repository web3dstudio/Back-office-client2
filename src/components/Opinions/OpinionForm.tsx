import { Box, Button, Grid, Tab, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../StyledPaper'
import StepA from './StepA'
import { useState } from 'react'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import type { TOpinion } from '../../types'

interface TProps {
  data: TOpinion | null
  onSave: (opinion: TOpinion) => void
  title: string
}

export default function OpinionForm({ data, onSave, title }: TProps) {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('a')
  const [isTemporary, setIsTemporary] = useState(false)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  const handleStepComplete = (stepData: any) => {
    // Переход на следующий шаг вместо сохранения
    if (selectedTab === 'a') {
      setSelectedTab('b')
    } else if (selectedTab === 'b') {
      setSelectedTab('c')
    } else if (selectedTab === 'c') {
      setSelectedTab('d')
    } else if (selectedTab === 'd') {
      // На последнем шаге - сохраняем
      onSave(stepData)
    }
  }

  return (
    <Grid container spacing={3}>
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
            {title}
          </Typography>
        </Box>
        <Box>
          <Button variant='contained' onClick={() => {
            console.log('DOWNLOAD')
          }}>
            {t('download', { ns: 'opinion' })}
          </Button>
        </Box>
      </Grid>
      <TabContext value={selectedTab}>
        <Grid size={12}>
          <TabList onChange={handleTabChange} aria-label="lab API tabs example">
            <Tab label={t('stepA', { ns: 'opinion' })} value="a" />
            <Tab disabled={isTemporary} label={t('stepB', { ns: 'opinion' })} value="b" />
            <Tab disabled={isTemporary} label={t('stepC', { ns: 'opinion' })} value="c" />
            <Tab disabled={isTemporary} label={t('stepD', { ns: 'opinion' })} value="d" />
          </TabList>
        </Grid>
        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}>
          <TabPanel value="a" sx={{ width: '100%', p: 0 }}>
            <StepA
              data={data}
              onSave={handleStepComplete}
              setIsTemporary={setIsTemporary}
            />
          </TabPanel>
          <TabPanel value="b">Item Two</TabPanel>
          <TabPanel value="c">Item Three</TabPanel>
          <TabPanel value="d">Item Four</TabPanel>
        </StyledPaper>
      </TabContext>
    </Grid>
  )
} 