export interface Property {
  id: number;
  propertyName: string;
  propertyType: string;
  location: string;
  price: number;
  area: number;
  status: string;
  description: string;
  createdDate: Date;
  ownerId?: number;
  bhkCount?: number;
  listingType?: string;
  imageUrls?: string;
  videoUrl?: string;
  keyFeatures?: string;

  // Property Intelligence additions
  floorPlanUrl?: string;
  availabilityStatus?: string;
  occupancyStatus?: string;
  viewCount?: number;
  leadsGenerated?: number;
  visitsScheduled?: number;
  nearbyAmenities?: string;
}