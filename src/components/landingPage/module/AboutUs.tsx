'use client'

import Image from "next/image"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { easeInOut } from "framer-motion"

interface AboutSectionProps {
  title: string
  content: string
  imageSrc: string
  imageAlt: string
  imagePosition: "left" | "right"
}

function AboutSection({ title, content, imageSrc, imageAlt, imagePosition }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  
  // Scroll-based parallax for the entire section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  // Parallax transforms
  const imageY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"])
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1])

  // Enhanced staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  }

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      x: imagePosition === "left" ? -30 : 30
    },
    visible: { 
      opacity: 1, 
      y: 0,
      x: 0,
      transition: {
        duration: 0.8,
        ease: easeInOut
      }
    }
  }

  const imageVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      x: imagePosition === "left" ? -50 : 50,
      rotateY: imagePosition === "left" ? -15 : 15
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: easeInOut
      }
    }
  }

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
        className={`space-y-4 ${imagePosition === "left" ? "lg:col-start-2" : ""}`}
        style={{ y: textY }}
        variants={textVariants}
      >
        <motion.h3 
          className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight"
          variants={textVariants}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-gray-600 leading-relaxed text-base md:text-lg"
          variants={textVariants}
        >
          {content}
        </motion.p>
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
            transition: { duration: 0.3 }
          }}
        >
          <motion.div
            style={{ scale: imageScale }}
            className="w-full h-full"
          >
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
  )
}

export default function AboutUs() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 })
  
  // Header parallax
  const { scrollYProgress: headerScrollProgress } = useScroll({
    target: headerRef,
    offset: ["start end", "end start"]
  })
  
  const headerY = useTransform(headerScrollProgress, [0, 1], ["0%", "-15%"])

  const aboutSections = [
    {
      title: "Lorem Ipsum is simply",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      imageSrc: "/assets/Engineers.jpg",
      imageAlt: "Team collaboration",
      imagePosition: "right" as const,
    },
    {
      title: "Lorem Ipsum is simply",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      imageSrc: "/assets/Gear.jpg",
      imageAlt: "Workplace environment",
      imagePosition: "left" as const,
    },
    // {
    //   title: "Our Mission & Vision",
    //   content:
    //     "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
    //   imageSrc: "/assets/AboutUs.jpg",
    //   imageAlt: "Mission and vision",
    //   imagePosition: "right" as const,
    // },
  ]

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      }
    }
  }

  const headerItemVariants = {
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeInOut // use a valid easing function for ease
      }
    }
  }

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
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 w-full"
            variants={headerItemVariants}
          >
           Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever
          </motion.h1>
          <motion.p 
            className="text-gray-600 leading-relaxed text-base md:text-lg w-full"
            variants={headerItemVariants}
          >
           Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
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
      </div>
    </section>
  )
}