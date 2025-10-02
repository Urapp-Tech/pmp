import assets from '@/assets/images';
// import Banner from '../components/banners/Banner'
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';

const Contact = () => {
  return (
    <div>
      <Header />
      {/* <Banner
                bannerImage={assets.images.contactBanner}
                title='Contact us'
                subTitle='Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et nulla a eu netus libero'
            /> */}
      {/* <div className="h-[420px] flex justify-start max-[1260px]:items-center max-[992px]:h-[350px]">
                <img src={assets.images.contactBanner} className="w-full max-w-full object-cover object-right  absolute top-0 z-[-1]  max-[1260px]:h-[350px] max-[992px]:object-right" />
                <div className="relative h-full flex-1 flex">
                    <div className="flex-1 flex  absolute bottom-5  max-w-[1200px] gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
                        <h1 className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[50px]">
                          Contact                       </h1>
                        <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px]">
                            Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et nulla a eu netus libero
                        </p>

                    </div>
                </div>

            </div> */}
      <div className="h-[540px] flex justify-start max-[1260px]:items-center">
        <img
          src={assets.images.contactBanner}
          className="w-full max-w-full h-[540px] object-cover object-right  absolute top-0 z-[-1]   max-[992px]:object-bottom max-[992px]:opacity-[0.3] max-[768px]:object-right"
        />
        <div className="relative h-full flex-1 flex">
          <div className="flex-1 flex  absolute bottom-5   gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <h1 className="capitalize mr-10 text-[100px]  font-normal leading-tight text-primary max-[1260px]:text-[50px] max-[1024px]:text-[50px] max-[768px]:text-[34px]">
              Contact Us
            </h1>
            <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]">
              Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et
              nulla a eu netus libero
            </p>
          </div>
        </div>
      </div>
      <div className=" p-10 bg-[#DFF4EC] max-[768px]:px-5">
        <div className="max-w-[923px] mx-auto bg-white rounded-[40px] p-8 shadow-sm">
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Faisal Khamees"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              First Name
            </label>
            <input
              type="text"
              placeholder="Rashid Hamad"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Last Name */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Rashid Hamad"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Role */}
          {/* <div className="mb-4">
                        <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                            Role
                        </label>
                        <select className="w-full rounded-lg font-light border border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option>Select Role</option>
                        </select>
                    </div> */}

          {/* Phone No */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Phone No.
            </label>
            <input
              type="tel"
              placeholder="+971527992240"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="write a message"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          {/* Checkbox */}
          <div className="flex items-center mb-6">
            <input
              id="agree"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agree" className="ml-2 text-xs text-gray-600">
              I agree to receive other communications from Rento.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-gradient-to-r from-green-400 to-blue-600 py-3 text-white text-sm font-normal shadow-md hover:opacity-90 transition"
          >
            Submit
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
