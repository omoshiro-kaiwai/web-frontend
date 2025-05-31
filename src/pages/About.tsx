import './About.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

const About: React.FC = () => {
    return (
    <div className="about-page-container">
      <Header />

      <main className="main-content">
        <div className="container">
            <header className="page-header">
                <h1>About Us</h1>
            </header>
            <div className="no-abouts-message">
              <p>このページは準備中です。</p>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;