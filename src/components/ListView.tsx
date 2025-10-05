import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchArtworks, getImageUrl } from '../services/artworkService';
import { Artwork, SortField, SortOrder } from '../types/artwork';
import './ListView.css';

const ListView: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort artworks - memoized with useCallback
  const filterAndSortArtworks = useCallback(() => {
    let result = [...artworks];

    // Filter by search query (client-side filtering)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((artwork) =>
        artwork.title?.toLowerCase().includes(query) ||
        artwork.artist_display?.toLowerCase().includes(query) ||
        artwork.place_of_origin?.toLowerCase().includes(query) ||
        artwork.date_display?.toLowerCase().includes(query)
      );
    }

    // Sort by selected field and order
    result.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredArtworks(result);
  }, [artworks, searchQuery, sortField, sortOrder]);

  // Fetch artworks on component mount
  useEffect(() => {
    const fetchArtworks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchArtworks('', 1, 100); // Get 100 artworks for better filtering
        setArtworks(response.data);
      } catch (err) {
        setError('Failed to fetch artworks. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArtworks();
  }, []);

  // Filter and sort artworks whenever dependencies change
  useEffect(() => {
    filterAndSortArtworks();
  }, [filterAndSortArtworks]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortField(e.target.value as SortField);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as SortOrder);
  };

  if (isLoading) {
    return <div className="list-view-container"><div className="loading">Loading artworks...</div></div>;
  }

  if (error) {
    return <div className="list-view-container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="list-view-container">
      <h1>Art Institute of Chicago Collection</h1>

      {/* Search and Sort Controls */}
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search artworks by title, artist, origin, or date..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="sort-container">
          <label htmlFor="sort-field">Sort by:</label>
          <select
            id="sort-field"
            value={sortField}
            onChange={handleSortFieldChange}
            className="sort-select"
          >
            <option value="title">Title</option>
            <option value="artist_display">Artist</option>
            <option value="date_display">Date</option>
            <option value="place_of_origin">Origin</option>
          </select>

          <label htmlFor="sort-order">Order:</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={handleSortOrderChange}
            className="sort-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Found {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''}
      </div>

      {/* Artworks List */}
      <div className="artworks-list">
        {filteredArtworks.length === 0 ? (
          <div className="no-results">No artworks found matching your search.</div>
        ) : (
          filteredArtworks.map((artwork, idx) => (
            <Link
              to={`/artwork/${artwork.id}`}
              state={{ ids: filteredArtworks.map(a => a.id), index: idx, source: 'list' }}
              key={artwork.id}
              className="artwork-item"
            >
              <div className="artwork-image">
                {artwork.image_id ? (
                  <img
                    src={getImageUrl(artwork.image_id, '200')}
                    alt={artwork.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
              </div>
              <div className="artwork-info">
                <h3 className="artwork-title">{artwork.title}</h3>
                <p className="artwork-artist">{artwork.artist_display || 'Unknown Artist'}</p>
                <p className="artwork-date">{artwork.date_display || 'Date unknown'}</p>
                <p className="artwork-origin">{artwork.place_of_origin || 'Origin unknown'}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ListView;

