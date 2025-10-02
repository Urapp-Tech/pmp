import { useState } from 'react';
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import SelectedPlanModal from '@/components/Static/Model';

const Pricing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggled, setIsToggled] = useState(true);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };
  return (
    <div className="">
      <Header />
      <div className="h-[800px] flex justify-start max-[1260px]:items-center max-[992px]:h-[700px]">
        <img
          src={assets.images.priceBanner}
          className="w-full      object-cover absolute top-0 z-[-1] max-[1260px]:h-[900px] max-[992px]:h-[650px]"
        />
        <div className="relative h-full flex-1 flex w-full">
          <div className="w-full flex-1 flex  absolute bottom-40   gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <div className="  max-w-[1024px] flex gap-x-10 items-center justify-between max-[1440px]:flex-col max-[1440px]:gap-13 max-[1440px]:items-start max-[1440px]:w-full">
              <h1 className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[50px]">
                Pricing
              </h1>
              <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px]">
                Simple pricing. No hidden fees. Pay only for the properties you
                manage.
              </p>
            </div>

            <div className="  flex items-center space-x-2 max-[1440px]:w-full max-[1440px]:justify-end">
              <div
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  isToggled
                    ? 'bg-gradient-to-r from-green-500 to-blue-500'
                    : 'bg-gray-300'
                }`}
                onClick={handleToggle}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    isToggled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </div>
              <span className="text-primary font-light text-[20px] select-none">
                Annually (Save up to 50%)
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full pb-10 bg-[#DFF4EC] ">
        <div className="flex justify-center gap-3 items-center  p-4 max-[992px]:flex-col translate-y-[-100px]">
          <div className="flex-1">
            <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
              <div className="space-y-4 mb-8">
                <h2 className="text-[36px] m-0 font-medium">Building</h2>
                <h1 className="text-[64px] m-0 font-medium tracking-tight">
                  40KD
                </h1>
                <p className="text-[20px] font-normal text-white ">
                  /property per month (billed annually)
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Post unlimited building listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Highlighted placement for better reach</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Dedicated support assistance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Advanced property analytics & insights</span>
                </li>
              </ul>

              <p className="text-[20px] font-light text-white mb-8">
                A bold structure built for purpose and scale—where design meets
                ambition in every floor.
              </p>

              <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                Subscribe Now
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
              <div className="space-y-4 mb-8">
                <h2 className="text-[36px] m-0 font-medium">House/Villa</h2>
                <h1 className="text-[64px] m-0 font-medium tracking-tight">
                  20KD
                </h1>
                <p className="text-[20px] font-normal text-white ">
                  /property per month (billed annually)
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Post up to 5 house/villa listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Priority in search results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Option to add high-quality photos/videos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Promote your property with “Featured” tag</span>
                </li>
              </ul>

              <p className="text-[20px] font-light text-white mb-8">
                A personal sanctuary wrapped in style and space, crafted for
                comfort and character.
              </p>

              <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                Subscribe Now1
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
              <div className="space-y-4 mb-8">
                <h2 className="text-[36px] m-0 font-medium">Apartment</h2>
                <h1 className="text-[64px] m-0 font-medium tracking-tight">
                  10KD
                </h1>
                <p className="text-[20px] font-normal text-white ">
                  /property per month (billed annually)
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Post up to 3 apartment listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Standard placement in search results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Photo uploads included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Easy property management dashboard</span>
                </li>
              </ul>

              <p className="text-[20px] font-light text-white mb-8">
                Smart living stacked with convenience—urban rhythm in a compact,
                curated shell.
              </p>

              <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[1372px] mx-auto px-5">
          <h3 className="mt-5 text-primary text-[100px] font-normal leading-norma max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            All plans include
          </h3>
          <div className="mt-18 mb-5 flex justify-between gap-x-5 gap-y-10  flex-wrap">
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon1}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Property Dashboard
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Manage all your properties in one place. From rent collection to
                tenant details, everything is organized in a clean, easy-to-use
                dashboard designed to save you time.
              </p>
            </div>
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon2}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Secure Listings
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Your property details are fully protected. You decide who has
                access whether it’s just you or selected managers with
                customized permissions.
              </p>
            </div>
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon3}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Multi-device Access
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Work the way you want. Whether you’re at your desk or on the go,
                you can access your account on mobile, tablet, or desktop.
              </p>
            </div>
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon4}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Photo & Video Uploads
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Upload photos of your buildings and units so you always have a
                clear record of your properties right inside the platform.
              </p>
            </div>
            {/* <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
                            <div className="w-[50px] mb-4">
                                <img src={assets.images.icon5} className="w-full h-full" alt="icon" />
                            </div>
                            <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                                Location Maps
                            </h4>
                            <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                                Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et nulla a eu netus libero neque. Tortor integer eu sed facilisis. Risus diam at eget enim eros condimentum. Nisi vestibulum diam in mattis morbi elit sed cursus ornare.
                            </p>
                        </div> */}
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon6}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Direct Inquiries
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Stay connected with your tenants. They can reach you directly
                through the platform, making communication simple and secure.
              </p>
            </div>
            {/* <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
                            <div className="w-[50px] mb-4">
                                <img src={assets.images.icon7} className="w-full h-full" alt="icon" />
                            </div>
                            <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                                Social Sharing
                            </h4>
                            <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                                Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et nulla a eu netus libero neque. Tortor integer eu sed facilisis. Risus diam at eget enim eros condimentum. Nisi vestibulum diam in mattis morbi elit sed cursus ornare.
                            </p>
                        </div> */}
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon8}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Property Insights
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Track rent income, expenses, and overall property performance to
                stay in control of your finances.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SelectedPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </div>
  );
};

export default Pricing;
