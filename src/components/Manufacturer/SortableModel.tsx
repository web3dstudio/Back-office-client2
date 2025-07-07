import { Grid } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppControlledTextField from "../AppControlledTextField";
import React, { useState } from "react";
import AppActionButton from "../AppActionButton";
import AppConfirmDialog from "../AppDialog/AppConfirmDialog";

type Props = {
  modelIndex: number
  serieIndex: number
  dndId: string
  onDelete: () => void
}

function SortableModel({ modelIndex, serieIndex, dndId, onDelete }: Props) {
  const { t } = useTranslation('manufacturers')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const { control, formState } = useFormContext();
  const errors = formState.errors

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: dndId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 4,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Grid container size={12} columnGap={2} >
        <Grid size={3}>
          <AppControlledTextField
            required
            name={`serieses.${serieIndex}.models.${modelIndex}.name`}
            control={control}
            errors={errors}
            label={t('modelName', { ns: 'newManufacturer' })}
            placeholder={t('modelName', { ns: 'newManufacturer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            required
            name={`serieses.${serieIndex}.models.${modelIndex}.code`}
            control={control}
            errors={errors}
            label={t('modelCode', { ns: 'newManufacturer' })}
            placeholder={t('modelCode', { ns: 'newManufacturer' })}
          />
        </Grid>
        <Grid size={'auto'} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppActionButton
            type='delete'
            onClick={() => setOpenConfirmDialog(true)}
            sx={{
              mb: 1,
            }}
          />
        </Grid>
      </Grid>
      <AppConfirmDialog
        title={t('modals.approveDelete', { ns: 'common' })}
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={onDelete}
      />
    </div>
  );
}

export default React.memo(SortableModel);