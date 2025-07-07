import { Accordion, Grid, AccordionSummary, AccordionDetails, Typography, useTheme, Button } from "@mui/material";
import AppActionButton from "../AppActionButton";
import StyledPaper from "../StyledPaper";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TSerie } from "../../types";
import { useTranslation } from "react-i18next";
import AppControlledTextField from "../AppControlledTextField";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useState } from "react";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import SortableModel from "./SortableModel";
import React from "react";
import { useModelDeleteMutation } from "../../query/models.query";
import AppConfirmDialog from "../AppDialog/AppConfirmDialog";


type Props = {
  serie: TSerie
  onDelete: (serie: TSerie) => void
  serieIndex: number
  filterByCode: string
}

function SortableSerie({ serie, onDelete, serieIndex, filterByCode }: Props) {
  const { t } = useTranslation('manufacturers')
  const theme = useTheme();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const { mutate: deleteModel } = useModelDeleteMutation()

  const { control, formState } = useFormContext<{ serieses: { models: any[] }[] }>();
  const { fields: modelFields, move: moveModel, remove: removeModel, prepend: prependModel } = useFieldArray({
    control,
    name: `serieses.${serieIndex}.models`
  });

  const errors = formState.errors

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: serie.id });

  const [isExpanded, setIsExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '100%',
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const getDndId = (m: any, idx: number) => `model-${serieIndex}-${m.id ?? idx}`;
      const oldIndex = modelFields.findIndex((m, idx) => getDndId(m, idx) === active.id);
      const newIndex = modelFields.findIndex((m, idx) => getDndId(m, idx) === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveModel(oldIndex, newIndex);
      }
    }
  };

  const onModelDelete = (modelIndex: number, model: any) => {
    console.log('onModelDelete', modelIndex, model.dbId)
    if (model.dbId == null) {
      removeModel(modelIndex)
    } else {
      console.log('Удаление модели с dbId:', model.dbId)
      deleteModel({ id: model.dbId }, {
        onSuccess: () => {
          removeModel(modelIndex)
        }
      })
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Grid container size={12} gap={3}>
        <Grid size={'auto'}>
          <AppActionButton
            type='delete'
            onClick={() => setOpenConfirmDialog(true)}
          />
        </Grid>
        <Grid size={'grow'}>
          <StyledPaper
            sx={{
              overflow: 'hidden',
              padding: 3,
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Grid container size={12} gap={0}>
              <Grid size={6}>
                <AppControlledTextField
                  name={`serieses.${serieIndex}.name`}
                  control={control}
                  errors={errors}
                  label={t('seriesName', { ns: 'newManufacturer' })}
                  placeholder={t('seriesName', { ns: 'newManufacturer' })}
                />
              </Grid>
            </Grid>
            <Accordion
              expanded={isExpanded}
              onChange={() => setIsExpanded(!isExpanded)}
              elevation={0}
              sx={{
                mt: 0,
                pt: 0,
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                aria-controls="panel1-content"
                id={`panel${serieIndex}-header`}
                sx={{ py: 0 }}
              >
                <Typography component="span" sx={{ fontSize: '14px', fontWeight: 400, color: theme.palette.text.secondary }}>{t('models', { ns: 'newManufacturer' })}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container columns={12} gap={3}>
                  <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        console.log('add model');
                        prependModel({ name: '', code: '', dbId: null });
                        console.log('modelFields', modelFields)
                      }}                    >
                      {t('addModel', { ns: 'newManufacturer' })}
                    </Button>
                  </Grid>
                  <Grid size={12}>
                    {isExpanded &&
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={modelFields.map((model, modelIndex) => `model-${serieIndex}-${model.id ?? modelIndex}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {modelFields.map((model, modelIndex) => {
                            const show =
                              !filterByCode ||
                              (model.code || '').toLowerCase().includes(filterByCode.toLowerCase()) ||
                              (
                                filterByCode &&
                                (!model.code || model.code === '') &&
                                (!model.dbId || model.dbId === null)
                              );
                            if (!show) return null;
                            return (
                              <SortableModel
                                key={`model-${serieIndex}-${model.id ?? modelIndex}`}
                                serieIndex={serieIndex}
                                modelIndex={modelIndex}
                                dndId={`model-${serieIndex}-${model.id ?? modelIndex}`}
                                onDelete={() => onModelDelete(modelIndex, model)}
                              />
                            );
                          })}
                        </SortableContext>
                      </DndContext>
                    }
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </StyledPaper>
        </Grid>
      </Grid>
      <AppConfirmDialog
        title={t('modals.approveDelete', { ns: 'common' })}
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={() => onDelete(serie)}
      />
    </div>
  );
}

export default React.memo(SortableSerie);