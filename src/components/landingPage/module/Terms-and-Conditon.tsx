import Image from "next/image";
import Footer from "./Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative bg-gray-800 text-white py-8 px-6 bg-cover bg-center min-h-[250px] flex  items-center">
        {/* Background image for header */}
        <Image
          src="/assets/herobg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="relative container mx-auto px-4">
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-9">
          {/* First Section */}
     <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">1. Shipping Policy</h2>
            <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
              <li><strong>Delivery Coverage:</strong> We currently deliver across all major pin codes in India. Certain remote or restricted areas may be excluded and you will be notified at checkout.</li>
              <li><strong>Shipping Timelines:</strong> Standard delivery times vary by location and product type:
                <ul className="list-disc pl-8 my-2">
                  <li>Metro cities: 2–5 business days</li>
                  <li>Tier 2/3 cities & rural: 5–9 business days</li>
                  <li>Estimated dates shown at checkout are indicative, not guaranteed.</li>
                </ul>
              </li>
              <li><strong>Dispatch Timelines:</strong> Products are dispatched within 24–72 hours of order confirmation (excluding Sundays & public holidays). Some products (dealer-sourced, make-to-order, heavy spares) may have longer dispatch windows, which will be mentioned on the product page.</li>
              <li><strong>Shipping Charges:</strong> Free shipping for orders above ₹999. Orders below may attract a nominal shipping fee (₹40–₹150) based on weight, dimensions, and location.</li>
              <li><strong>Order Tracking:</strong> Once dispatched, tracking details are shared via Email, WhatsApp, SMS, and the “My Orders” section in your Toprise account. We use leading courier/logistics partners and offer end-to-end tracking.</li>
              <li><strong>Delayed Deliveries:</strong> Toprise is not liable for delivery delays caused by courier/3rd-party logistics issues, natural disasters, strikes, lockdowns, or incorrect/incomplete address details. Support will assist you in escalating or rescheduling.</li>
            </ul>
          </section>

          {/* 2. Order Cancellation Policy */}
          <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">2. Order Cancellation Policy</h2>
            <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
              <li><strong>Before Dispatch:</strong> Orders can be cancelled before dispatch by visiting the “My Orders” section or contacting customer support. A full refund will be initiated to your original payment method.</li>
              <li><strong>After Dispatch:</strong> Orders cannot be cancelled once dispatched. You may refuse delivery, but cancellation after dispatch may attract reverse logistics charges (₹80–₹300, depending on location and item type).</li>
              <li><strong>Non-Cancellable Products:</strong> Some products are marked as non-cancellable or non-returnable, such as electrical/electronic components, engine parts, made-to-order items. This will be clearly stated on the product page and invoice.</li>
            </ul>
          </section>

          {/* 3. Return & Replacement Policy */}
          <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">3. Return & Replacement Policy</h2>
            <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
              <li><strong>Return Window:</strong> Eligible items can be returned or exchanged within 7 days of delivery. Return requests must be initiated through the Toprise app/website, WhatsApp, or customer support.</li>
              <li><strong>Return Eligibility:</strong> Returns are accepted if:
                <ul className="list-disc pl-8 my-2">
                  <li>Wrong product delivered</li>
                  <li>Product is damaged, broken, or non-functional</li>
                  <li>Product is significantly different from its listing (wrong fitment, missing parts, incorrect variant)</li>
                </ul>
              </li>
              <li><strong>Return Conditions:</strong> Product must be unused, uninstalled, and in original condition with original box, tags, packing, all accessories/manuals, and invoice copy. Returns failing these criteria may be rejected or processed with partial refund.</li>
              <li><strong>Non-Returnable Items:</strong> Oils, lubricants, coolants, sprays, electrical sensors or opened packaging, items marked “non-returnable” at sale, products installed or damaged by user.</li>
              <li><strong>Return Pickup:</strong> Return pickup will be arranged by Toprise via our logistics partner. If pickup is not serviceable, we may request you to self-ship and reimburse standard courier charges.</li>
            </ul>
          </section>

          {/* 4. Refund & Replacement Policy */}
          <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">4. Refund & Replacement Policy</h2>
            <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
              <li><strong>Refund Timeline:</strong> Refund is processed after the product is received and quality-checked at our warehouse or dealer location.
                <ul className="list-disc pl-8 my-2">
                  <li>Prepaid orders: 5–7 working days</li>
                  <li>COD orders: 7–10 working days via bank transfer (you’ll be asked for your account details)</li>
                </ul>
              </li>
              <li><strong>Refund Method:</strong> Refund is made to the original payment method or user-provided bank account. You will be notified via email/WhatsApp once processed.</li>
              <li><strong>Replacement Policy:</strong> Replacements are sent only if the same product (in stock) is available. Otherwise, refund will be issued.</li>
            </ul>
          </section>

          {/* 5. Damaged or Missing Items */}
          <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">5. Damaged or Missing Items</h2>
            <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
              <li>If your order is damaged on arrival or has missing components/parts, please notify us within 48 hours of delivery by submitting clear photos of the item and packaging, and sharing unboxing video (if available). We will verify and process resolution on priority.</li>
            </ul>
          </section>

          {/* 6. Return Abuse & Fraud Prevention */}
          <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">6. Return Abuse & Fraud Prevention</h2>
            <ul className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 list-disc pl-6">
              <li>To protect our dealer network and ensure fair usage, excessive return frequency, fake/damaged item returns, or deliberate damage may lead to account suspension, refund rejections, or legal action if fraud is detected.</li>
            </ul>
          </section>

          {/* 7. Contact & Support */}
          <section>
            <h2 className="text-4xl font-semibold font-sans text-[#131920] mb-4">7. Contact & Support</h2>
            <div className="text-[#61656A] text-lg font-sans leading-relaxed mb-4 pl-1">
              <p>
                For shipping, delivery, return or refund queries:<br />
                Email: info@Toprise.in<br />
                Phone: +91 9122221804<br />
                Registered Office: A-924, Tower 3, NX One, Gaur Chowk, Plot No. 17, Tech Zone IV, Amrapali Dream Valley, Greater Noida, Uttar Pradesh 201301
              </p>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
