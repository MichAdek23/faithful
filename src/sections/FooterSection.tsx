import { Phone, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

// Define prop types for the modals
interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode | null;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

// Modal Component
const PolicyModal = ({ isOpen, onClose, title, content }: PolicyModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-poppins font-semibold text-[#002855] text-xl">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 130px)" }}>
          <div className="font-poppins text-gray-700 space-y-4 pb-8">
            {content}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end z-10">
          <Button
            onClick={onClose}
            className="bg-[#002855] text-white font-poppins hover:bg-[#002855]/90"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple notification modal for unavailable features
const NotificationModal = ({ isOpen, onClose, message }: NotificationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h3 className="font-poppins font-semibold text-[#002855] text-xl">
            Notification
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-8">
          <p className="font-poppins text-gray-700 text-center">
            {message}
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-[#002855] text-white font-poppins hover:bg-[#002855]/90"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Define the modal state types
interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode | null;
}

interface NotificationState {
  isOpen: boolean;
  message: string;
}

export const FooterSection = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    content: null,
  });

  const [notificationState, setNotificationState] = useState<NotificationState>({
    isOpen: false,
    message: "",
  });

  const contactInfo = [
    {
      icon: Phone,
      text: "0747 305 2794",
      href: "tel:07473052794",
    },
    {
      icon: Mail,
      text: "faithfulautocare00@gmail.com",
      href: "mailto:faithfulautocare00@gmail.com",
    },
  ];

  const companyLinks = ["About", "Company", "Blog", "Employee Handbook"];

  // Policy content
  const policyContent = {
    terms: (
      <>
        <h4 className="font-semibold text-lg">Terms and Conditions – Car Detailing Services</h4>
        <p>Last updated: 26th February 2026</p>
        <p>Business name: Faithful Auto Care</p>
        <p>Service area: United Kingdom</p>
        <p>By booking or using our services, you agree to the following Terms and Conditions.</p>

        <h5 className="font-semibold mt-4">1. Services</h5>
        <p>We provide mobile car detailing and valeting services, which may include exterior cleaning, interior cleaning, polishing, waxing, and other related services as agreed at the time of booking.</p>
        <p>All services are carried out to a professional standard based on the condition of the vehicle at the time of service.</p>

        <h5 className="font-semibold mt-4">2. Bookings</h5>
        <p>Bookings can be made via phone, message, social media, or online.</p>
        <p>All bookings are subject to availability.</p>
        <p>By confirming a booking, you confirm that the vehicle will be available at the agreed time and location.</p>

        <h5 className="font-semibold mt-4">3. Pricing & Payments</h5>
        <p>Prices are based on vehicle size, condition, and the selected package.</p>
        <p>Heavily soiled vehicles may incur an additional charge, which will be discussed before work continues.</p>
        <p>Payment is due immediately after the service is completed unless agreed otherwise.</p>
        <p>Accepted payment methods: [cash / bank transfer / card / online payment].</p>

        <h5 className="font-semibold mt-4">4. Cancellations & Rescheduling</h5>
        <p>We ask for at least 24 hours' notice for cancellations or rescheduling.</p>
        <p>Late cancellations or no-shows may be charged a cancellation fee.</p>
        <p>We reserve the right to cancel or reschedule due to weather conditions, equipment failure, or other circumstances beyond our control.</p>

        <h5 className="font-semibold mt-4">5. Access & Safety</h5>
        <p>The customer must ensure safe and legal access to the vehicle.</p>
        <p>The vehicle must be parked in a suitable location with enough space to work.</p>
        <p>We are not responsible for delays or incomplete work caused by unsafe conditions, lack of access, or interruptions.</p>

        <h5 className="font-semibold mt-4">6. Vehicle Condition</h5>
        <p>We are not responsible for pre-existing damage such as scratches, dents, paint defects, worn interiors, or mechanical issues.</p>
        <p>Some stains, marks, or defects may not be fully removable.</p>
        <p>We will always aim to improve the vehicle's appearance but do not guarantee complete restoration.</p>

        <h5 className="font-semibold mt-4">7. Damage & Liability</h5>
        <p>We take care when working on all vehicles.</p>
        <p>Any damage caused directly by us must be reported before we leave the job location.</p>
        <p>Our liability is limited to the cost of the service provided.</p>
        <p>We are not liable for indirect or consequential losses.</p>

        <h5 className="font-semibold mt-4">8. Personal Belongings</h5>
        <p>Customers are responsible for removing personal belongings before the service.</p>
        <p>We are not responsible for loss or damage to items left in the vehicle.</p>

        <h5 className="font-semibold mt-4">9. Satisfaction</h5>
        <p>If you are not satisfied with the service, please inform us immediately.</p>
        <p>We will make reasonable efforts to resolve the issue at the time of service.</p>

        <h5 className="font-semibold mt-4">10. Refusal of Service</h5>
        <p>We reserve the right to refuse or stop work if:</p>
        <p>The vehicle condition poses a health or safety risk</p>
        <p>The customer behaves in a threatening or abusive manner</p>
        <p>Payment issues arise</p>

        <h5 className="font-semibold mt-4">11. Photos & Marketing</h5>
        <p>We may take before-and-after photos of vehicles for marketing purposes. No personal details or number plates will be shown unless permission is given.</p>

        <h5 className="font-semibold mt-4">12. Data Protection</h5>
        <p>Customer information is used only for booking, communication, and service purposes and will not be shared with third parties.</p>

        <h5 className="font-semibold mt-4">13. Changes to Terms</h5>
        <p>We reserve the right to update these Terms and Conditions at any time. The latest version will apply to all bookings.</p>

        <h5 className="font-semibold mt-4">14. Governing Law</h5>
        <p>These Terms and Conditions are governed by the laws of England and Wales.</p>
      </>
    ),
    privacy: (
      <>
        <h4 className="font-semibold text-lg">Privacy Policy</h4>
        <p>Last updated: January 2024</p>
        
        <h5 className="font-semibold mt-4">1. Information We Collect</h5>
        <p>We collect information you provide directly to us, such as your name, email address, phone number, and vehicle information when you book our services or contact us.</p>
        
        <h5 className="font-semibold mt-4">2. How We Use Your Information</h5>
        <p>We use the information we collect to provide, maintain, and improve our services, communicate with you about appointments and promotions, and ensure the security of our operations.</p>
        
        <h5 className="font-semibold mt-4">3. Information Sharing</h5>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our business.</p>
        
        <h5 className="font-semibold mt-4">4. Data Security</h5>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure.</p>
        
        <h5 className="font-semibold mt-4">5. Your Rights</h5>
        <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
      </>
    ),
    cookies: (
      <>
        <h4 className="font-semibold text-lg">Cookies Policy</h4>
        <p>Last updated: April 2026</p>
        
        <h5 className="font-semibold mt-4">1. What Are Cookies</h5>
        <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience and understand how you use our site.</p>
        
        <h5 className="font-semibold mt-4">2. Types of Cookies We Use</h5>
        <p><strong>Essential Cookies:</strong> Necessary for the website to function properly.<br/>
        <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.<br/>
        <strong>Functional Cookies:</strong> Remember your preferences and settings.</p>
        
        <h5 className="font-semibold mt-4">3. How We Use Cookies</h5>
        <p>We use cookies to analyze website traffic, personalize content, remember your preferences, and improve our services.</p>
        
        <h5 className="font-semibold mt-4">4. Managing Cookies</h5>
        <p>You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website.</p>
        
        <h5 className="font-semibold mt-4">5. Third-Party Cookies</h5>
        <p>Some third-party services we use may place their own cookies. These are subject to the respective third party's privacy policies.</p>
      </>
    ),
  };

  const openPolicyModal = (type: string) => {
    let title = "";
    let content = null;

    switch (type) {
      case "terms":
        title = "Terms of Service";
        content = policyContent.terms;
        break;
      case "privacy":
        title = "Privacy Policy";
        content = policyContent.privacy;
        break;
      case "cookies":
        title = "Cookies Policy";
        content = policyContent.cookies;
        break;
    }

    setModalState({
      isOpen: true,
      title,
      content,
    });
  };

  const openNotification = (message: string) => {
    setNotificationState({
      isOpen: true,
      message,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: "",
      content: null,
    });
  };

  const closeNotification = () => {
    setNotificationState({
      isOpen: false,
      message: "",
    });
  };

  const handleCompanyLinkClick = (linkName: string) => {
    openNotification(`${linkName} page is not available at this time.`);
  };

  const legalLinks = [
    { label: "Terms of service", type: "terms" },
    { label: "Privacy Policy", type: "privacy" },
    { label: "Cookies Policy", type: "cookies" },
  ];

  return (
    <>
      <footer className="relative w-full bg-[#002855] px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <img
                  src="/logo.png"
                  alt="Faithful Auto Care Logo"
                  className="w-auto h-auto max-w-[80px] sm:max-w-[150px] md:max-w-[180px] object-contain"
                />
                <h2 className="font-poppins font-bold text-white text-base sm:text-2xl md:text-3xl">
                  FAITHFUL AUTO CARE
                </h2>
              </div>

              <p className="max-w-md font-poppins text-white text-xs sm:text-sm leading-6 sm:leading-7">
                We are a professional car care brand dedicated to delivering
                spotless results, premium detailing, and a seamless customer
                experience
              </p>

              <div className="flex flex-col gap-4 sm:gap-5">
                {contactInfo.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-start sm:items-center gap-3 sm:gap-4"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <contact.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>

                    <a
                      href={contact.href}
                      className="font-poppins text-white text-xs sm:text-sm hover:underline"
                    >
                      {contact.text}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="flex flex-col gap-2 sm:gap-3">
                <h3 className="font-poppins font-semibold text-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2">
                  Company
                </h3>
                <nav className="flex flex-col gap-1.5 sm:gap-2">
                  {companyLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handleCompanyLinkClick(link)}
                      className="font-poppins text-white text-xs sm:text-sm hover:text-blue-300 transition text-left cursor-pointer"
                    >
                      {link}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <h3 className="font-poppins font-semibold text-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2">
                  Legal
                </h3>
                <nav className="flex flex-col gap-1.5 sm:gap-2">
                  {legalLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => openPolicyModal(link.type)}
                      className="font-poppins text-white text-xs sm:text-sm hover:text-blue-300 transition text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 max-w-md">
            <h3 className="font-poppins font-bold text-white text-lg sm:text-xl mb-3 sm:mb-4">
              Newsletter
            </h3>
            <p className="font-poppins text-white text-xs sm:text-sm mb-4 sm:mb-6">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <Input
                type="email"
                placeholder="Your Email"
                className="bg-white text-gray-800 font-poppins rounded-xl px-3 sm:px-4 py-5 sm:py-6 h-auto text-sm sm:text-base"
              />
              <Button className="bg-[#020a1f] text-white font-poppins rounded-xl px-4 sm:px-6 py-5 sm:py-6 h-auto hover:bg-[#020a1f]/90 text-sm sm:text-base">
                Subscribe Now
              </Button>
            </div>
          </div>

          <Separator className="my-6 sm:my-8 bg-white/20" />

          <div className="flex justify-center text-white text-xs sm:text-sm">
            <p>© 2026 Faithful Auto Care. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <PolicyModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        content={modalState.content}
      />

      <NotificationModal
        isOpen={notificationState.isOpen}
        onClose={closeNotification}
        message={notificationState.message}
      />
    </>
  );
};