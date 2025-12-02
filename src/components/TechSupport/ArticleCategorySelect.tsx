import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import { Box, Button, Grid, Typography, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import { AppAutocomplete } from '../AppAutocomplete'
import AppControlledTextField from '../AppControlledTextField'
import AppDialog from '../AppDialog/AppDialog'
import AppConfirmDialog from '../AppDialog/AppConfirmDialog'
import type { Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import {
  useSupportArticleCategoriesQuery,
  useSupportArticleCategoryAddMutation,
  useSupportArticleCategoryUpdateMutation,
  useSupportArticleCategoryDeleteMutation,
  useSupportArticleCategoryHasArticlesQuery,
  type TSupportArticleCategory,
} from '../../query/supportArticles.query'
import { useQueryClient } from '@tanstack/react-query'

type TArticleCategorySelectProps = {
  name: string
  control: Control<any>
  errors?: FieldErrors
  required?: boolean
  label?: string
  placeholder?: string
  setValue?: UseFormSetValue<any>
  watch?: UseFormWatch<any>
  articleId?: string | null
}

type TCategoryFormInput = {
  name: string
}

function ArticleCategorySelect({ name, control, errors, required = false, label, placeholder, setValue, watch, articleId }: TArticleCategorySelectProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<TSupportArticleCategory | null>(null)
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] = useState<TSupportArticleCategory | null>(null)
  const [replaceCategoryId, setReplaceCategoryId] = useState<string | null>(null)

  const { data: categories = [], isLoading: categoriesLoading } = useSupportArticleCategoriesQuery()
  const { mutate: addCategory, isPending: isAdding } = useSupportArticleCategoryAddMutation()
  const { mutate: updateCategory, isPending: isUpdating } = useSupportArticleCategoryUpdateMutation()
  const { mutate: deleteCategory, isPending: isDeleting } = useSupportArticleCategoryDeleteMutation()

  // Отслеживаем выбранную категорию для возможности редактирования
  const selectedCategoryValue = watch ? watch(name) : null

  // Проверяем наличие статей у категории для удаления
  const { data: hasArticles = false, isLoading: isLoadingHasArticles } = useSupportArticleCategoryHasArticlesQuery(
    selectedCategoryForDelete?.id || null
  )

  // Фильтруем категории для замены (исключаем удаляемую)
  const replaceCategories = categories.filter((cat) => cat.id !== selectedCategoryForDelete?.id)

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required', { ns: 'common' })),
    })
    .required()

  const formMethods = useForm<TCategoryFormInput>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
  })

  const { handleSubmit: handleFormSubmit, control: formControl, formState: formState, reset: resetForm } = formMethods
  const formErrors = formState.errors

  const handleOpenAddDialog = () => {
    setSelectedCategoryForEdit(null)
    resetForm({ name: '' })
    setOpenDialog(true)
  }

  const handleOpenEditDialog = (category: TSupportArticleCategory) => {
    setSelectedCategoryForEdit(category)
    resetForm({ name: category.name })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedCategoryForEdit(null)
    resetForm({ name: '' })
  }

  const handleOpenDeleteDialog = (category: TSupportArticleCategory) => {
    setSelectedCategoryForDelete(category)
    setReplaceCategoryId(null)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedCategoryForDelete(null)
    setReplaceCategoryId(null)
  }

  const handleDeleteCategory = () => {
    if (selectedCategoryForDelete) {
      // Если есть статьи, но не выбрана категория замены - не удаляем
      if (hasArticles && !replaceCategoryId) {
        return
      }

      deleteCategory(
        {
          id: selectedCategoryForDelete.id,
          replaceWithCategoryId: hasArticles && replaceCategoryId ? replaceCategoryId : undefined,
        },
        {
          onSuccess: () => {
            // Если редактируется статья, перезапрашиваем её данные
            if (articleId) {
              queryClient.invalidateQueries({ queryKey: ['supportArticle', articleId] })
              queryClient.refetchQueries({ queryKey: ['supportArticle', articleId] })
            }
            handleCloseDeleteDialog()
          },
        }
      )
    }
  }

  const handleCategorySubmit = (data: TCategoryFormInput) => {
    if (selectedCategoryForEdit) {
      // Редактирование
      updateCategory(
        { id: selectedCategoryForEdit.id, name: data.name },
        {
          onSuccess: (updatedCategory) => {
            // Обновляем значение в форме статьи, если редактируемая категория была выбрана
            if (setValue && selectedCategoryValue?.id === selectedCategoryForEdit.id) {
              setValue(name, updatedCategory, { shouldValidate: true })
            }
            handleCloseDialog()
          },
        }
      )
    } else {
      // Добавление
      addCategory(
        { name: data.name },
        {
          onSuccess: (newCategory) => {
            // Автоматически выбираем новую категорию в форме
            if (setValue) {
              setValue(name, newCategory, { shouldValidate: true })
            }
            handleCloseDialog()
          },
        }
      )
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <AppControlledAutocomplete<TSupportArticleCategory>
            required={required}
            name={name}
            control={control}
            options={categories}
            errors={errors}
            getOptionLabel={(option) => String(option?.name || '')}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            label={label}
            placeholder={placeholder}
            loading={categoriesLoading}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
          <Tooltip title={t('add', { ns: 'common' })}>
            <IconButton
              onClick={handleOpenAddDialog}
              color="primary"
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('modals.edit', { ns: 'common' })}>
            <span>
              <IconButton
                onClick={() => selectedCategoryValue && handleOpenEditDialog(selectedCategoryValue)}
                color="primary"
                size="small"
                disabled={!selectedCategoryValue}
              >
                <EditIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('modals.delete', { ns: 'common' })}>
            <span>
              <IconButton
                onClick={() => selectedCategoryValue && handleOpenDeleteDialog(selectedCategoryValue)}
                color="error"
                size="small"
                disabled={!selectedCategoryValue}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <AppDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={selectedCategoryForEdit ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
        maxWidth="sm"
        sx={{
          '& .MuiDialog-container': {
            zIndex: 1301, // Выше чем обычные диалоги, но не блокирует родительский
          },
        }}
      >
        <div>
          <Grid container sx={{ mt: 1 }}>
            <Grid size={12}>
              <AppControlledTextField
                required
                name="name"
                control={formControl}
                errors={formErrors}
                label={t('name', { ns: 'techSupport' })}
                placeholder={t('name', { ns: 'techSupport' })}
              />
            </Grid>
            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  color="primary"
                  size="small"
                  onClick={handleCloseDialog}
                  variant="outlined"
                >
                  <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                    {t('modals.cancel', { ns: 'common' })}
                  </Typography>
                </Button>
                <Button
                  color="primary"
                  onClick={() => {
                    handleFormSubmit(handleCategorySubmit)()
                  }}
                  variant="contained"
                  loading={isAdding || isUpdating}
                >
                  <Typography sx={{ textWrap: 'nowrap' }}>
                    {t('modals.save', { ns: 'common' })}
                  </Typography>
                </Button>
              </Box>
            </Grid>
          </Grid>
        </div>
      </AppDialog>

      <AppConfirmDialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onSubmit={handleDeleteCategory}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={isDeleting}
        confirmText={t('modals.delete', { ns: 'common' })}
        confirmColor="error"
        disabled={isLoadingHasArticles || (hasArticles && !replaceCategoryId)}
      >
        {isLoadingHasArticles ? (
          <Typography>{t('loading', { ns: 'common' }) || 'Loading'}...</Typography>
        ) : hasArticles ? (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ mb: 2 }}>
              {t('categoryHasArticles', { ns: 'techSupport' }) || 'This category has articles. Please select a replacement category:'}
            </Typography>
            <AppAutocomplete<TSupportArticleCategory>
              value={replaceCategories.find((cat) => cat.id === replaceCategoryId) || null}
              onChange={(value) => {
                setReplaceCategoryId(value?.id || null)
              }}
              options={replaceCategories}
              getOptionLabel={(option) => String(option?.name || '')}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              label={t('selectReplacementCategory', { ns: 'techSupport' }) || 'Select replacement category'}
              placeholder={t('selectReplacementCategory', { ns: 'techSupport' }) || 'Select replacement category'}
              loading={categoriesLoading}
              required
            />
          </Box>
        ) : (
          <Typography>
            {t('confirmDeleteCategory', { ns: 'techSupport' }) || 'Are you sure you want to delete this category?'}
          </Typography>
        )}
      </AppConfirmDialog>
    </>
  )
}

export default ArticleCategorySelect

