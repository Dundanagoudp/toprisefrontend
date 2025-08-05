"use client";

import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { easeInOut } from "framer-motion";

interface AboutSectionProps {
  title: string;
  content: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}

function AboutSection({
  title,
  content,
  imageSrc,
  imageAlt,
  imagePosition,
}: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Scroll-based parallax for the entire section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax transforms
  const imageY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  // Enhanced staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      x: imagePosition === "left" ? -30 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
  };

  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      x: imagePosition === "left" ? -50 : 50,
      rotateY: imagePosition === "left" ? -15 : 15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: easeInOut,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16 ${
        imagePosition === "left" ? "lg:grid-flow-col-dense" : ""
      }`}
    >
      {/* Text Content with Parallax */}
      <motion.div
        className={`space-y-4 ${
          imagePosition === "left" ? "lg:col-start-2" : ""
        }`}
        style={{ y: textY }}
        variants={textVariants}
      >
        <motion.h3
          className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight"
          variants={textVariants}
        >
          {title}
        </motion.h3>
        <motion.div
          className="text-gray-600 leading-relaxed text-base md:text-lg space-y-4"
          variants={textVariants}
        >
          {content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </motion.div>
      </motion.div>

      {/* Image with Enhanced Parallax */}
      <motion.div
        className={`${imagePosition === "left" ? "lg:col-start-1" : ""}`}
        variants={imageVariants}
      >
        <motion.div
          className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg"
          style={{ y: imageY }}
          whileHover={{
            scale: 1.02,
            rotateY: imagePosition === "left" ? 5 : -5,
            transition: { duration: 0.3 },
          }}
        >
          <motion.div style={{ scale: imageScale }} className="w-full h-full">
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={imageAlt}
              fill
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AboutUs() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });

  // Header parallax
  const { scrollYProgress: headerScrollProgress } = useScroll({
    target: headerRef,
    offset: ["start end", "end start"],
  });

  const headerY = useTransform(headerScrollProgress, [0, 1], ["0%", "-15%"]);

  const aboutSections = [
    {
      title: "What We Do",
      content:
        "Smart Product Discovery: We make it easy for dealers and retailers to find exact-fit parts using advanced filters based on vehicle make, model and variant eliminating guesswork. Our intuitive search system ensures precision and saves valuable time.\n\nVerified Sourcing Network: Our platform hosts a curated network of trusted manufacturers and distributors, ensuring quality, competitive pricing, and consistent supply. Every partner is thoroughly vetted to maintain our high standards.\n\nReal-Time Inventory & Fulfilment: With live inventory visibility, multi-location stocking, and intelligent order routing, Toprise ensures swift order fulfilment and reduced downtime. Our system optimizes delivery routes for maximum efficiency.\n\nDealer-Centric Technology: We empower our partners with mobile-first tools to manage orders, returns, claims, and logistics seamlessly, all from a unified dashboard. Everything you need is at your fingertips.",
      imageSrc: "/assets/Engineers.jpg",
      imageAlt: "Team collaboration",
      imagePosition: "right" as const,
    },
    {
      title: "Why Toprise?",
      content:
        "Fast Fulfilment: Integrated logistics and real-time inventory mapping across regions.\n\nPrecise Fitment Matching: Reduce returns and increase satisfaction with exact-fit assurance.\n\nParts for Every Need: From consumables to premium assemblies, we cover the entire spectrum of 2-wheeler and 4-wheeler spare parts.\n\nMulti-Channel Access: Order via mobile app, website, WhatsApp, or direct call, we’re built for the way dealers work.\n\nEasy Returns & Claims: Transparent workflows and verified inspection at pickup for hassle-free returns.",
      imageSrc: "/assets/Gear.jpg",
      imageAlt: "Workplace environment",
      imagePosition: "left" as const,
    },
    {
      title: "Our Mission ",
      content:
        "To revolutionize India’s automotive aftermarket by enabling faster access, better transparency, and stronger business outcomes for every link in the parts supply chain.",
      imageSrc: "/assets/AboutUs.jpg",
      imageAlt: "Mission and vision",
      imagePosition: "right" as const,
    },
    {
      title: "Who We Serve",
      content:
        "Distributors & Dealers looking for better reach, digitization, and streamlined inventory movement.\n\nRetailers & Workshops seeking accurate, timely part deliveries.\n\nManufacturers & OEMs aiming for deeper visibility and channel control.",
      imageSrc: "/assets/Car-Accessories.webp",
      imageAlt: "Mission and vision",
      imagePosition: "left" as const,
    },
  ];

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const headerItemVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeInOut, // use a valid easing function for ease
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Enhanced Header Section with Parallax */}
        <motion.div
          ref={headerRef}
          className="mb-16 text-left"
          style={{ y: headerY }}
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <motion.h2
            className="text-[#C72920] text-4xl font-bold font-sans mb-4"
            variants={headerItemVariants}
          >
            About Us
          </motion.h2>
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl  text-gray-900 leading-tight mb-6 w-full"
            variants={headerItemVariants}
          >
            <strong>Toprise Ventures</strong> is a next-generation e-commerce
            and distribution platform transforming the way automotive spare
            parts are discovered, ordered, and fulfilled across India.
          </motion.h1>
          <motion.p
            className="text-gray-600 leading-relaxed text-base md:text-lg w-full"
            variants={headerItemVariants}
          >
            Founded with a vision to simplify and digitize the spare parts
            supply chain, Toprise brings together manufacturers, distributors,
            dealers, and retailers onto a single, trusted platform. We bridge
            the gap between availability and accessibility by offering a
            powerful ecosystem designed specifically for the complex and
            unorganized automotive parts market.
          </motion.p>
        </motion.div>

        {/* Dynamic About Sections */}
        <div>
          {aboutSections.map((section, index) => (
            <AboutSection
              key={index}
              title={section.title}
              content={section.content}
              imageSrc={section.imageSrc}
              imageAlt={section.imageAlt}
              imagePosition={section.imagePosition}
            />
          ))}
        </div>
        <motion.div className="text-center">
          <motion.p
            className="text-gray-600 leading-relaxed text-base md:text-lg w-full"
            variants={headerItemVariants}
          >
            <strong>Join the Toprise Network</strong>
            <br />
            Whether you're a parts manufacturer, distributor, or dealer: let’s
            scale together.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
