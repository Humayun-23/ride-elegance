export interface RentalOSAccessShop {
  shop_id: number;
  shop_name: string;
  role: string;
  staff_id: number | null;
  is_active: boolean;
}

export interface RentalOSMe {
  has_rentalos_access: boolean;
  user_id: number;
  email: string;
  user_type: string;
  owned_shops: RentalOSAccessShop[];
  staff_shops: RentalOSAccessShop[];
}

export interface CatalogVehicle {
  bike_id: number;
  shop_id: number;
  name: string;
  model: string;
  bike_type: string;
  price_per_hour: number;
  price_per_day: number;
  condition: string;
  maintenance_status: string | null;
  is_available: boolean;
  image_url: string | null;
  rentalos_availability_status: 'available' | 'booked' | 'maintenance' | 'unavailable';
}

export interface RentalCustomerSearch {
  found: boolean;
  phone_number: string;
  id: number | null;
  firstname: string | null;
  lastname: string | null;
  current_flag_status: string | null;
  previous_booking_count: number;
  latest_flag: RentalCustomerFlag | null;
  latest_note: string | null;
}

export interface RentalCustomer {
  id: number;
  shop_id: number;
  phone_number: string;
  firstname: string | null;
  lastname: string | null;
  current_flag_status: string | null;
  document_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
}

export interface RentalBooking {
  id: number;
  shop_id: number;
  customer_id: number;
  bike_id: number;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number | null;
  advance_paid: number;
  balance_due: number;
  security_deposit: number;
  created_at: string;
  customer: {
    id: number;
    phone_number: string;
    firstname: string | null;
    lastname: string | null;
    current_flag_status: string | null;
  } | null;
  bike: {
    id: number;
    name: string;
    model: string;
    bike_type: string;
  } | null;
}

export interface RentalDocument {
  id: number;
  booking_id: number;
  document_type: string;
  file_url: string;
  file_name: string | null;
  content_type: string | null;
  created_at: string;
}

export interface RentalHandoverPhoto {
  id: number;
  booking_id: number;
  image_url: string;
  latitude: number | null;
  longitude: number | null;
  location_accuracy_meters: number | null;
  location_address: string | null;
  location_permission_granted: boolean;
  captured_at: string | null;
  created_at: string;
}

export interface RentalPayment {
  id: number;
  booking_id: number;
  payment_type: string;
  amount: number;
  status: string;
  method: string | null;
  reference_number: string | null;
  paid_at: string | null;
  received_by_user_id: number | null;
  created_at: string;
}

export interface RentalBookingNote {
  id: number;
  booking_id: number;
  note: string;
  created_by_user_id: number | null;
  created_at: string;
}

export interface RentalCustomerFlag {
  id: number;
  shop_id?: number;
  customer_id?: number;
  flag_type: string;
  severity: string;
  note: string;
  is_active?: boolean;
  created_by_user_id?: number | null;
  created_at: string;
}

export interface RentalStaff {
  id: number;
  shop_id: number;
  user_id: number;
  email: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
