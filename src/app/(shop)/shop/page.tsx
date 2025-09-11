"use client";

import { useState, useCallback } from "react";
import AboutUs from "@/components/landingPage/module/AboutUs";
import Footer from "@/components/landingPage/module/Footer";
import HeroSection, { } from "@/components/landingPage/module/Hero";
import { Navbar } from "@/components/landingPage/module/Navbar";
import Homepage from "@/components/webapp/Homepage";
import { Header } from "@/components/webapp/layout/Header";
import BannerSection from "@/components/webapp/modules/pages/Home/banner/Banner";

const Page = () => {
  const [filters, setFilters] = useState<{
    brand?: string;
    model?: string;
    variant?: string;
    year?: string;
  }>({});

  const handleFiltersChange = useCallback((newFilters: {
    brand?: string;
    model?: string;
    variant?: string;
    year?: string;
  }) => {
    setFilters(newFilters);
  }, []);

  return (
    <>
      <Header />
      <BannerSection onFiltersChange={handleFiltersChange}/>
      <Homepage filters={filters}/>
      <Footer/>
    </>
  );
};

export default Page;
