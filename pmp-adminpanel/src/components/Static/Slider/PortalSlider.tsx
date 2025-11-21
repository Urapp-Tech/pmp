// Import Swiper React components
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles

// Swiper styles
// import "swiper/dist/css/swiper.min.css";
// @import './styles.css';

// import required modules
import assets from '@/assets/images';

export default function PortalSlider() {
  return (
    <div className=" mt-10 portal-slider">
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000, // normal smooth speed
          disableOnInteraction: false,
        }}
        modules={[Autoplay, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div className="flex-1 relative h-[500px] slv-blue">
            <div className="py-4 px-4 sm:p-6 sp3">
              <h3 className="text-[20px] font-normal mb-2  text-white   ">
                Landlord Portal
              </h3>
              <p className=" text-white text-[16px] font-light   ">
                Control your property portfolio
              </p>

              <ul className="my-3 list-disc  pl-[16px]  marker:text-white  ">
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Dashboard showing total properties, tenants, invoices &
                    tickets
                  </span>
                </li>
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Add and manage multiple properties
                  </span>
                </li>
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Automate rent collection & reminders
                  </span>
                </li>
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    View financial reports instantly
                  </span>
                </li>
              </ul>
            </div>
            <img
              // src={assets.images.landBanner}
                   src={assets.images.portSlide1}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10     "
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1 min-h-[500px] slv-white">
            <div className="py-4 px-4  sm:p-6 sp3">
              <h3 className=" text-[20px] font-normal mb-2  text-[#242460]">
                Manager Portal
              </h3>
              <p className="  text-[16px] font-light  text-[#242460]">
                Simplify daily operations.
              </p>

              <ul className="my-3 list-disc  pl-[16px]   marker:text-[#242460] ">
                <li>
                  <span className="text-primary text-[16px] font-light  not-last:">
                    Track assigned tenants, managed units, and rent collection
                  </span>
                </li>
                <li>
                  <span className="text-primary text-[16px] font-light  ">
                    Centralized database of tenants with full details
                  </span>
                </li>
                <li>
                  <span className="text-primary text-[16px] font-light  ">
                    Monitor occupancy, expenses, and invoices
                  </span>
                </li>
                <li>
                  <span className="text-primary text-[16px] font-light  ">
                    Handle maintenance requests smoothly
                  </span>
                </li>
              </ul>
            </div>
            <img
             src={assets.images.portSlide2}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10      max-[676px]:opacity-100"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1 min-h-[500px] slv-blue">
            <div className=" py-4 px-4 sm:p-6 sp3">
              <h3 className=" text-white text-[20px] font-normal mb-2   ">
                Tenant Portal
              </h3>
              <p className=" text-white text-[16px] font-light   ">
                Designed for convenience
              </p>
              <ul className="my-3 list-disc   pl-[16px]  marker:text-white ">
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Pay rent online quickly & securely
                  </span>
                </li>
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Access lease contracts & payment history
                  </span>
                </li>
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Submit and track maintenance requests
                  </span>
                </li>
                <li>
                  <span className="text-white text-[16px] font-light   ">
                    Stay updated with reminders and receipts
                  </span>
                </li>
              </ul>
            </div>
            <img
             src={assets.images.portSlide3}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10     max-[676px]:opacity-100"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1 relative min-h-[500px] slv-white">
            <div className="py-4 px-4 sm:p-6 sp3">
              <h3 className=" text-primary text-[20px] font-normal mb-2 ">
                Super Admin Portal
              </h3>
              <p className=" text-primary text-[16px] font-light ">
                Full platform control
              </p>

              <ul className="my-3 list-disc   pl-[16px]  marker:text-[#242460] ">
                <li>
                  <span className=" text-[16px] font-light text-[#242460]">
                    Manage landlords, managers, tenants, and properties
                  </span>
                </li>
                <li>
                  <span className=" text-[16px] font-light text-[#242460]">
                    Oversee all permissions and platform usage
                  </span>
                </li>
                <li>
                  <span className="  text-[16px] font-light text-[#242460]">
                    Ensure smooth system performance
                  </span>
                </li>
              </ul>
            </div>
            <img
            src={assets.images.portSlide4}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10     max-[676px]:opacity-100"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
