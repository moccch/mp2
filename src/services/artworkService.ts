// API service for Art Institute of Chicago
import axios from 'axios';
import { ApiResponse, Artwork } from '../types/artwork';

const BASE_URL = 'https://api.artic.edu/api/v1';

export const searchArtworks = async (
  query: string = '',
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse> => {
  try {
    // Using the search endpoint with specific fields for better performance
    const fields = 'id,title,artist_display,date_display,place_of_origin,medium_display,dimensions,credit_line,main_reference_number,image_id,artwork_type_title,style_title,classification_title,department_title,is_public_domain';
    
    if (query.trim()) {
      // Search with query
      const response = await axios.get(`${BASE_URL}/artworks/search`, {
        params: {
          q: query,
          page: page,
          limit: limit,
          fields: fields
        }
      });
      return response.data;
    } else {
      // Get all artworks without search query
      const response = await axios.get(`${BASE_URL}/artworks`, {
        params: {
          page: page,
          limit: limit,
          fields: fields
        }
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching artworks:', error);
    throw error;
  }
};

export const getArtworkById = async (id: number): Promise<Artwork> => {
  try {
    const response = await axios.get(`${BASE_URL}/artworks/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching artwork:', error);
    throw error;
  }
};

// Helper function to construct image URL
export const getImageUrl = (imageId: string, size: string = '843'): string => {
  if (!imageId) return '';
  return `https://www.artic.edu/iiif/2/${imageId}/full/${size},/0/default.jpg`;
};

