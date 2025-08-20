import Header from "../components/Header";
import Hero from "../components/Hero";
import VehicleGrid from "../components/VehicleGrid";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <VehicleGrid />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
