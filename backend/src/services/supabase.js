import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const getUserByEmail = (email) => supabase.from('users').select('*').eq('email', email).single();
export const getUserById = (id) => supabase.from('users').select('*').eq('id', id).single();
export const getUser = (id) => supabase.from('users').select('*').eq('id', id).single();
export const createUser = (data) => supabase.from('users').insert(data).select().single();
export const getServices = (provider_id) => supabase.from('services').select('*').eq('provider_id', provider_id).eq('is_active', true);
export const getServiceById = (id) => supabase.from('services').select('*').eq('id', id).single();
export const getService = (id) => supabase.from('services').select('*').eq('id', id).single();
export const createService = (data) => supabase.from('services').insert(data).select().single();
export const getBookings = (provider_id) => supabase.from('bookings').select('*, services(name, price, deposit_amount)').eq('provider_id', provider_id).order('appointment_date');
export const getBooking = (id) => supabase.from('bookings').select('*, services(*)').eq('id', id).single();
export const getBookingByRef = (ref) => supabase.from('bookings').select('*').eq('booking_ref', ref).single();
export const createBooking = (data) => supabase.from('bookings').insert(data).select().single();
export const updateBookingStatus = (id, status) => supabase.from('bookings').update({ status }).eq('id', id);
export const updateBooking = (id, data) => supabase.from('bookings').update(data).eq('id', id).select().single();

export default supabase;

export const getBookingById = (id) => supabase.from('bookings').select('*, services(*)').eq('id', id).single();

export const getUserBookings = (user_id) => supabase.from('bookings').select('*, services(name, price, deposit_amount)').eq('provider_id', user_id).order('appointment_date');
