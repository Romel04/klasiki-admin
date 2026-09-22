// Confirmed from Swagger: GET /districts/{id} and GET /districts/{id}/thanas
// exist and are public. A plain GET /districts (list-all) is ASSUMED to
// follow the same convention as categories/products but wasn't directly
// visible in the paths list shared so far — worth a quick confirm.
export interface District {
  id: string;
  name: string;
  // Confirmed field on CreateDistrictDto/UpdateDistrictDto — shown next to
  // the district picker in the order form as an FYI, not added into the
  // frontend-computed total (the backend is the source of truth for that).
  deliveryCharge: number;
}

export interface Thana {
  id: string;
  name: string;
}