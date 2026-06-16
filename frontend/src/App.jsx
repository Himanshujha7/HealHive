import CTA from './Homepage/CTA';
import Footer from './Homepage/footer';
import Hero from './Homepage/Hero';
import HowItWorks from './Homepage/HowItWorks';
import KeyFeatures from './Homepage/KeyFeatures';
import Navbar from './Homepage/Navbar';
import Specialties from './Homepage/Specialties';
import BackToTop from './Homepage/BackToTop';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Specialties />
      <KeyFeatures />
      <CTA />
      <Footer />
      <BackToTop />
    </>
  );
}

export default App;
