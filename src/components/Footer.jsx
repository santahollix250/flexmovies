import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaDiscord, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';
import logo from '../assets/logo.png'; // Import your logo

export default function Footer() {
  // 🔥 REPLACE THESE WITH YOUR ACTUAL SOCIAL MEDIA LINKS 🔥
  const socialLinks = {
    // YouTube Channel URL (e.g., https://youtube.com/@yourchannel)
    youtube: "https://youtube.com/@yourchannel",

    // Twitter/X Profile URL (e.g., https://x.com/yourusername)
    twitter: "https://x.com/yourusername",

    // Instagram Profile URL (e.g., https://instagram.com/yourusername)
    instagram: "https://instagram.com/yourusername",

    // Facebook Page/Profile URL (e.g., https://facebook.com/yourpage)
    facebook: "https://facebook.com/yourpage",

    // TikTok Profile URL (e.g., https://tiktok.com/@yourusername)
    tiktok: "https://tiktok.com/@yourusername",

    // WhatsApp Group/Contact URL
    // ⚠️ IMPORTANT: See instructions below to get your WhatsApp link
    whatsapp: "https://chat.whatsapp.com/YOUR_INVITE_CODE",

    // Optional: Additional platforms (uncomment if you have these)
    // github: "https://github.com/yourusername",
    // linkedin: "https://linkedin.com/in/yourusername",
    // discord: "https://discord.gg/yourinvite"
  };

  // 🔥 REPLACE THESE WITH YOUR ACTUAL CONTACT INFORMATION 🔥
  const contactInfo = {
    phone: "+250 783 948 792", // Your phone number
    whatsappNumber: "+250783948792", // Your WhatsApp number (without spaces or symbols)
    email: "support@agasobanuyeflex.com", // Your email
    address: "Kigali Heights, Kigali, Rwanda", // Your address
    website: "https://agasobanuyeflex.com" // Your website
  };

  // Function to open links in new tab
  const openLink = (url) => {
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Link not configured yet!');
    }
  };

  // Function to open WhatsApp chat with a number
  const openWhatsAppChat = (phoneNumber) => {
    if (phoneNumber) {
      // Format: https://wa.me/250783948792
      const whatsappUrl = `https://whatsapp.com/channel/0029Vb6gSfuFcowDBIM2rp2u/${phoneNumber.replace(/\D/g, '')}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('WhatsApp number not configured!');
    }
  };

  // Function to make a call
  const makeCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  // Function to send an email
  const sendEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  // Function to open location in maps
  const openLocation = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-purple-600/30">
                <img
                  src={logo}
                  alt="Agasobanuye Flex Zone Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="h-full w-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center">
                        <span class="text-white font-bold text-lg">A</span>
                      </div>
                    `;
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    agasobanuye
                  </span>
                  <span className="text-white">flex</span>
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    zone
                  </span>
                </h2>
                <p className="text-[10px] text-gray-400 -mt-1">Premium Streaming</p>
              </div>
            </div>
            <p className="text-gray-400 max-w-md">
              Experience the future of streaming with unlimited access to your favorite content, anytime, anywhere in Rwanda and beyond.
            </p>

            {/* Social Media Icons - Updated with WhatsApp */}
            <div className="pt-4">
              <h3 className="text-white font-semibold mb-4">Follow & Connect</h3>
              <div className="flex flex-wrap gap-3">
                {/* YouTube */}
                <button
                  onClick={() => openLink(socialLinks.youtube)}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                  aria-label="YouTube"
                  title="YouTube Channel"
                >
                  <FaYoutube className="text-white text-lg" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    YouTube
                  </span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={() => openLink(socialLinks.twitter)}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                  aria-label="Twitter"
                  title="Twitter Profile"
                >
                  <FaTwitter className="text-white text-lg" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Twitter/X
                  </span>
                </button>

                {/* Instagram */}
                <button
                  onClick={() => openLink(socialLinks.instagram)}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                  aria-label="Instagram"
                  title="Instagram Profile"
                >
                  <FaInstagram className="text-white text-lg" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Instagram
                  </span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => openLink(socialLinks.facebook)}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                  aria-label="Facebook"
                  title="Facebook Page"
                >
                  <FaFacebook className="text-white text-lg" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Facebook
                  </span>
                </button>

                {/* TikTok */}
                <button
                  onClick={() => openLink(socialLinks.tiktok)}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-black hover:via-gray-800 hover:to-pink-500 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                  aria-label="TikTok"
                  title="TikTok Profile"
                >
                  <FaTiktok className="text-white text-lg" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    TikTok
                  </span>
                </button>

                {/* WhatsApp - NEW */}
                <button
                  onClick={() => openLink(socialLinks.whatsapp)}
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                  aria-label="WhatsApp"
                  title="Join WhatsApp Group"
                >
                  <FaWhatsapp className="text-white text-lg" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    WhatsApp Group
                  </span>
                </button>

                {/* Optional: Add more platforms if you have them */}
                {/* 
                {socialLinks.github && (
                  <button
                    onClick={() => openLink(socialLinks.github)}
                    className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-600 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                    aria-label="GitHub"
                    title="GitHub Profile"
                  >
                    <FaGithub className="text-white text-lg" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      GitHub
                    </span>
                  </button>
                )}

                {socialLinks.linkedin && (
                  <button
                    onClick={() => openLink(socialLinks.linkedin)}
                    className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center justify-center transform hover:scale-110 group relative"
                    aria-label="LinkedIn"
                    title="LinkedIn Profile"
                  >
                    <FaLinkedin className="text-white text-lg" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      LinkedIn
                    </span>
                  </button>
                )}
                */}
              </div>

              {/* WhatsApp Direct Chat Button */}
              <div className="mt-4">
                <button
                  onClick={() => openWhatsAppChat(contactInfo.whatsappNumber)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-lg transition-all duration-300 transform hover:scale-105 w-full justify-center"
                >
                  <FaWhatsapp className="text-white text-lg" />
                  <span>Chat with us on WhatsApp</span>
                </button>
              </div>

              {/* Link Status Indicators */}
              <div className="mt-4 text-xs text-gray-500">
                {Object.values(socialLinks).filter(Boolean).length === 0 ? (
                  <div className="text-amber-400 bg-amber-900/20 p-2 rounded-lg">
                    ⚠️ No social links configured. Update the socialLinks object above.
                  </div>
                ) : (
                  <div className="text-green-400 bg-green-900/20 p-2 rounded-lg">
                    ✅ {Object.values(socialLinks).filter(Boolean).length} social platform(s) linked
                    {socialLinks.whatsapp && socialLinks.whatsapp !== "https://chat.whatsapp.com/YOUR_INVITE_CODE" && (
                      <span className="ml-2 text-green-300">✓ WhatsApp ready</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg border-l-4 border-purple-600 pl-3">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Movies', 'Series', 'Trending', 'Categories', 'My List'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-purple-400 transition-all duration-300 flex items-center group transform hover:translate-x-1"
                  >
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="group-hover:text-white">{item}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Website Button */}
            <div className="pt-6">
              <button
                onClick={() => openLink(contactInfo.website)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 hover:from-purple-700 hover:via-pink-600 hover:to-blue-600 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-600/30 w-full justify-center"
              >
                <span className="text-lg">🌐</span>
                <span>Visit Our Website</span>
              </button>
            </div>
          </div>

          {/* Contact Section - Updated with WhatsApp contact */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg border-l-4 border-purple-600 pl-3">Contact Us</h3>

            <div className="space-y-4">
              {/* WhatsApp Contact - NEW */}
              <div
                onClick={() => openWhatsAppChat(contactInfo.whatsappNumber)}
                className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-900/50 p-3 rounded-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-green-400 transition-all duration-300">
                  <FaWhatsapp className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">WhatsApp</p>
                  <p className="text-white font-medium group-hover:text-green-400 transition-colors duration-300">
                    {contactInfo.whatsappNumber}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Click to chat directly</p>
                </div>
              </div>

              {/* Phone */}
              <div
                onClick={() => makeCall(contactInfo.phone)}
                className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-900/50 p-3 rounded-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
                  <FaPhone className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Call Us</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors duration-300">
                    {contactInfo.phone}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Click to call</p>
                </div>
              </div>

              {/* Email */}
              <div
                onClick={() => sendEmail(contactInfo.email)}
                className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-900/50 p-3 rounded-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
                  <FiMail className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email Us</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors duration-300">
                    {contactInfo.email}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Click to email</p>
                </div>
              </div>

              {/* Location */}
              <div
                onClick={() => openLocation(contactInfo.address)}
                className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-900/50 p-3 rounded-lg transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors duration-300">
                    {contactInfo.address}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Click for directions</p>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="pt-4">
              <h4 className="text-white font-semibold mb-3">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-gray-700"
                />
                <button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 px-4 py-2 rounded-r-lg font-medium transition-all duration-300 transform hover:scale-105">
                  Subscribe
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Get notified about new releases and exclusive content.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Agasobanuye Flex Zone. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-purple-400 text-sm transition-all duration-300 hover:scale-105">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-purple-400 text-sm transition-all duration-300 hover:scale-105">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-purple-400 text-sm transition-all duration-300 hover:scale-105">
                Cookie Policy
              </a>
              <a href="/faq" className="text-gray-400 hover:text-purple-400 text-sm transition-all duration-300 hover:scale-105">
                FAQ
              </a>
            </div>
          </div>

          {/* Social Links Quick View */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-800/50">
            <div className="text-gray-400 text-sm">
              Connect with us:
              {Object.entries(socialLinks).map(([platform, url]) => (
                url && url !== "https://chat.whatsapp.com/YOUR_INVITE_CODE" && (
                  <button
                    key={platform}
                    onClick={() => openLink(url)}
                    className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                )
              ))}
            </div>
          </div>




          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-gray-800/30">
            <p>Agasobanuye Flex Zone is a streaming platform for educational and entertainment purposes. All content is owned by their respective creators.</p>
            <p className="mt-2 text-green-400">
              💬 Join our WhatsApp community for updates and discussions!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}