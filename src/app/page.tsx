import AboutUs from "@/components/landingPage/module/AboutUs";
import Footer from "@/components/landingPage/module/Footer";
import HeroSection, { } from "@/components/landingPage/module/Hero";
import { Navbar } from "@/components/landingPage/module/Navbar";

const Page = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutUs/>
      <Footer/>

    </>
  );
};

export default Page;
