import assets from '@/assets/images';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="footer-bg relative z-1111">
      <div className="pt-4">
        <h2 className="max-w-[1128px] px-3 mx-auto text-center text-white text-[64px] font-normal leading-normal translate-y-[10px] max-[1260px]:translate-y-0 max-[1260px]:text-[55px] max-[1260px]:mb-5 max-[1024px]:pt-10 max-[1024px]:text-[40px] max-[768px]:text-[28px]">
          Where Property Management Meets Performance
        </h2>
        <div className="max-[1300px]:w-[90%] h-[606px] mx-auto max-[1330px]:h-[500px] max-[1260px]:h-full ">
          <img
            src={assets.images.footerBanner}
            alt="banner"
            className="w-full max-w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="bg-primary px-10 pt-10 pb-3">
        <div className="flex justify-between items-center max-[768px]:flex-col max-[768px]:gap-5 max-[576px]:items-start">
            <Link  to="/"
                  onClick={() => window.scrollTo(0, 0)} className="flex items-center mb-4">
            <img
              src={assets.images.logo}
              alt="Logo"
              className="w-[105px] h-[20px] object-contain"
              width={105}
              height={20}
            />
          </Link>

          {/* Navigation Links */}
          <div>
            <ul className="flex justify-end gap-8 items-center text-[20px] font-light text-white max-[576px]:flex-col max-[576px]:gap-4 max-[576px]:items-start">
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/features"
                  className="hover:opacity-90 max-[992px]:text-[16px] max-[576px]:text-left"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/pricing"
                  className="hover:opacity-90 max-[992px]:text-[16px]"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/about-us"
                  className="hover:opacity-90 max-[992px]:text-[16px]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/contact-us"
                  className="hover:opacity-90 max-[992px]:text-[16px]"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                {/* external link stays <a> */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={assets.images.instaIcon}
                    alt="icon"
                    width={28}
                    height={28}
                    className="w-[28px] h-[28px]"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="my-10">
          <ul className="max-w-[181px] max-[992px]:gap-x-2 max-[992px]:max-w-[70%] max-[992px]:mx-auto max-[992px]:flex max-[992px]:justify-between max-[768px]:max-w-[85%] max-[625px]:flex-col max-[625px]:items-center max-[576px]:items-start max-[576px]:mx-0">
            <li>
              <div className="flex items-center mb-[10px] gap-x-2">
                <img
                  src={assets.images.locationIcon}
                  alt="icon"
                  className="w-[28px] h-[28px]"
                />
                <span className="text-[14px] font-normal text-white">
                  Kuwait
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center mb-[10px] gap-x-2">
                <img
                  src={assets.images.phoneIcon}
                  alt="icon"
                  className="w-[28px] h-[28px]"
                />
                <span className="text-[14px] font-normal text-white">
                  +965 94051232
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center mb-[10px] gap-x-2">
                <img
                  src={assets.images.mailIcon}
                  alt="icon"
                  className="w-[28px] h-[28px]"
                />
                <span className="capitalize text-[14px] font-normal text-white">
                  aljaser@rento.online
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Bottom Row */}
        <div className="mt-10 flex justify-between items-center w-full max-[992px]:flex-col max-[992px]:gap-2 max-[576px]:items-start">
          <div className="flex-1 flex gap-3 max-[380px]:flex-col max-[380px]:justify-start">
            <Link
              onClick={() => window.scrollTo(0, 0)}
              to="/privacy"
              className="text-white/50 text-[16px] font-normal leading-normal "
            >
              Privacy Policy
            </Link>
            <Link
              onClick={() => window.scrollTo(0, 0)}
              to="/terms"
              className="text-white/50 text-[16px] font-normal leading-normal "
            >
              Terms & Conditions
            </Link>
          </div>
          <div className="flex-1 flex gap-3 justify-end">
            <p className="text-white/50 text-[16px] font-normal leading-normal ">
              Copyright © 2025 Rento. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
