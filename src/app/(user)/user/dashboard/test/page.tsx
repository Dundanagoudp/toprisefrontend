import AboutUs from "@/components/landingPage/module/AboutUs";
import HeroSection, { } from "@/components/landingPage/module/Hero";
import { Navbar } from "@/components/landingPage/module/Navbar";

const Page = () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AboutUs/>

    </>
  );
};

export default Page;
