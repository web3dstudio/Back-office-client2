import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import {
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
  Box,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect } from 'react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonAlignLeft,
  MenuButtonAlignCenter,
  MenuButtonAlignRight,
  MenuButtonBlockquote,
  MenuButtonImageUpload,
  MenuButtonEditLink,
  MenuControlsContainer,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  type RichTextEditorRef,
} from 'mui-tiptap'
import type { SxProps } from '@mui/system'

interface ControlledRichTextEditorProps {
  name: string
  control: Control<any>
  errors?: FieldErrors
  label: string
  placeholder?: string
  sx?: SxProps
  required?: boolean
  disabled?: boolean
}

const ControlledRichTextEditor = ({
  name,
  control,
  errors,
  label,
  sx = {},
  required = false,
  disabled = false,
}: ControlledRichTextEditorProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  // Локальная функция get для вложенных путей
  const get = (obj: any, path: string) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)

  const errorObj = get(errors, name)
  const errorMessage = errorObj?.message

  // Внутренний компонент для обновления контента редактора
  const RichTextEditorWithUpdate = ({
    value,
    onChange,
    editorTheme,
    editorSx
  }: {
    value: string
    onChange: (html: string) => void
    editorTheme: typeof theme
    editorSx: SxProps
  }) => {
    const localRef = useRef<RichTextEditorRef>(null)
    const previousValueRef = useRef<string>(value)

    // Обновляем контент редактора при изменении value извне
    useEffect(() => {
      if (localRef.current?.editor && value !== undefined) {
        // Обновляем только если значение изменилось извне (не из-за нашего onUpdate)
        if (previousValueRef.current !== value) {
          const currentContent = localRef.current.editor.getHTML()
          // Обновляем только если контент действительно отличается
          if (currentContent !== value) {
            localRef.current.editor.commands.setContent(value || '')
          }
          previousValueRef.current = value
        }
      }
    }, [value])

    return (
      <RichTextEditor
        ref={localRef}
        extensions={[
          StarterKit.configure({
            // Исключаем Link из StarterKit, чтобы добавить его с нашими настройками
            link: false,
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          Image.configure({
            inline: true,
            allowBase64: true,
          }),
          Link.configure({
            openOnClick: false,
            autolink: true,
            defaultProtocol: 'https',
            HTMLAttributes: {
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          }),
          LinkBubbleMenuHandler,
        ]}
        content={value || ''}
        onUpdate={({ editor }) => {
          const newContent = editor.getHTML()
          // Обновляем previousValueRef, чтобы useEffect не сработал снова
          previousValueRef.current = newContent
          onChange(newContent)
        }}
        editable={!disabled}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuDivider />
            <MenuButtonAlignLeft />
            <MenuButtonAlignCenter />
            <MenuButtonAlignRight />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuDivider />
            <MenuButtonBulletedList />
            <MenuButtonOrderedList />
            <MenuDivider />
            <MenuButtonEditLink />
            <MenuDivider />
            <MenuButtonImageUpload
              onUploadFiles={async (files: File[]) => {
                // Преобразуем файлы в base64 для вставки в редактор
                return files.map((file) => ({
                  src: URL.createObjectURL(file),
                  alt: file.name,
                }))
              }}
            />
          </MenuControlsContainer>
        )}
        children={() => (
          <>
            <LinkBubbleMenu />
          </>
        )}
        sx={{
          marginTop: editorTheme.spacing(2),
          borderRadius: '24px',
          overflow: 'hidden',
          '& .MuiOutlinedInput-root': {
            borderRadius: '24px',
            '&.Mui-focused fieldset': {
              boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
            },
          },
          '& .mui-tiptap-RichTextContent-root': {
            borderRadius: '24px',
            minHeight: '600px',
          },
          '& .mui-tiptap-RichTextEditor-root': {
            borderRadius: '24px',
          },
          ...editorSx,
        }}
      />
    )
  }

  return (
    <Controller
      name={name}
      disabled={disabled}
      control={control}
      render={({ field }) => (
        <FormControl
          error={!!errorMessage}
          fullWidth
          variant='outlined'
          size='small'
        >
          <InputLabel shrink htmlFor={name} sx={{ fontSize: '20px' }}>
            {t(label)}
            {required && (
              <span style={{ color: 'red', marginBlockStart: '4px' }}>*</span>
            )}
          </InputLabel>
          <Box>
            <RichTextEditorWithUpdate
              value={field.value || ''}
              onChange={field.onChange}
              editorTheme={theme}
              editorSx={sx}
            />
          </Box>
          {!errorMessage && (
            <FormHelperText margin='dense'> </FormHelperText>
          )}
          {errorMessage && (
            <FormHelperText margin='dense'>
              {errorMessage}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}

export default ControlledRichTextEditor

