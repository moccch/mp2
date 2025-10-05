import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { searchArtworks, getImageUrl } from '../services/artworkService';
import { Artwork } from '../types/artwork';
import './GalleryView.css';

type FilterMap = {
  classification: Set<string>;
  department: Set<string>;
  type: Set<string>;
};

const GalleryView: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterMap>({
    classification: new Set<string>(),
    department: new Set<string>(),
    type: new Set<string>()
  });

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await searchArtworks('', 1, 100);
        setArtworks(res.data);
      } catch (e) {
        setError('Failed to load gallery.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const uniqueValues = useMemo(() => {
    const by = {
      classification: new Set<string>(),
      department: new Set<string>(),
      type: new Set<string>()
    };
    for (const a of artworks) {
      if (a.classification_title) by.classification.add(a.classification_title);
      if (a.department_title) by.department.add(a.department_title);
      if (a.artwork_type_title) by.type.add(a.artwork_type_title);
    }
    return {
      classification: Array.from(by.classification).sort(),
      department: Array.from(by.department).sort(),
      type: Array.from(by.type).sort()
    };
  }, [artworks]);

  const toggleFilter = (group: keyof FilterMap, value: string) => {
    setFilters(prev => {
      const next = { ...prev, [group]: new Set(prev[group]) } as FilterMap;
      if (next[group].has(value)) next[group].delete(value);
      else next[group].add(value);
      return next;
    });
  };

  const clearAll = () => {
    setFilters({ classification: new Set(), department: new Set(), type: new Set() });
    setSearchQuery('');
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasAny = (s: Set<string>) => s.size > 0;
    const matchesFilter = (a: Artwork) => {
      if (hasAny(filters.classification) && !filters.classification.has(a.classification_title || '')) return false;
      if (hasAny(filters.department) && !filters.department.has(a.department_title || '')) return false;
      if (hasAny(filters.type) && !filters.type.has(a.artwork_type_title || '')) return false;
      return true;
    };
    const matchesQuery = (a: Artwork) => {
      if (!query) return true;
      const hay = `${a.title || ''} ${a.artist_display || ''} ${a.date_display || ''} ${a.place_of_origin || ''}`.toLowerCase();
      return hay.includes(query);
    };
    return artworks.filter(a => matchesFilter(a) && matchesQuery(a));
  }, [artworks, filters, searchQuery]);

  const ids = useMemo(() => filtered.map(a => a.id), [filtered]);

  const getIndex = useCallback((id: number) => ids.indexOf(id), [ids]);

  if (isLoading) return <div className="gallery-container"><div className="loading">Loading gallery...</div></div>;
  if (error) return <div className="gallery-container"><div className="error">{error}</div></div>;

  return (
    <div className="gallery-container">
      <h1>Gallery</h1>
      <div className="controls">
        <input
          className="search-input"
          placeholder="Search by title, artist, origin..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div className="filters">
          <div className="filter-group">
            <div className="filter-title">Classification</div>
            <div className="chips">
              {uniqueValues.classification.map(v => (
                <label key={v} className={`chip ${filters.classification.has(v) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filters.classification.has(v)}
                    onChange={() => toggleFilter('classification', v)}
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-title">Department</div>
            <div className="chips">
              {uniqueValues.department.map(v => (
                <label key={v} className={`chip ${filters.department.has(v) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filters.department.has(v)}
                    onChange={() => toggleFilter('department', v)}
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-title">Type</div>
            <div className="chips">
              {uniqueValues.type.map(v => (
                <label key={v} className={`chip ${filters.type.has(v) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={filters.type.has(v)}
                    onChange={() => toggleFilter('type', v)}
                  />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="clear-button" onClick={clearAll}>Clear filters</button>
      </div>

      <div className="results-info">Showing {filtered.length} of {artworks.length}</div>

      <div className="gallery-grid">
        {filtered.map(a => {
          const index = getIndex(a.id);
          return (
            <Link
              to={`/artwork/${a.id}`}
              state={{ ids, index, source: 'gallery' }}
              key={a.id}
              className="gallery-card"
            >
              <div className="img-wrap">
                {a.image_id ? (
                  <img
                    src={getImageUrl(a.image_id, '400')}
                    alt={a.title}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="meta">
                <div className="title" title={a.title}>{a.title}</div>
                <div className="sub">{a.artist_display || 'Unknown artist'}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GalleryView;


