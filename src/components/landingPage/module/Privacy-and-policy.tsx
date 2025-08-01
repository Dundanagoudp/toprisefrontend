import Image from "next/image"
import Footer from "./Footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div
        className="relative bg-gray-800 text-white py-8 px-6 bg-cover bg-center min-h-[250px] flex  items-center"
      >
      
        {/* Background image for header */}
        <Image src="/assets/herobg.jpg" alt="Background" fill className="object-cover" priority />
        <div className="relative container mx-auto px-4">
          <h1 className="text-3xl font-bold">Privacy and Policy</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-9">
          {/* First Section */}
          <section>
            <h2 className="text-5xl font-semibold font-sans text-[#131920] mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever
            </h2>
            <p className="text-[#61656A] text-lg font-sans leading-relaxed mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release
              of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
              like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
          </section>

          {/* Second Section */}
          <section>
              <h2 className="text-5xl font-semibold font-sans text-[#131920] mb-4">Lorem Ipsum is simply</h2>
            <p className="text-[#61656A] text-lg font-sans leading-relaxed mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release
              of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
              like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
                <h2 className="text-5xl font-semibold font-sans text-[#131920] mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever
            </h2>
            <p className="text-[#61656A] text-lg font-sans leading-relaxed mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release
              of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
              like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
          </section>

          {/* Second Section */}
          <section>
              <h2 className="text-5xl font-semibold font-sans text-[#131920] mb-4">Lorem Ipsum is simply</h2>
            <p className="text-[#61656A] text-lg font-sans leading-relaxed mb-4">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release
              of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software
              like Aldus PageMaker including versions of Lorem Ipsum.
            </p>
          </section>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
