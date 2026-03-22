import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaWhatsapp, FaGithub, FaCode, FaHeart, FaShieldAlt, FaRocket, FaTelegram, FaSnapchat, FaReddit, FaDiscord } from 'react-icons/fa';
import { FiMail, FiPhone, FiGlobe, FiClock } from 'react-icons/fi';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { SiThreads, SiX, SiTiktok } from 'react-icons/si';
import logo from '../assets/Newlogo.png';

export default function Footer() {
  // Social Links
  const socialLinks = {
    youtube: "https://youtube.com/@irakabahodjabiri?si=P5Ste_J9oYDkGcqG",
    instagram: "https://www.instagram.com/osicardjabir9/",
    twitter: "https://twitter.com/agasobanuyeflex",
    facebook: "https://facebook.com/agasobanuyeflex",
    tiktok: "https://www.tiktok.com/@flxemov",
    whatsapp: "https://chat.whatsapp.com/0029Vb6gSfuFcowDBIM2rp2u",
    telegram: "https://t.me/agasobanuyeflex",
    discord: "https://discord.gg/agasobanuyeflex"
  };

  // Contact Info
  const contactInfo = {
    phone: "+250 783 948 792",
    whatsapp: "250783948792",
    email: "irakabahodjabiri@gmail.com",
    address: "Bugesera Heights, Kigali",
    website: "https://agasobanuyecineva.com"
  };

  // Developer Info
  const developer = {
    name: "Lamaer Dev",
    github: "https://github.com/santahollix250",
    email: "santalamaer@gmail.com"
  };

  const openLink = (url) => url && url !== '#' && window.open(url, '_blank');
  const openWhatsApp = (num) => window.open(`https://wa.me/${num}`, '_blank');
  const makeCall = (num) => window.location.href = `tel:${num}`;
  const sendEmail = (email) => window.location.href = `mailto:${email}`;
  const openMap = (addr) => window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`);

  const SocialIcon = ({ Icon, url, gradient, label }) => (
    <button
      onClick={() => openLink(url)}
      className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center transition-all duration-500 hover:scale-110 hover:-translate-y-1 group relative border border-gray-700 hover:border-transparent shadow-lg hover:shadow-xl`}
      aria-label={label}
    >
      <Icon className="text-white text-xl group-hover:scale-110 transition-transform duration-300" />
      <span className="absolute -top-8 text-xs bg-gray-900 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap border border-purple-600/30 shadow-lg z-50">
        {label}
      </span>
    </button>
  );

  const ContactItem = ({ icon: Icon, onClick, title, value, subtitle }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 rounded-xl cursor-pointer transition-all duration-300 group border border-transparent hover:border-purple-600/30"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/30">
        <Icon className="text-white text-base" />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium">{title}</p>
        <p className="text-white text-sm font-semibold group-hover:text-purple-400 transition-colors">{value}</p>
        {subtitle && <p className="text-gray-500 text-[10px] flex items-center gap-1 mt-0.5"><FiClock className="text-purple-400" /> {subtitle}</p>}
      </div>
    </div>
  );

  return (
    <footer className="bg-gradient-to-b from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Main Grid - 3 columns without Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          {/* Brand Column - Expanded */}
          <div className="space-y-5 md:col-span-1">
            <div className="flex items-center gap-3 group">
              {/* Logo with enhanced styling */}
              <div className="relative">
                <div className="h-16 w-16 rounded-xl overflow-hidden ring-2 ring-purple-600/50 group-hover:ring-purple-500 transition-all duration-500 group-hover:scale-105 shadow-xl shadow-purple-600/30">
                  <img
                    src={logo}
                    alt="agasobanuyecineva Logo"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="h-full w-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <span class="text-white font-bold text-xl">A</span>
                        </div>
                      `;
                    }}
                  />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
              </div>

              {/* Brand Name */}
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                    agasobanuye
                  </span>
                </h2>
                <h2 className="text-2xl font-bold -mt-1">
                  <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent bg-300% animate-gradient">
                    cineva
                  </span>
                </h2>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <FaRocket className="text-purple-400" /> Premium Streaming in Rwanda
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Experience the best of Rwandan and international entertainment with our premium streaming platform. Watch anywhere, anytime.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => openWhatsApp(contactInfo.whatsapp)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-sm px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-600/30 group"
              >
                <FaWhatsapp className="text-lg group-hover:rotate-12 transition-transform" />
                WhatsApp
              </button>
              <button
                onClick={() => makeCall(contactInfo.phone)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-sm px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 group"
              >
                <FiPhone className="text-lg group-hover:rotate-12 transition-transform" />
                Call Us
              </button>
            </div>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-5 inline-block">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent border-b-2 border-purple-600 pb-1">
                Contact Us
              </span>
            </h3>
            <div className="space-y-2">
              <ContactItem
                icon={FaWhatsapp}
                onClick={() => openWhatsApp(contactInfo.whatsapp)}
                title="WhatsApp"
                value={contactInfo.whatsapp}
                subtitle="Usually replies in 1 hour"
              />
              <ContactItem
                icon={FiPhone}
                onClick={() => makeCall(contactInfo.phone)}
                title="Call"
                value={contactInfo.phone}
                subtitle="24/7 Support Available"
              />
              <ContactItem
                icon={FiMail}
                onClick={() => sendEmail(contactInfo.email)}
                title="Email"
                value={contactInfo.email}
                subtitle="Response within 24 hours"
              />
              <ContactItem
                icon={FaLocationDot}
                onClick={() => openMap(contactInfo.address)}
                title="Address"
                value="Kigali, Rwanda"
                subtitle="Bugesera Heights"
              />
            </div>

            {/* Website Link */}
            <div className="mt-5">
              <a
                href={contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-all duration-300 group bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700 hover:border-purple-600"
              >
                <FiGlobe className="group-hover:rotate-12 transition-transform text-purple-400" />
                <span className="font-medium">{contactInfo.website.replace('https://', '')}</span>
                <span className="text-xs bg-purple-600/20 px-2 py-0.5 rounded-full text-purple-400">Visit</span>
              </a>
            </div>
          </div>

          {/* Social & Dev Column - Enhanced Social Media Focus */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-5 inline-block">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent border-b-2 border-purple-600 pb-1">
                Connect With Us
              </span>
            </h3>

            {/* Social Media Grid - Enhanced with gradients */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <SocialIcon
                Icon={FaYoutube}
                url={socialLinks.youtube}
                gradient="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
                label="YouTube"
              />
              <SocialIcon
                Icon={FaInstagram}
                url={socialLinks.instagram}
                gradient="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 hover:from-pink-400 hover:via-purple-400 hover:to-orange-400"
                label="Instagram"
              />
              <SocialIcon
                Icon={FaTwitter}
                url={socialLinks.twitter}
                gradient="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400"
                label="Twitter/X"
              />
              <SocialIcon
                Icon={FaFacebook}
                url={socialLinks.facebook}
                gradient="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                label="Facebook"
              />
              <SocialIcon
                Icon={FaTiktok}
                url={socialLinks.tiktok}
                gradient="bg-gradient-to-br from-black to-gray-800 hover:from-gray-800 hover:to-gray-700 border border-gray-600"
                label="TikTok"
              />
              <SocialIcon
                Icon={FaWhatsapp}
                url={socialLinks.whatsapp}
                gradient="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                label="WhatsApp"
              />
              <SocialIcon
                Icon={FaTelegram}
                url={socialLinks.telegram}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
                label="Telegram"
              />
              <SocialIcon
                Icon={FaDiscord}
                url={socialLinks.discord}
                gradient="bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600"
                label="Discord"
              />
              <SocialIcon
                Icon={FaGithub}
                url={developer.github}
                gradient="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                label="GitHub"
              />
            </div>

            {/* Social Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 border border-purple-600/20 text-center">
                <p className="text-2xl font-bold text-purple-400">10K+</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 border border-pink-600/20 text-center">
                <p className="text-2xl font-bold text-pink-400">50K+</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
            </div>

            {/* Developer - Enhanced */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-purple-600/30">
              <p className="text-xs text-gray-400 flex items-center gap-2 mb-3">
                <FaCode className="text-purple-400" />
                <span className="flex items-center gap-1">
                  Crafted with <FaHeart className="text-pink-500 text-xs animate-pulse" /> by
                </span>
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 font-bold text-base">{developer.name}</p>
                  <p className="text-gray-500 text-xs">Full Stack Developer</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openLink(developer.github)}
                    className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors group"
                    title="GitHub"
                  >
                    <FaGithub className="text-gray-300 group-hover:text-white" />
                  </button>
                  <button
                    onClick={() => sendEmail(developer.email)}
                    className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors group"
                    title="Email Developer"
                  >
                    <MdEmail className="text-gray-300 group-hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p className="flex items-center gap-2 order-2 sm:order-1 mt-4 sm:mt-0">
            <FaShieldAlt className="text-purple-400" />
            © {new Date().getFullYear()} agasobanuyecineva. All rights reserved.
          </p>
          <div className="flex gap-6 order-1 sm:order-2">
            <a href="/privacy" className="hover:text-purple-400 transition-colors flex items-center gap-1 group">
              <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></span>
              Privacy
            </a>
            <a href="/terms" className="hover:text-purple-400 transition-colors flex items-center gap-1 group">
              <span className="w-1 h-1 bg-pink-400 rounded-full group-hover:scale-150 transition-transform"></span>
              Terms
            </a>
            <a href="/faq" className="hover:text-purple-400 transition-colors flex items-center gap-1 group">
              <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></span>
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}