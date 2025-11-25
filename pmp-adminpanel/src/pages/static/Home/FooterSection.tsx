import assets from '@/assets/images';
import { motion } from 'framer-motion';
import { Link } from 'react-router';

function FooterSection() {
  return (
    <motion.section
      id="footer"
      key="footer-section"
      className="relative w-full min-h-screen flex items-end justify-center z-[1]"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="footer-bg w-full h-[100vh] flex flex-col relative z-[1]">
        <div className="pt-4 flex-1 flex flex-col items-center justify-start">
          <h2
            className="max-w-[1128px] px-3 mx-auto text-center text-white text-[55px] font-normal leading-snug max-[1600px]:max-w-[900px] max-[1600px]:text-[38px]
                                max-[1260px]:text-[55px] max-[1024px]:text-[40px] max-[768px]:text-[28px]"
          >
            Where Property Management Meets Performance
          </h2>
          <div className="max-w-[1300px] w-[95%] mx-auto mt-6 flex justify-center">
            <img
              src={assets.images.footerBanner}
              alt="banner"
              className="w-full  h-[45vh]  object-contain object-bottom foter-ban"
            />
          </div>
        </div>

        <div className="bg-primary px-10 pt-10 pb-3">
          <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center max-[768px]:flex-col max-[768px]:gap-5">
              <Link
                to="/"
                onClick={() => window.scrollTo(0, 0)}
                className="flex items-center mb-4"
              >
                <img
                  src={assets.images.logo}
                  alt="Logo"
                  className="w-[105px] h-[20px] object-contain"
                />


              </Link>

              <ul className="flex justify-end gap-8 items-center text-[20px] font-light text-white max-[576px]:flex-col max-[576px]:gap-4 max-[576px]:items-start">
                <li>
                  <Link
                    onClick={() => window.scrollTo(0, 0)}
                    to="/features"
                    className="hover:opacity-90"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => window.scrollTo(0, 0)}
                    to="/pricing"
                    className="hover:opacity-90"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => window.scrollTo(0, 0)}
                    to="/about-us"
                    className="hover:opacity-90"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => window.scrollTo(0, 0)}
                    to="/contact-us"
                    className="hover:opacity-90"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={assets.images.instaIcon}
                      alt="icon"
                      className="w-[28px] h-[28px]"
                    />
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex justify-start items-center max-[768px]:flex-col max-[768px]:gap-5">
              <ul className="flex flex-col gap-2 text-white text-[14px]">
                <li className="flex items-center gap-2">
                  <img
                    src={assets.images.locationIcon}
                    alt="icon"
                    className="w-[28px] h-[28px]"
                  />
                  Kuwait
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src={assets.images.phoneIcon}
                    alt="icon"
                    className="w-[28px] h-[28px]"
                  />
                  +965 94051232
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src={assets.images.mailIcon}
                    alt="icon"
                    className="w-[28px] h-[28px]"
                  />
                  aljaser@rento.online
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4 max-[768px]:mt-5">
                <Link
                  to="/privacy"
                  className="text-white/50 text-[16px] hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-white/50 text-[16px]  hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </div>
              <p className="text-white/50 text-[16px] text-center mt-5">
                Copyright © 2025 Rento. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default FooterSection;
