// TypeScript types for Art Institute of Chicago API

export interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  date_display: string;
  place_of_origin: string;
  medium_display: string;
  dimensions: string;
  credit_line: string;
  main_reference_number: string;
  image_id: string;
  artwork_type_title: string;
  style_title: string;
  classification_title: string;
  department_title: string;
  is_public_domain: boolean;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
}

export interface ApiResponse {
  pagination: PaginationInfo;
  data: Artwork[];
}

export type SortField = 'title' | 'artist_display' | 'date_display' | 'place_of_origin';
export type SortOrder = 'asc' | 'desc';

