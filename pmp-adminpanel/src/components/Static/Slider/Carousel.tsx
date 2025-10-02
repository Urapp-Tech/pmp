// Import Swiper React components
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles

// @import './styles.css';

// import required modules
import assets from '@/assets/images';

export default function Caorusel() {
  return (
    <div className="translate-y-[-100px]">
      <Swiper
        slidesPerView={3.5}
        spaceBetween={30}
        autoplay={{
          delay: 3000, // normal smooth speed
          disableOnInteraction: false,
        }}
        breakpoints={{
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1.5,
            spaceBetween: 15,
          },
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
        }}
        modules={[Autoplay, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div className="flex-1">
            <img
              src={assets.images.aboutBox1}
              alt="banner"
              className="w-full rounded-2xl"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1">
            <img
              src={assets.images.aboutBox2}
              alt="banner"
              className="w-full rounded-2xl"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1">
            <img
              src={assets.images.aboutBox3}
              alt="banner"
              className="w-full rounded-2xl"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1">
            <img
              src={assets.images.aboutBox1}
              alt="banner"
              className="w-full rounded-2xl"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1">
            <img
              src={assets.images.aboutBox1}
              alt="banner"
              className="w-full rounded-2xl"
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex-1">
            <img
              src={assets.images.aboutBox1}
              alt="banner"
              className="w-full rounded-2xl"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
