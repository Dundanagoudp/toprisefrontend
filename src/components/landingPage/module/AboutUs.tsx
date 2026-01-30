"use client";

import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import DynamicButton from "@/components/common/button/button";
import ContactDialog from "./popup/contactus";

// Ensure ContactDialog accepts props: open and onClose
interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const TypedContactDialog = ContactDialog as React.FC<ContactDialogProps>;
import { easeInOut } from "framer-motion";

interface AboutSectionProps {
  title: string;
  content: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: "left" | "right";
  showImage?: boolean;
}

function AboutSection({
  title,
  content,
  imageSrc,
  imageAlt,
  imagePosition,
  showImage = true,
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
      className={`grid grid-cols-1 ${showImage ? "lg:grid-cols-2" : ""} gap-8 items-center mb-16 ${
        imagePosition === "left" && showImage ? "lg:grid-flow-col-dense" : ""
      }`}
    >
      {/* Text Content with Parallax */}
      <motion.div
        className={`space-y-4 ${
          imagePosition === "left" && showImage ? "lg:col-start-2" : ""
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
            <p key={index} className="mb-4 last:mb-0 text-justify">
              {paragraph}
            </p>
          ))}
        </motion.div>
      </motion.div>

      {/* Image with Enhanced Parallax */}
      {showImage && (
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
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AboutUs() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const [contactUsOpen, setContactUsOpen] = useState(false);

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
        "Toprise makes it easy for dealers and retailers to find exact-fit parts through advanced filters by vehicle make, model, and variant—eliminating guesswork. We operate a curated, verified network of manufacturers and distributors to ensure quality, competitive pricing, and consistent supply. With real-time inventory visibility, multi-location stocking, and intelligent order routing, we enable swift fulfillment and reduced downtime. Our dealer-centric, mobile-first tools let partners manage orders, returns, claims, and logistics seamlessly from a unified dashboard.",
      imageSrc: "/assets/Engineers.jpg",
      imageAlt: "Team collaboration",
      imagePosition: "right" as const,
    },
    {
      title: "Why Toprise?",
      content:
        "Choose Toprise for fast fulfilment powered by integrated logistics and live inventory mapping across regions. Our precise fitment matching reduces returns and increases satisfaction. We cover the full spectrum of two-wheeler and four-wheeler parts—from consumables to premium assemblies—accessible via mobile app, website, WhatsApp, or direct call, built for the way dealers work. Returns and claims are straightforward with transparent workflows and verified inspections at pickup.",
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
        "We serve distributors and dealers seeking broader reach, digitization, and streamlined inventory movement; retailers and workshops that need accurate, on-time deliveries; and manufacturers and OEMs looking for deeper visibility and control across their channels.",
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
    <section ref={sectionRef} id="about" className="py-16 bg-white overflow-hidden">
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
            className="text-[#C72920] text-6xl md:text-7xl font-bold font-sans mb-4"
            variants={headerItemVariants}
          >
            About Us
          </motion.h2>
          <motion.h1
            className="text-xl md:text-2xl lg:text-3xl text-justify  text-gray-900 leading-tight mb-6 w-full"
            variants={headerItemVariants}
          >
            <strong>Toprise Ventures</strong> is a next-generation e-commerce
            and distribution platform transforming the way automotive spare
            parts are discovered, ordered, and fulfilled across India.
          </motion.h1>
          <motion.p
            className="text-gray-600 leading-relaxed text-lg text-justify md:text-xl w-full"
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

        {/* Why Us Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Why Us?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Asli Parts. Full Stop.",
                description: "Genuine parts sourced from authorised distributors—no fakes, no compromises."
              },
              {
                title: "No Wrong Turns. Just Right Parts.",
                description: "Search by brand/model/variant to get the right fit, first time and then every time."
              },
              {
                title: "No Markup Natak.",
                description: "Transparent pricing on genuine spares. No last-minute surprises!"
              },
              {
                title: "Your Quick Fix.",
                description: "Fast delivery across India, with same-day delivery in NCR."
              },
              {
                title: "All Parts. No Hunt.",
                description: "Thousands of spares for bikes, scooters & cars. Everything from regular replacements to urgent fixes."
              },
              {
                title: "Got Your Back (and Front).",
                description: "Track all deliveries, dispatches and queries in real time for every single parts."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
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
              showImage={index < 2}
            />
          ))}
        </div>
        <motion.div className="text-center">
          <motion.p
            className="text-gray-600 leading-relaxed text-lg text-justify md:text-xl w-full"
            variants={headerItemVariants}
          >
            <strong>Join the Toprise Network</strong>
            <br />
            Whether you're a parts manufacturer, distributor, or dealer: let’s
            scale together.
          </motion.p>
          <div className="mt-6 flex justify-center">
     
          </div>
        </motion.div>
      </div>
      <TypedContactDialog
        open={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
      />
    </section>
  );
}
