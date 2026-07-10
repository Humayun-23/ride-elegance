import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  addBookingNote,
  cancelBooking,
  completeBooking,
  recordPayment,
  uploadBookingDocument,
  uploadHandoverPhoto,
} from '../services/rentalosService';
import { rentalOSKeys, rentalOSErrorMessage } from './useRentalOSQueries';
import type {
  RentalBookingCompletePayload,
  RentalBookingDocument,
  RentalBookingNote,
  RentalBooking,
  RentalHandoverPhoto,
  RentalPayment,
  RentalPaymentCreatePayload,
} from '../types';

export function useAddBookingNoteMutation(bookingId: number | string | null | undefined, shopId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (note: string) => addBookingNote(bookingId as string | number, note),
    onMutate: async (newNote) => {
      if (!bookingId) return;
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.bookingNotes(bookingId) });
      const previousNotes = queryClient.getQueryData<RentalBookingNote[]>(rentalOSKeys.bookingNotes(bookingId));

      const tempNote: RentalBookingNote = {
        id: Math.random(),
        booking_id: Number(bookingId),
        note: newNote,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<RentalBookingNote[]>(rentalOSKeys.bookingNotes(bookingId), (old) => {
        return old ? [...old, tempNote] : [tempNote];
      });

      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      if (bookingId && context?.previousNotes) {
        queryClient.setQueryData(rentalOSKeys.bookingNotes(bookingId), context.previousNotes);
      }
      toast({ variant: 'destructive', title: 'Error', description: rentalOSErrorMessage(err, 'Failed to add note') });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Note added successfully' });
    },
    onSettled: () => {
      if (bookingId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.bookingNotes(bookingId) });
      if (shopId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
    },
  });
}

export function useCancelBookingMutation(bookingId: number | string | null | undefined, shopId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => cancelBooking(bookingId as string | number),
    onMutate: async () => {
      if (!bookingId) return;
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.booking(bookingId) });
      if (shopId) await queryClient.cancelQueries({ queryKey: rentalOSKeys.bookings(shopId) });

      const previousBooking = queryClient.getQueryData<RentalBooking>(rentalOSKeys.booking(bookingId));
      
      if (previousBooking) {
        queryClient.setQueryData<RentalBooking>(rentalOSKeys.booking(bookingId), {
          ...previousBooking,
          status: 'cancelled',
        });
      }

      return { previousBooking };
    },
    onError: (err, variables, context) => {
      if (bookingId && context?.previousBooking) {
        queryClient.setQueryData(rentalOSKeys.booking(bookingId), context.previousBooking);
      }
      toast({ variant: 'destructive', title: 'Error', description: rentalOSErrorMessage(err, 'Failed to cancel booking') });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking cancelled successfully' });
    },
    onSettled: () => {
      if (bookingId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.booking(bookingId) });
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: rentalOSKeys.bookings(shopId) });
        queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
      }
    },
  });
}

export function useCompleteBookingMutation(bookingId: number | string | null | undefined, shopId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: RentalBookingCompletePayload = {}) => completeBooking(bookingId as string | number, payload),
    onMutate: async () => {
      if (!bookingId) return;
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.booking(bookingId) });
      if (shopId) await queryClient.cancelQueries({ queryKey: rentalOSKeys.bookings(shopId) });

      const previousBooking = queryClient.getQueryData<RentalBooking>(rentalOSKeys.booking(bookingId));
      
      if (previousBooking) {
        queryClient.setQueryData<RentalBooking>(rentalOSKeys.booking(bookingId), {
          ...previousBooking,
          status: 'completed',
        });
      }

      return { previousBooking };
    },
    onError: (err, variables, context) => {
      if (bookingId && context?.previousBooking) {
        queryClient.setQueryData(rentalOSKeys.booking(bookingId), context.previousBooking);
      }
      toast({ variant: 'destructive', title: 'Error', description: rentalOSErrorMessage(err, 'Failed to complete booking') });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Booking completed successfully' });
    },
    onSettled: () => {
      if (bookingId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.booking(bookingId) });
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: rentalOSKeys.bookings(shopId) });
        queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
      }
    },
  });
}

export function useAddPaymentMutation(bookingId: number | string | null | undefined, shopId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: RentalPaymentCreatePayload) => recordPayment(bookingId as string | number, payload),
    onMutate: async (newPayment) => {
      if (!bookingId) return;
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.bookingPayments(bookingId) });
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.booking(bookingId) });

      const previousPayments = queryClient.getQueryData<RentalPayment[]>(rentalOSKeys.bookingPayments(bookingId));
      const previousBooking = queryClient.getQueryData<RentalBooking>(rentalOSKeys.booking(bookingId));

      const tempPayment: RentalPayment = {
        id: Math.random(),
        booking_id: Number(bookingId),
        amount: newPayment.amount,
        payment_type: newPayment.payment_type,
        status: newPayment.status,
        method: newPayment.method,
        reference_number: newPayment.reference_number ?? null,
        paid_at: newPayment.paid_at ?? null,
        received_by_user_id: null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<RentalPayment[]>(rentalOSKeys.bookingPayments(bookingId), (old) => {
        return old ? [...old, tempPayment] : [tempPayment];
      });

      if (previousBooking) {
        queryClient.setQueryData<RentalBooking>(rentalOSKeys.booking(bookingId), {
          ...previousBooking,
          balance_due: Math.max(0, previousBooking.balance_due - newPayment.amount),
        });
      }

      return { previousPayments, previousBooking };
    },
    onError: (err, newPayment, context) => {
      if (bookingId) {
        if (context?.previousPayments) queryClient.setQueryData(rentalOSKeys.bookingPayments(bookingId), context.previousPayments);
        if (context?.previousBooking) queryClient.setQueryData(rentalOSKeys.booking(bookingId), context.previousBooking);
      }
      toast({ variant: 'destructive', title: 'Error', description: rentalOSErrorMessage(err, 'Failed to record payment') });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Payment recorded successfully' });
    },
    onSettled: () => {
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: rentalOSKeys.bookingPayments(bookingId) });
        queryClient.invalidateQueries({ queryKey: rentalOSKeys.booking(bookingId) });
      }
      if (shopId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
    },
  });
}

export function useUploadDocumentMutation(bookingId: number | string | null | undefined, shopId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (formData: FormData) => uploadBookingDocument(bookingId as string | number, formData),
    onMutate: async (formData) => {
      if (!bookingId) return;
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.bookingDocuments(bookingId) });
      const previousDocs = queryClient.getQueryData<RentalBookingDocument[]>(rentalOSKeys.bookingDocuments(bookingId));

      const tempDoc: RentalBookingDocument = {
        id: Math.random(),
        booking_id: Number(bookingId),
        document_type: (formData.get('document_type') as string) || 'unknown',
        file_url: URL.createObjectURL(formData.get('file') as File),
        verified: false,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<RentalBookingDocument[]>(rentalOSKeys.bookingDocuments(bookingId), (old) => {
        return old ? [...old, tempDoc] : [tempDoc];
      });

      return { previousDocs };
    },
    onError: (err, variables, context) => {
      if (bookingId && context?.previousDocs) {
        queryClient.setQueryData(rentalOSKeys.bookingDocuments(bookingId), context.previousDocs);
      }
      toast({ variant: 'destructive', title: 'Error', description: rentalOSErrorMessage(err, 'Failed to upload document') });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document uploaded successfully' });
    },
    onSettled: () => {
      if (bookingId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.bookingDocuments(bookingId) });
      if (shopId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
    },
  });
}

export function useUploadHandoverMutation(bookingId: number | string | null | undefined, shopId: number | string | null | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (formData: FormData) => uploadHandoverPhoto(bookingId as string | number, formData),
    onMutate: async (formData) => {
      if (!bookingId) return;
      await queryClient.cancelQueries({ queryKey: rentalOSKeys.bookingHandoverPhotos(bookingId) });
      const previousPhotos = queryClient.getQueryData<RentalHandoverPhoto[]>(rentalOSKeys.bookingHandoverPhotos(bookingId));

      const tempPhoto: RentalHandoverPhoto = {
        id: Math.random(),
        booking_id: Number(bookingId),
        image_url: URL.createObjectURL(formData.get('file') as File),
        latitude: null,
        longitude: null,
        location_accuracy_meters: null,
        location_address: (formData.get('location_address') as string) || null,
        location_permission_granted: formData.get('location_permission_granted') === 'true',
        captured_at: (formData.get('captured_at') as string) || null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<RentalHandoverPhoto[]>(rentalOSKeys.bookingHandoverPhotos(bookingId), (old) => {
        return old ? [...old, tempPhoto] : [tempPhoto];
      });

      return { previousPhotos };
    },
    onError: (err, variables, context) => {
      if (bookingId && context?.previousPhotos) {
        queryClient.setQueryData(rentalOSKeys.bookingHandoverPhotos(bookingId), context.previousPhotos);
      }
      toast({ variant: 'destructive', title: 'Error', description: rentalOSErrorMessage(err, 'Failed to upload handover photo') });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Handover photo uploaded successfully' });
    },
    onSettled: () => {
      if (bookingId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.bookingHandoverPhotos(bookingId) });
      if (shopId) queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
    },
  });
}
