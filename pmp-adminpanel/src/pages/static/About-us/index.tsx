import assets from '@/assets/images';
import CounterSection from '@/components/Static/Counter';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import Caorusel from '@/components/Static/Slider/Carousel';

const About = () => {
  // const [isToggled, setIsToggled] = useState(true);

  // const handleToggle = () => {
  //     setIsToggled(!isToggled);
  // };
  return (
    <div className="">
      <Header />
      <div className="h-[100vh] flex justify-start max-[1260px]:items-center max-[992px]:h-[700px]">
        <img
          src={assets.images.aboutBanner}
          className="w-full h-[100vh] object-cover absolute top-0 z-[-1] max-[1260px]:h-[900px] max-[992px]:h-[650px]"
        />
        <div className="relative h-full flex-1 flex w-full">
          <div className="flex-1 flex  absolute bottom-40  max-w-[1023px] gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <h1 className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[50px]">
              About
            </h1>
            <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px]">
              Simple About. No hidden fees. Pay only for the properties you
              manage.
            </p>
            {/* <div className="flex items-center space-x-2">
                        <div
                            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isToggled ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-300'
                                }`}
                            onClick={handleToggle}
                        >
                            <div
                                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isToggled ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            ></div>
                        </div>
                        <span className="text-primary font-light text-[20px] select-none">Annually (Save up to 50%)</span>
                    </div> */}
          </div>
        </div>
      </div>

      <div className="w-full pb-10 bg-[#DFF4EC]">
        {/* <ResponsiveCarousel/> */}
        <Caorusel />
        <CounterSection />
        <div className="my-20 max-w-[1530px] mx-auto px-4">
          <p className="text-primary text-[96px] leading-tight font-normal text-center max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            At Rento, we believe property management should be{' '}
            <span className="text-[96px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
              simple, smart, and stress-free.
            </span>
          </p>
        </div>

        <div className="my-10 max-w-[1530px] ml-auto px-3">
          <h4 className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            our Story
          </h4>
          <p className="text-[24px] font-light text-primary">
            We built Rento to empower landlords, property managers, and tenants
            with a modern platform that brings everything into one easy-to-use
            solution. From managing properties and tenants to tracking payments,
            sending invoices, and keeping records secure, Rento keeps you in
            control with just a few clicks.
          </p>
          <div className="my-5 max-w-[1530px]">
            <img
              src={assets.images.aboutBanner1}
              className="w-full h-full max-w-full"
              alt="banner"
            />
          </div>
        </div>

        <div className="my-15 max-w-[1530px] mr-auto px-3">
          <h4 className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            Our Mission
          </h4>
          <p className="text-[24px] font-light text-primary">
            Our mission is to transform the rental experience in Kuwait by
            combining technology, transparency, and trust. Whether you own a
            single villa or manage a large portfolio of buildings, Rento is
            designed to save you time, reduce paperwork, and improve
            communication.
          </p>
          <div className="my-5 max-w-[1530px]">
            <img
              src={assets.images.aboutBanner2}
              className="w-full h-full max-w-full"
              alt="banner"
            />
          </div>
        </div>

        <div className="my-15 max-w-[1840px] mx-auto px-3">
          <h4 className="text-primary text-center text-[64px] font-medium">
            With Rento, you get:
          </h4>
          <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}

            <div className="group h-[500px] w-full [perspective:1000px]">
              <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                  {/* Image Section */}
                  <div className="h-[300px]">
                    <img
                      src={assets.images.card1}
                      alt="icon"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>

                  {/* Text Section */}
                  <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                    <img
                      src={assets.images.Iconfront1}
                      alt="icon"
                      className="w-[40px] h-[40px]"
                    />
                    <p className=" mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                      Smart Property Management
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <img
                    src={assets.images.back1}
                    alt="banner"
                    className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                  />
                  <div className="pt-4">
                    <img
                      src={assets.images.Iconback1}
                      className="w-[40px] h-[40px] mx-auto"
                    />
                    <h5 className="text-[28px] font-medium mt-4 text-[#DFF4EC] text-center max-[1440px]:text-[22px]">
                      Smart Property Management
                    </h5>
                  </div>

                  <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="group h-[500px] w-full [perspective:1000px]">
              <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                  {/* Image Section */}
                  <div className="h-[300px]">
                    <img
                      src={assets.images.card2}
                      alt="icon"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>

                  {/* Text Section */}
                  <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                    <img
                      src={assets.images.Iconfront2}
                      alt="icon"
                      className="w-[40px] h-[40px]"
                    />
                    <p className="  mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                      Automated Payments & Invoicing
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <img
                    src={assets.images.back2}
                    alt="banner"
                    className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                  />
                  <div className="pt-4">
                    <img
                      src={assets.images.Iconback2}
                      className="w-[40px] h-[40px] mx-auto"
                    />
                    <h5 className="text-[28px] text-center font-medium mt-4 text-[#DFF4EC] max-[1440px]:text-[22px]">
                      Automated Payments & Invoicing
                    </h5>
                  </div>

                  <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                    Say goodbye to delays—collect rent securely and on schedule,
                    every time.
                  </p>
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group h-[500px] w-full [perspective:1000px]">
              <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                  {/* Image Section */}
                  <div className="h-[300px]">
                    <img
                      src={assets.images.card3}
                      alt="icon"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>

                  {/* Text Section */}
                  <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                    <img
                      src={assets.images.Iconfront3}
                      alt="icon"
                      className="w-[40px] h-[40px]"
                    />
                    <p className="  mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                      Seamless Communication
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <img
                    src={assets.images.back3}
                    alt="banner"
                    className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                  />
                  <div className="pt-4">
                    <img
                      src={assets.images.Iconback3}
                      className="w-[40px] h-[40px] mx-auto"
                    />
                    <h5 className="text-[28px] font-medium mt-4 text-[#DFF4EC] text-center max-[1440px]:text-[22px]">
                      Seamless Communication
                    </h5>
                  </div>

                  <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </div>
              </div>
            </div>
            {/* Card 4 */}
            <div className="group h-[500px] w-full [perspective:1000px]">
              <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                  {/* Image Section */}
                  <div className="h-[300px]">
                    <img
                      src={assets.images.card4}
                      alt="icon"
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>

                  {/* Text Section */}
                  <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                    <img
                      src={assets.images.Iconfront4}
                      alt="icon"
                      className="w-[40px] h-[40px]"
                    />
                    <p className=" mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                      Secure Cloud Access
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <img
                    src={assets.images.back4}
                    alt="banner"
                    className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                  />
                  <div className="pt-4">
                    <img
                      src={assets.images.Iconback4}
                      className="w-[40px] h-[40px] mx-auto"
                    />
                    <h5 className="text-[28px] font-medium mt-4 text-[#DFF4EC] text-center max-[1440px]:text-[22px]">
                      Secure Cloud Access
                    </h5>
                  </div>

                  <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-15 mb-1 max-w-[1840px] mx-auto px-3">
          <h4 className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            Our Vision
          </h4>
          <p className="text-[24px] font-light text-primary">
            We’re passionate about helping property owners grow their business
            while giving tenants a smoother, more convenient renting experience.
            Rento is more than just software — it’s your trusted partner in
            property management.
          </p>
          <div className="my-5 max-w-full">
            <img
              src={assets.images.aboutBanner3}
              className="w-full h-full max-w-full"
              alt="banner"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
