import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';
import logo from '../assets/logo.png'; // Import your logo

export default function Footer() {
  // Replace with your actual social media links
  const socialLinks = {
    youtube: "https://youtube.com/yourchannel",
    twitter: "https://twitter.com/yourprofile",
    instagram: "https://instagram.com/yourprofile",
    facebook: "https://facebook.com/yourpage",
    tiktok: "https://tiktok.com/@yourprofile"
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Section - Updated */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {/* Logo */}
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

            {/* Social Media Icons */}
            <div className="pt-4">
              <h3 className="text-white font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-3">
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-500 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                  aria-label="YouTube"
                >
                  <FaYoutube className="text-white text-lg" />
                </a>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter className="text-white text-lg" />
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-white text-lg" />
                </a>
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-400 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebook className="text-white text-lg" />
                </a>
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gradient-to-r hover:from-black hover:via-gray-800 hover:to-pink-500 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                  aria-label="TikTok"
                >
                  <FaTiktok className="text-white text-lg" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - Updated */}
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

            {/* Premium Button */}
            <div className="pt-6">
              <a
                href="/premium"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 hover:from-purple-700 hover:via-pink-600 hover:to-blue-600 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-600/30"
              >
                <span className="text-lg">✨</span>
                <span>Go Premium</span>
              </a>
            </div>
          </div>

          {/* Contact Section - Updated */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg border-l-4 border-purple-600 pl-3">Contact Us</h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
                  <FaPhone className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Call Us</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors duration-300">
                    +250 783 948 792
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
                  <FiMail className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email Us</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors duration-300">
                    support@agasobanuyeflex.com
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-500 transition-all duration-300">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors duration-300">
                    Kigali Heights<br />
                    Kigali, Rwanda
                  </p>
                </div>
              </div>
            </div>

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

        {/* Bottom Bar - Updated */}
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

          {/* Language & Region */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-800/50">
            <div className="text-gray-400 text-sm">
              Available in: <span className="text-purple-400 font-medium">Rwanda</span>
            </div>
            <div className="text-gray-400 text-sm">
              Language: <span className="text-purple-400 font-medium">English</span> | <span className="text-gray-500 hover:text-purple-400 cursor-pointer">Kinyarwanda</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-gray-800/30">
            <p>Agasobanuye Flex Zone is a streaming platform for educational and entertainment purposes. All content is owned by their respective creators.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}