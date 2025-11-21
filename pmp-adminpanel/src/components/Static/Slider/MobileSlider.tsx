// Import Swiper React components
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles

// Swiper styles
// import "swiper/dist/css/swiper.min.css";
// @import './styles.css';

// import required modules
import assets from '@/assets/images';

export default function MobileSlider() {
  return (
    <div className=" mt-10 portal-slider ">
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 3000, // normal smooth speed
          disableOnInteraction: false,
        }}
         modules={[  Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div className="flex-1 relative min-h-[500px] slv-white ">
            <div className="p-3 sp3">
              <h3 className="text-center text-primary text-[20px] font-normal mb-2 max-[676px]:text-[#242460]">
                Collect rent online securely
              </h3>
              <p className="text-center text-primary text-[16px] font-light max-[676px]:text-[#242460]">
                Say goodbye to cash and late payments. With Rento, tenants can
                pay rent online in just a few clicks, handled with bank-level
                security — keeping payments safe for landlords and simple for
                tenants.
              </p>
            </div>
            <img
              // src={assets.images.highBan1}
              src={assets.images.mobSlide1}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10 opacity-90   "
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1 min-h-[500px] slv-blue">
            <div className="p-3 sp3">
              <h3 className="text-center text-white text-[20px] font-normal mb-2 ">
                Automated financial reports
              </h3>
              <p className="text-center text-white text-[16px] font-light  ">
                No more manual spreadsheets. Rento instantly generates detailed
                reports on rent collection, expenses, and property performance.
                Track your income and get a clear financial overview anytime,
                anywhere.
              </p>
            </div>
            <img
                src={assets.images.mobSlide2}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10 opacity-90   "
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1 min-h-[500px] slv-white">
            <div className=" p-3 sp3">
              <h3 className="text-center text-primary text-[20px] font-normal mb-2 max-[676px]:text-[#242460]">
                Easy tenant & property management
              </h3>
              <p className="text-center text-primary text-[16px] font-light max-[676px]:text-[#242460]">
                Keep everything organized in one place. Add new tenants, manage
                multiple properties, and access contracts or payment history in
                seconds. Rento simplifies daily operations so you can focus on
                growing your portfolio.
              </p>
            </div>
            <img
                 src={assets.images.mobSlide3}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10 opacity-90    "
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1 relative min-h-[500px] slv-blue">
            <div className="p-3 sp3">
              <h3 className="text-center text-white text-[20px] font-normal mb-2  ">
                Track and resolve maintenance requests
              </h3>
              <p className="text-center text-white text-[16px] font-light ">
                Stay on top of maintenance without the hassle of endless calls.
                Tenants submit requests online , managers assign tasks and track
                progress until it’s resolved — ensuring every issue is handled
                quickly and transparently.”
              </p>
            </div>
            <img
               src={assets.images.mobSlide4}
              alt="banner"
              className="absolute top-0 w-full h-full object-cover rounded-2xl -z-10 opacity-90   "
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
