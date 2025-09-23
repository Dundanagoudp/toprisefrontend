'use client';
import Link from "next/link";
import Image from "next/image";
import ContactDialog from "./popup/contactus";
import { on } from "events";
import { useState } from "react";
import { FaInstagram, FaGooglePlay } from "react-icons/fa";
export default function Footer() {
    const [contactUsOpen, setContactUsOpen] = useState(false);
    const [isOpen , setIsOpen] = useState<boolean>(false);

  const handleContactUsClick = () => {
    setContactUsOpen(true);
    setIsOpen(false);
  };

  const footerLinks = [
    { label: "Contact us", href: "/contactus" },
  
    { label: "Terms & Conditions", href: "/TermsAndConditions" },
    { label: "Privacy Policy", href: "/PrivacyPolicy" },
    { label: "Shipping & Returns", href: "/ShippingAndReturnPolicy" },
    
  ];

  return (
    <footer className="bg-[#1F1F1F] text-white py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Section - Company Info */}
        <div>
          <Image
            src="/assets/LogoNoname.png"
            alt="Toprise Ventures logo"
            width={80}
            height={40}
            className="mb-3 h-auto w-auto"
            priority
          />
          <h3 className="text-lg font-semibold tracking-wide mb-2">
            TOPRISE VENTURES
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mb-4">
          Get Genuine Spare Parts of your Vehicle – Quick Shopping & Rapid Delivery.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-xl transition-colors"
            >
              <FaInstagram />
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-xl transition-colors"
            >
              <FaGooglePlay />
            </a>
          </div>
        </div>

        {/* Right Section - Quick Links */}
        <div className="md:justify-self-end md:text-right">
          <h4 className="text-md font-semibold mb-4">Quick Links</h4>
          <nav className="flex flex-col items-end space-y-3">
            {footerLinks.map((link, index) => (
              <div key={index}>
                {link.href ? (
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 block text-sm"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={link.onClick}
                    className="text-gray-400 hover:text-white transition-colors duration-200 block bg-transparent border-none p-0 m-0 cursor-pointer text-sm"
                  >
                    {link.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 pt-6 mt-8">
        <p className="text-gray-500 text-sm text-center">
          © 2025 Toprise Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}