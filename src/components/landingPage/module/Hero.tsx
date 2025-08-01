import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/assets/herobg.jpg" alt="Background" fill className="object-cover" priority />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 container mx-auto px-4 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left Side - Text Content */}
          <div className="text-white space-y-6">
            <h1 className="font-sans font-bold text-[#ffffff] text-[58px]">Coming Soon</h1>
            <p className="font-sans font-bold text-[#ffffff] text-[48px]">
              Find the Perfect Spare Part for Your Vehicle - Fast and Easy
            </p>
            {/* <div className="pt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                Get Notified
              </button>
            </div> */}
          </div>

          {/* Right Side - Image Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone mockup container */}
              <div className="relative w-64 h-96 md:w-80 md:h-[480px]">
                {/* Phone frame */}
                <div className="absolute inset-0 bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                    {/* You can replace this with your actual image */}
                    <Image
                      src="/placeholder.svg?height=480&width=320"
                      alt="Mobile App Preview"
                      width={320}
                      height={480}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Phone notch */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-800 rounded-full"></div>
              </div>

              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-[2.5rem] border-2 border-blue-400/30 shadow-lg shadow-blue-400/20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
