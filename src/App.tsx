import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import BlogPostPage from './pages/BlogPostPage';
import BlogListPage from './pages/BlogListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blogs" element={<BlogListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
