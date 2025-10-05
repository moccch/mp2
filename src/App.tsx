import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import DetailView from './components/DetailView';
import './App.css';

function App() {
  const basename = process.env.NODE_ENV === 'production' ? '/mp2' : '/';
  return (
    <Router basename={basename}>
      <div className="App">
        <nav className="nav-bar">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/list" className="nav-link">Browse Artworks</Link>
          <Link to="/gallery" className="nav-link">Gallery</Link>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="home-page">
              <h1>Welcome to the Art Institute of Chicago Collection</h1>
              <p>Explore thousands of artworks from one of the world's premier art museums.</p>
              <Link to="/list" className="cta-button">Start Browsing</Link>
            </div>
          } />
          <Route path="/list" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/artwork/:id" element={<DetailView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
