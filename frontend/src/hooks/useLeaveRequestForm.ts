import { useForm, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LeaveRequestFormData } from '../components/leave/types';

export const useLeaveRequestForm = (defaultValues: Partial<LeaveRequestFormData> = {}) => {
  const validationSchema = yup.object({
    leave_type_id: yup.string().required('Leave type is required'),
    start_date: yup.string().required('Start date is required'),
    end_date: yup
      .string()
      .required('End date is required')
      .test(
        'is-after-start',
        'End date must be after start date',
        function (value, context) {
          return !value || !context.parent.start_date || new Date(value) >= new Date(context.parent.start_date);
        }
      ),
    start_time: yup.string().when('is_half_day', {
      is: true,
      then: (schema) => schema.required('Start time is required for half-day leave'),
    }),
    end_time: yup
      .string()
      .when('is_half_day', {
        is: true,
        then: (schema) => schema.required('End time is required for half-day leave'),
      })
      .test(
        'is-after-start-time',
        'End time must be after start time',
        function (value, context) {
          if (!context.parent.is_half_day || !value || !context.parent.start_time) return true;
          
          const [startHours, startMinutes] = context.parent.start_time.split(':').map(Number);
          const [endHours, endMinutes] = value.split(':').map(Number);
          
          return endHours > startHours || (endHours === startHours && endMinutes > startMinutes);
        }
      ),
    reason: yup.string().required('Reason is required').max(500, 'Reason is too long'),
    emergency_request: yup.boolean(),
    work_handover_completed: yup.boolean(),
    handover_notes: yup.string().when('work_handover_completed', {
      is: true,
      then: (schema) => schema.required('Handover notes are required when work handover is completed'),
    }),
    coverage_arranged: yup.boolean(),
    is_half_day: yup.boolean(),
  });

  const formMethods = useForm<LeaveRequestFormData>({
    defaultValues: {
      leave_type_id: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      reason: '',
      emergency_request: false,
      work_handover_completed: false,
      handover_notes: '',
      coverage_arranged: false,
      is_half_day: false,
      ...defaultValues,
    },
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  // Watch for changes to update dependent fields
  const isHalfDay = formMethods.watch('is_half_day');
  const workHandoverCompleted = formMethods.watch('work_handover_completed');
  const startDate = formMethods.watch('start_date');
  const endDate = formMethods.watch('end_date');
  const startTime = formMethods.watch('start_time');
  const endTime = formMethods.watch('end_time');
  const leaveTypeId = formMethods.watch('leave_type_id');

  // Reset times when half-day is toggled
  React.useEffect(() => {
    if (!isHalfDay) {
      formMethods.setValue('start_time', '');
      formMethods.setValue('end_time', '');
    }
  }, [isHalfDay, formMethods]);

  // Reset handover notes when work handover is not completed
  React.useEffect(() => {
    if (!workHandoverCompleted) {
      formMethods.setValue('handover_notes', '');
    }
  }, [workHandoverCompleted, formMethods]);

  // Set end date same as start date if empty
  React.useEffect(() => {
    if (startDate && !endDate) {
      formMethods.setValue('end_date', startDate);
    }
  }, [startDate, endDate, formMethods]);

  return {
    ...formMethods,
    isHalfDay,
    workHandoverCompleted,
    startDate,
    endDate,
    startTime,
    endTime,
    leaveTypeId,
  };
};

export type UseLeaveRequestFormReturn = ReturnType<typeof useLeaveRequestForm>;
