import { motion } from "framer-motion";
import { Github, Instagram, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#F0AE35] to-[#F57600] text-white pt-12 sm:pt-16 pb-8 px-6 sm:px-10 md:px-24 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-7xl mx-auto"
      >
        {/* Grid — single column on mobile, 3 cols on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10 sm:mb-12">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              GastronomeConnect
            </h2>
            <p className="text-orange-100 text-sm leading-relaxed max-w-xs">
              Elevating your kitchen game with AI-driven culinary inspiration.
            </p>
            <div className="flex gap-4 pt-1 text-white/80">
              <Twitter
                size={18}
                className="hover:text-white cursor-pointer transition-colors"
              />
              <Instagram
                size={18}
                className="hover:text-white cursor-pointer transition-colors"
              />
              <Github
                size={18}
                className="hover:text-white cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 border-b border-orange-400/50 pb-2 inline-block">
              Resources
            </h3>
            <ul className="space-y-2 sm:space-y-3 text-orange-50/80 text-sm">
              <li>
                <a href="/privacy" className="hover:text-white transition-all">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-all">
                  Terms of Use
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 border-b border-orange-400/50 pb-2 inline-block">
              Contact
            </h3>
            <div className="space-y-2 sm:space-y-3 text-orange-50/80 text-sm">
              <p className="flex items-center gap-2 font-medium flex-wrap">
                <Mail size={15} className="shrink-0" />
                gastronome.connect@gmail.com
              </p>
              <p className="cursor-pointer hover:text-white transition-colors">
                Help Center
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-orange-400/30 pt-6 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-0 sm:justify-between text-xs text-orange-100/60 uppercase tracking-widest font-medium">
          <p>© 2026 GastronomeConnect</p>
        </div>
      </motion.div>
    </footer>
  );
}
