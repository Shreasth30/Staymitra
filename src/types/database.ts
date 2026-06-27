export type UserRole = "seeker" | "owner" | "super_admin";
export type PropertyType = "hostel" | "pg";
export type VisitStatus = "pending" | "confirmed" | "declined" | "done" | "new" | "contacted" | "interested" | "visit_scheduled" | "closed" | "rejected";
export type CallbackStatus = "pending" | "done" | "new" | "contacted" | "interested" | "visit_scheduled" | "closed" | "rejected";
export type RoomType = "single" | "double" | "triple" | "shared";
export type AvailabilityStatus = "available" | "few_beds_left" | "full" | "reserved" | "coming_soon";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export type Property = {
  id: string;
  user_id: string;
  type: PropertyType;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  area: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  min_monthly_rent: number;
  max_monthly_rent: number;
  callback_enabled: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type RoomOffering = {
  id: string;
  property_id: string;
  label: string;
  room_type: RoomType;
  beds_count: number;
  has_ac: boolean;
  is_furnished: boolean;
  has_attached_washroom: boolean;
  monthly_rent: number;
  security_deposit: number;
  description: string | null;
  sort_order: number;
  availability_status: AvailabilityStatus;
  total_occupancy: number;
  current_occupancy: number;
  created_at: string;
};

export type RoomPhoto = {
  id: string;
  room_offering_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
};

export type VisitRequest = {
  id: string;
  property_id: string;
  seeker_id: string;
  preferred_at: string;
  note: string | null;
  status: VisitStatus;
  source: string;
  owner_notes: string | null;
  created_at: string;
};

export type CallbackRequest = {
  id: string;
  property_id: string;
  seeker_id: string;
  contact_phone: string;
  message: string | null;
  status: CallbackStatus;
  source: string;
  owner_notes: string | null;
  created_at: string;
};

/** Standard amenity tags */
export const AMENITY_OPTIONS = [
  "WiFi",
  "Food/Meals",
  "Laundry",
  "Power Backup",
  "Hot Water",
  "Gym",
  "Parking",
  "CCTV",
  "Housekeeping",
  "Study Room",
  "TV/Common Area",
  "Refrigerator",
] as const;

export type AmenityTag = (typeof AMENITY_OPTIONS)[number];

/** Room type display labels */
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  shared: "Shared",
};

/** Availability status display config */
export const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; color: string; bgColor: string }> = {
  available: { label: "Available", color: "text-green-600", bgColor: "bg-green-500/10" },
  few_beds_left: { label: "Few Beds Left", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  full: { label: "Full", color: "text-red-500", bgColor: "bg-red-500/10" },
  reserved: { label: "Reserved", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  coming_soon: { label: "Coming Soon", color: "text-purple-500", bgColor: "bg-purple-500/10" },
};

/** Lead status display config */
export const LEAD_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "New", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  new: { label: "New", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  contacted: { label: "Contacted", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  interested: { label: "Interested", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  visit_scheduled: { label: "Visit Scheduled", color: "text-violet-500", bgColor: "bg-violet-500/10" },
  confirmed: { label: "Confirmed", color: "text-green-600", bgColor: "bg-green-500/10" },
  done: { label: "Completed", color: "text-primary", bgColor: "bg-primary/10" },
  closed: { label: "Closed", color: "text-gray-500", bgColor: "bg-gray-500/10" },
  declined: { label: "Declined", color: "text-red-500", bgColor: "bg-red-500/10" },
  rejected: { label: "Rejected", color: "text-red-500", bgColor: "bg-red-500/10" },
};
