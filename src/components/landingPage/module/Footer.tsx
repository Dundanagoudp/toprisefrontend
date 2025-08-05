import Link from "next/link";

export default function Footer() {
  const footerLinks = [
    { label: "About us", href: "#about" },
  
    { label: "Terms & Conditions", href: "/TermsAndConditions" },
    { label: "Privacy & Policy", href: "/PrivacyPolicy" },
    { label: "Shipping & Returns", href: "/ShippingAndReturnPolicy" },
    
  ];

  return (
    <footer className="bg-[#1F1F1F] text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Company Info Section */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4 tracking-wide">
              TOPRISE VENTURES
            </h3>
            {/* <p className="text-gray-300 leading-relaxed max-w-md">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the.
            </p> */}
          </div>

          {/* Quick Links Section */}
          <div>
            <nav className="space-y-3">
              {footerLinks.map((link, index) => (
                <div key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 block"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-sm text-center">
            © 2025 Toprise Pvt. Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
