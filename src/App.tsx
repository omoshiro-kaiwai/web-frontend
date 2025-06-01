import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import BlogPostPage from './pages/BlogPostPage';
import BlogListPage from './pages/BlogListPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
