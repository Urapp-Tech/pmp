export interface Unit {
  name: string;
  unit_no: string;
  unit_type: string;
  size: string;
  rent: string;
  status: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  water_meter: string;
  electricity_meter: string;
  pictures: File[]; // handled separately
}

export interface Fields {
  landlord_id: string;
  name: string;
  city: string;
  governance: string;
  address: string;
  address2: string;
  description: string;
  property_type: string;
  type: string;
  paci_no: string;
  property_no: string;
  civil_no: string;
  build_year: string;
  book_value: string;
  estimate_value: string;
  latitude: string;
  longitude: string;
  status: string;
  pictures: File[]; // handled in React state
  units: Unit[]; // array of unit objects
}
