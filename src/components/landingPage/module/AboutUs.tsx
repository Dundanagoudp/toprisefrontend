import Image from "next/image"

interface AboutSectionProps {
  title: string
  content: string
  imageSrc: string
  imageAlt: string
  imagePosition: "left" | "right"
}

function AboutSection({ title, content, imageSrc, imageAlt, imagePosition }: AboutSectionProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-16 ${
        imagePosition === "left" ? "lg:grid-flow-col-dense" : ""
      }`}
    >
      {/* Text Content */}
      <div className={`space-y-4 ${imagePosition === "left" ? "lg:col-start-2" : ""}`}>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-base md:text-lg">{content}</p>
      </div>

      {/* Image */}
      <div className={`${imagePosition === "left" ? "lg:col-start-1" : ""}`}>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={imageAlt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  )
}

export default function AboutUs() {
  const aboutSections = [
    {
      title: "Lorem Ipsum is simply",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      imageSrc: "/assets/AboutUs.jpg",
      imageAlt: "Team collaboration",
      imagePosition: "right" as const,
    },
    {
      title: "Lorem Ipsum is simply",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
       imageSrc: "/assets/AboutUs.jpg",
      imageAlt: "Workplace environment",
      imagePosition: "left" as const,
    },
    {
      title: "Our Mission & Vision",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
       imageSrc: "/assets/AboutUs.jpg",
      imageAlt: "Mission and vision",
      imagePosition: "right" as const,
    },
  ]

  return (
  <section className="py-16 bg-white">
  <div className="container mx-auto ">
        {/* Header Section */}
        <div className="mb-16">
          <h2 className="text-[#C72920] text-4xl font-bold font-sans mb-4">About Us</h2>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever
          </h1>
          <p className="text-gray-600 leading-relaxed text-base md:text-lg max-w-4xl">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
            electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
            Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        </div>

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
