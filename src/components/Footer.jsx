import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaWhatsapp, FaGithub, FaLinkedin, FaCode } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';
import { FaLocationDot } from 'react-icons/fa6';
import logo from '../assets/logo.png';

export default function Footer() {
  // Social Links
  const socialLinks = {
    youtube: "https://youtube.com/@irakabahodjabiri?si=P5Ste_J9oYDkGcqG",
    instagram: "https://www.instagram.com/santa_lamaer",
    twitter: "#",
    facebook: "#",
    tiktok: "https://www.tiktok.com/@flxemov",
    whatsapp: "https://chat.whatsapp.com/0029Vb6gSfuFcowDBIM2rp2u"
  };

  // Contact Info
  const contactInfo = {
    phone: "+250 783 948 792",
    whatsapp: "250783948792",
    email: "@agasobanuyeflex.com",
    address: "Bugesera Heights, Kigali",
    website: "https://agasobanuyeflex.com"
  };

  // Developer Info
  const developer = {
    name: "Lamaer Dev",
    github: "https://github.com/santahollix250",
    email: "santalamaer@gmail.com"
  };

  const openLink = (url) => url && window.open(url, '_blank');
  const openWhatsApp = (num) => window.open(`https://wa.me/${num}`, '_blank');
  const makeCall = (num) => window.location.href = `tel:${num}`;
  const sendEmail = (email) => window.location.href = `mailto:${email}`;
  const openMap = (addr) => window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`);

  const SocialIcon = ({ Icon, url, color, label }) => (
    <button
      onClick={() => openLink(url)}
      className={`w-9 h-9 rounded-full bg-gray-800 hover:${color} flex items-center justify-center transition-all hover:scale-110 group relative`}
      aria-label={label}
    >
      <Icon className="text-white text-sm" />
      <span className="absolute -top-7 text-xs bg-gray-900 px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  const ContactItem = ({ icon: Icon, onClick, title, value, subtitle }) => (
    <div onClick={onClick} className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-all">
      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600">
        <Icon className="text-white text-sm" />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{title}</p>
        <p className="text-white text-sm font-medium">{value}</p>
        {subtitle && <p className="text-gray-500 text-[10px]">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Agasobanuye Flex
              </h2>
            </div>
            <p className="text-gray-400 text-xs">Premium streaming in Rwanda</p>
            <button onClick={() => openWhatsApp(contactInfo.whatsapp)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-xs px-3 py-2 rounded-lg">
              <FaWhatsapp /> Chat on WhatsApp
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-3 border-l-2 border-purple-600 pl-2">Links</h3>
            <ul className="space-y-2 text-xs">
              {['Home', 'Movies', 'Series', 'Trending', 'My List'].map(item => (
                <li key={item}><a href="#" className="text-gray-400 hover:text-white">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm mb-3 border-l-2 border-purple-600 pl-2">Contact</h3>
            <div className="space-y-2">
              <ContactItem icon={FaWhatsapp} onClick={() => openWhatsApp(contactInfo.whatsapp)} title="WhatsApp" value={contactInfo.whatsapp} subtitle="Click to chat" />
              <ContactItem icon={FiPhone} onClick={() => makeCall(contactInfo.phone)} title="Call" value={contactInfo.phone} subtitle="Click to call" />
              <ContactItem icon={FiMail} onClick={() => sendEmail(contactInfo.email)} title="Email" value={contactInfo.email} subtitle="Click to email" />
              <ContactItem icon={FaLocationDot} onClick={() => openMap(contactInfo.address)} title="Address" value="Kigali, Rwanda" subtitle="Get directions" />
            </div>
          </div>

          {/* Social & Dev */}
          <div>
            <h3 className="font-semibold text-sm mb-3 border-l-2 border-purple-600 pl-2">Connect</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <SocialIcon Icon={FaYoutube} url={socialLinks.youtube} color="hover:bg-red-600" label="YouTube" />
              <SocialIcon Icon={FaInstagram} url={socialLinks.instagram} color="hover:bg-pink-600" label="Instagram" />
              <SocialIcon Icon={FaTwitter} url={socialLinks.twitter} color="hover:bg-blue-400" label="Twitter" />
              <SocialIcon Icon={FaFacebook} url={socialLinks.facebook} color="hover:bg-blue-600" label="Facebook" />
              <SocialIcon Icon={FaTiktok} url={socialLinks.tiktok} color="hover:bg-black" label="TikTok" />
            </div>

            {/* Developer */}
            <div className="border-t border-gray-800 pt-3">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <FaCode className="text-purple-400" />
                Dev by <span className="text-purple-400 font-medium">{developer.name}</span>
              </p>
              <div className="flex gap-3 mt-2 text-xs">
                <button onClick={() => openLink(developer.github)} className="text-gray-400 hover:text-white">GitHub</button>
                <button onClick={() => sendEmail(developer.email)} className="text-gray-400 hover:text-white">Email</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Agasobanuye Flex. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="/privacy" className="hover:text-purple-400">Privacy</a>
            <a href="/terms" className="hover:text-purple-400">Terms</a>
            <a href="/faq" className="hover:text-purple-400">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}