import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getArtworkById, getImageUrl } from '../services/artworkService';
import { Artwork } from '../types/artwork';
import './DetailView.css';

type LocationState = {
  ids?: number[];
  index?: number;
  source?: string;
};

const DetailView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getArtworkById(Number(id));
        setArtwork(data);
      } catch (e) {
        setError('Failed to load artwork.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const ids = useMemo(() => state.ids || [], [state.ids]);
  const index = useMemo(() => state.index ?? (ids ? ids.indexOf(Number(id)) : -1), [state.index, ids, id]);

  const canPrev = index > 0;
  const canNext = index >= 0 && index < ids.length - 1;

  const goPrev = () => {
    if (!canPrev) return;
    const prevId = ids[index - 1];
    navigate(`/artwork/${prevId}`, { state: { ids, index: index - 1, source: state.source } });
  };

  const goNext = () => {
    if (!canNext) return;
    const nextId = ids[index + 1];
    navigate(`/artwork/${nextId}`, { state: { ids, index: index + 1, source: state.source } });
  };

  if (loading) return <div className="detail-container"><div className="loading">Loading...</div></div>;
  if (error) return <div className="detail-container"><div className="error">{error}</div></div>;
  if (!artwork) return null;

  return (
    <div className="detail-container">
      <div className="detail-header">
        <Link to={state.source === 'gallery' ? '/gallery' : '/list'} className="back-link">← Back</Link>
        <div className="spacer" />
        <div className="pager">
          <button className="nav-btn" onClick={goPrev} disabled={!canPrev} aria-label="Previous">‹</button>
          <button className="nav-btn" onClick={goNext} disabled={!canNext} aria-label="Next">›</button>
        </div>
      </div>

      <div className="detail-body">
        <div className="image-wrap">
          {artwork.image_id ? (
            <img src={getImageUrl(artwork.image_id, '843')} alt={artwork.title} />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>
        <div className="meta">
          <h2>{artwork.title}</h2>
          <div className="row"><span className="label">Artist</span><span className="val">{artwork.artist_display || 'Unknown'}</span></div>
          <div className="row"><span className="label">Date</span><span className="val">{artwork.date_display || 'Unknown'}</span></div>
          <div className="row"><span className="label">Origin</span><span className="val">{artwork.place_of_origin || 'Unknown'}</span></div>
          <div className="row"><span className="label">Medium</span><span className="val">{artwork.medium_display || 'Unknown'}</span></div>
          <div className="row"><span className="label">Dimensions</span><span className="val">{artwork.dimensions || 'Unknown'}</span></div>
          <div className="row"><span className="label">Credit</span><span className="val">{artwork.credit_line || 'Unknown'}</span></div>
          <div className="row"><span className="label">Type</span><span className="val">{artwork.artwork_type_title || 'Unknown'}</span></div>
          <div className="row"><span className="label">Style</span><span className="val">{artwork.style_title || 'Unknown'}</span></div>
          <div className="row"><span className="label">Classification</span><span className="val">{artwork.classification_title || 'Unknown'}</span></div>
          <div className="row"><span className="label">Department</span><span className="val">{artwork.department_title || 'Unknown'}</span></div>
          <div className="row"><span className="label">Public Domain</span><span className="val">{artwork.is_public_domain ? 'Yes' : 'No'}</span></div>
          <div className="row"><span className="label">Ref #</span><span className="val">{artwork.main_reference_number}</span></div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;


