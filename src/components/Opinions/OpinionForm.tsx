import { Box, Button, Grid, Tab, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../StyledPaper'
import StepA from './StepA'
import { useEffect, useMemo, useState } from 'react'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import type { TOpinion, TSelectedOwner } from '../../types'
import { ORDERED_TYPE_PRIVATE } from '../../constants'
import { useProtectivesQuery } from '../../query/protectives.query'
import { useExtrasQuery } from '../../query/extras.query'
import { useIntegralExtrasQuery } from '../../query/integralExtras.query'
import { useOpinionsAddMutation, useOpinionsGetPdfQuery, useOpinionUpdateMutation } from '../../query/opinios.query'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { FormProvider, useForm } from "react-hook-form"
import StepB from './StepB'
import StepC from './StepC'
import StepD from './StepD'
import { Add } from '@mui/icons-material'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'react-toastify'

interface TProps {
  opinion: TOpinion | null
  title: string
}

type TFormInput = Omit<TOpinion, 'id'> & {
  selectedOwners: TSelectedOwner[]
  opinionOwners: TSelectedOwner[]
}

export default function OpinionForm({ opinion, title }: TProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('a')
  const [isTemporary, setIsTemporary] = useState(opinion?.temporary || false)
  const [showTabD, setShowTabD] = useState(
    !opinion?.temporary && !!(opinion?.update3Price || opinion?.update3ExtraPrice || opinion?.update3Date)
  )

  const { mutate: createOpinion } = useOpinionsAddMutation()
  const { mutate: updateOpinion, isPending: isUpdatingOpinion } = useOpinionUpdateMutation()

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  const handleStepComplete = ({
    licenseFiles,
    carFiles,
    deleteLicenseFile,
    changeLicenseFile,
    changeCarFiles,
    remainingCarImageIds
  }: {
    licenseFiles?: File[],
    carFiles?: File[],
    deleteLicenseFile?: boolean,
    changeLicenseFile?: boolean,
    changeCarFiles?: boolean,
    remainingCarImageIds?: string[]
  }) => {
    handleSubmit((data) => {
      onSubmit({
        ...data,
        licenseFiles,
        carFiles,
        deleteLicenseFile,
        changeLicenseFile,
        changeCarFiles,
        remainingCarImageIds,
      })
    })()


    // if (selectedTab === 'a') {
    //   handleSubmit((data) => onSubmit({ ...data, licenseFiles, carFiles, deleteLicenseFile, changeLicenseFile, changeCarFiles, remainingCarImageIds }))()
    //   // setSelectedTab('b')
    // } else if (selectedTab === 'b') {
    //   handleSubmit((data) => onSubmit({ ...data, licenseFiles, carFiles, deleteLicenseFile, changeLicenseFile, changeCarFiles, remainingCarImageIds }))()
    //   // handleSubmit(onSubmit)()
    //   setSelectedTab('c')
    // } else if (selectedTab === 'c') {
    //   handleSubmit((data) => onSubmit({ ...data, licenseFiles, carFiles, deleteLicenseFile, changeLicenseFile, changeCarFiles, remainingCarImageIds }))()
    //   // handleSubmit(onSubmit)()
    //   setSelectedTab('d')
    // } else if (selectedTab === 'd') {
    //   handleSubmit((data) => onSubmit({ ...data, licenseFiles, carFiles, deleteLicenseFile, changeLicenseFile, changeCarFiles, remainingCarImageIds }))()
    //   // handleSubmit(onSubmit)()
    // }
  }

  const { data: integralExtras } = useIntegralExtrasQuery()
  const { data: extras } = useExtrasQuery()
  const { data: protectives } = useProtectivesQuery()


  function getDefaultExtras<T extends { id: string; name: string; nameEn?: string | null }>(allExtras: T[], selectedExtras: T[]) {
    const selectedIds = (selectedExtras || []).map(item => item.id)
    return (allExtras || []).map(item => ({
      id: item.id,
      fieldName: item.name,
      fieldNameEn: item.nameEn,
      selected: selectedIds.includes(item.id)
    }))
  }

  const defaultValues = useMemo(() => ({
    temporary: opinion?.temporary || false,
    isCorrection: opinion?.isCorrection || false,
    customer: opinion?.customer || undefined,
    receptionDate: opinion?.receptionDate || '',
    inspectionDate: opinion?.inspectionDate || '',
    number: opinion?.number || 0,
    ordererType: opinion?.ordererType || ORDERED_TYPE_PRIVATE,
    name: opinion?.name || '',
    lastName: opinion?.lastName || '',
    tz: opinion?.tz || '',
    email: opinion?.email || '',
    phone: opinion?.phone || '',
    fax: opinion?.fax || '',
    licenseNumber: opinion?.licenseNumber || '',
    parallelImport: opinion?.parallelImport || false,
    personalImport: opinion?.personalImport || false,
    tinyImport: opinion?.tinyImport || false,
    // licensePhoto: data?.licensePhoto || '',
    importer: opinion?.importer || undefined,
    statementPrice: opinion?.statementPrice || undefined,
    claimNumber: opinion?.claimNumber || '',
    degemNm: opinion?.degemNm || '',
    tozeretNm: opinion?.tozeretNm || '',
    carType: opinion?.carType || undefined,

    manufacturer: opinion?.manufacturer || undefined,
    manufacturerCode: opinion?.manufacturerCode || '',
    model: opinion?.model || undefined,
    modelCode: opinion?.modelCode || '',
    manufacturerYear: opinion?.manufacturerYear || new Date().getFullYear(),
    driveType: opinion?.driveType || undefined,
    gearbox: opinion?.gearbox || undefined,
    volume: opinion?.volume || 0,
    horsepower: opinion?.horsepower || 0,
    numberOfSeats: opinion?.numberOfSeats || 0,
    specialModelCode: opinion?.specialModelCode || '',

    dateOfRegistration: opinion?.dateOfRegistration || '',
    odometer: opinion?.odometer || 0,
    usageType: opinion?.usageType || undefined,
    internalStatus: opinion?.internalStatus || undefined,
    externalStatus: opinion?.externalStatus || undefined,
    tyresStatus: opinion?.tyresStatus || 0,

    numberOfOwners: opinion?.numberOfOwners || 0,
    owners: opinion?.owners || [],
    selectedOwners: (opinion?.owners || []).map(owner => ({
      ownerId: owner.id,
      changePercentage: owner.changePercentage
    })),
    opinionOwners: [] as TSelectedOwner[],

    carDescription: opinion?.carDescription || '',

    integralExtras: getDefaultExtras(integralExtras || [], opinion?.integralExtras || []),
    extras: getDefaultExtras(extras || [], opinion?.extras || []),
    protectives: getDefaultExtras(protectives || [], opinion?.protectives || []),

    commentsForOpinion: opinion?.commentsForOpinion || [],
    comments: opinion?.comments || '',

    priceDeltaType: opinion?.priceDeltaType || 'percent',
    priceDelta: opinion?.priceDelta || 0,
    odometerDeltaType: opinion?.odometerDeltaType || 'percent',
    odometerDelta: opinion?.odometerDelta || 0,
    specialAdditionsDeltaType: opinion?.specialAdditionsDeltaType || 'percent',
    specialAdditionsDelta: opinion?.specialAdditionsDelta || 0,
    roadEntryDeltaType: opinion?.roadEntryDeltaType || 'percent',
    roadEntryDelta: opinion?.roadEntryDelta || 0,
    price: opinion?.price || 0,
    extraPrice: opinion?.extraPrice || 0,
    showPriceWithoutVAT: opinion?.showPriceWithoutVAT || false,

    appraisers: opinion?.appraisers || [],

    update1Visible: opinion?.update1Visible || true,
    update1Date: opinion?.update1Date || '',
    update1ExtraPrice: opinion?.update1ExtraPrice || undefined,
    update1Price: opinion?.update1Price || undefined,

    update2Visible: opinion?.update2Visible || true,
    update2Date: opinion?.update2Date || '',
    update2ExtraPrice: opinion?.update2ExtraPrice || undefined,
    update2Price: opinion?.update2Price || undefined,

    update3Visible: opinion?.update3Visible || true,
    update3Date: opinion?.update3Date || '',
    update3ExtraPrice: opinion?.update3ExtraPrice || undefined,
    update3Price: opinion?.update3Price || undefined,

  }), [integralExtras, extras, protectives]);

  const schema = object()
    .shape({
      customer: yup.object().required(t('form-field.required')),
      receptionDate: yup.string().required(t('form-field.required')).nullable().min(1, t('form-field.required')),
      inspectionDate: yup.string().required(t('form-field.required')).nullable().min(1, t('form-field.required')),
      email: yup.string().email(t('form-field.email')),
      licenseNumber: yup.string().required(t('form-field.required')).min(1, t('form-field.required')),
      manufacturerYear: yup.number().required(t('form-field.required')).min(1960, t('form-field.required')),
      volume: yup.number().required(t('form-field.required')).min(0, t('form-field.required')),
      horsepower: yup.number().required(t('form-field.required')).min(0, t('form-field.required')),
      dateOfRegistration: yup.string().required(t('form-field.required')).nullable().min(1, t('form-field.required')),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: defaultValues
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const onSubmit = (data: any) => {
    // Фильтруем только выбранные элементы
    const selectedIntegralExtras = data.integralExtras?.filter((item: any) => item.selected) || [];
    const selectedExtras = data.extras?.filter((item: any) => item.selected) || [];
    const selectedProtectives = data.protectives?.filter((item: any) => item.selected) || [];

    const finalData = {
      ...data,
      integralExtras: selectedIntegralExtras,
      extras: selectedExtras,
      protectives: selectedProtectives,
      owners: data.opinionOwners || [],
      numberOfOwners: data.opinionOwners?.length || 0,
      deleteLicenseFile: data.deleteLicenseFile || false,
      changeLicenseFile: data.changeLicenseFile || false,
      changeCarFiles: data.changeCarFiles || false,
      remainingCarImageIds: data.remainingCarImageIds || [],
    };

    if (data.licenseFiles && data.licenseFiles.length > 0) {
      finalData.licenseFiles = data.licenseFiles;
    }
    if (data.carFiles && data.carFiles.length > 0) {
      finalData.carFiles = data.carFiles;
    }

    if (opinion?.id) {
      updateOpinion({ ...finalData, id: opinion.id })
    } else {
      createOpinion(finalData, {
        onSuccess(data) {
          navigate({ to: `/opinions/${data.id}` })
        },
      })
    }
  }

  const { refetch: refetchPdf, isFetching: isDownloadingPdf } = useOpinionsGetPdfQuery(opinion?.id || '')

  const downloadPdf = async () => {
    if (methods.formState.isDirty) {
      toast.warning(t('form_is_dirty', { ns: 'opinion' }))
      // return
    }
    const result = await refetchPdf()
    if (result.data) {
      const url = window.URL.createObjectURL(result.data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Opinion_${opinion?.number}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
          <Button
            disabled={!opinion?.id}
            loading={isDownloadingPdf}
            variant='contained'
            onClick={() => {
              downloadPdf()
            }}>
            {t('download', { ns: 'opinion' })}
          </Button>
        </Box>
      </Grid>
      <TabContext value={selectedTab}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TabList onChange={handleTabChange} aria-label="lab API tabs example">
              <Tab label={t('stepA', { ns: 'opinion' })} value="a" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
              {!isTemporary &&
                <Tab label={t('stepB', { ns: 'opinion' })} value="b" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
              }
              {!isTemporary &&
                <Tab label={t('stepC', { ns: 'opinion' })} value="c" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
              }
              {!isTemporary && showTabD &&
                <Tab label={t('stepD', { ns: 'opinion' })} value="d" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
              }
            </TabList>
            {!showTabD && !isTemporary &&
              <Button
                variant="text"
                size="small"
                onClick={() => setShowTabD(true)}
                sx={{ minWidth: 'auto', p: 1 }}
              >
                <Add />
              </Button>
            }
          </Box>
        </Grid>
        <StyledPaper sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ width: '100%' }}>

              <TabPanel value="a" sx={{ p: 0 }}>
                <StepA
                  opinion={opinion}
                  onStepComplete={({ licenseFiles, carFiles, deleteLicenseFile, changeLicenseFile, changeCarFiles, remainingCarImageIds }) => handleStepComplete({ licenseFiles, carFiles, deleteLicenseFile, changeLicenseFile, changeCarFiles, remainingCarImageIds })}
                  setIsTemporary={setIsTemporary}
                  isLoading={isUpdatingOpinion}
                />
              </TabPanel>
              <TabPanel value="b" sx={{ p: 0 }}>
                <StepB onStepComplete={() => handleStepComplete({})} />
              </TabPanel>
              <TabPanel value="c" sx={{ p: 0 }}>
                <StepC onStepComplete={() => handleStepComplete({})} />
              </TabPanel>
              <TabPanel value="d" sx={{ p: 0 }}>
                <StepD onStepComplete={() => handleStepComplete({})} />
              </TabPanel>
            </form>
          </FormProvider>
        </StyledPaper>
      </TabContext>
    </Grid>
  )
} 