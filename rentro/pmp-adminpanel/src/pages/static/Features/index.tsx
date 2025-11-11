import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';

const Features = () => {
  return (
    <div>
      <Header />
      <div className="h-[100vh] flex justify-start  max-[1260px]:h-[900px] max-[1260px]:flex-col max-[1260px]:gap-[] max-[1260px]:items-center max-[992px]:h-[700px]">
        <img
          src={assets.images.featureBanner}
          className="w-full h-[100vh] object-cover absolute top-0 z-[-1]  max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right"
        />
        <div className="relative h-full flex-1 flex w-full">
          <div className="flex-1 flex  absolute bottom-40  max-w-[1200px] gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <h1 className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[50px]">
              Features{' '}
            </h1>
            <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px]">
              Smart tools to simplify property management and boost efficiency.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full pb-10 bg-[#DFF4EC] px-5">
        <div className="max-w-[1700px] mr-auto">
          <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col max-[768px]:items-start">
            <div className="flex-1 max-w-[906px] translate-y-[-100px]">
              <img
                src={assets.images.Feature1}
                alt=""
                className="w-full h-full  "
              />
            </div>
            <div className="flex-1 max-w-[729px] mx-auto pl-10 max-[1260px]:pl-0 max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-10">
              <h2 className="py-4 text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
                For Landlords
              </h2>
              <ul className="my-3 px-10 max-[1024px]:px-2">
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  {' '}
                  Add & manage unlimited properties
                </li>
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Dashboard view of tenants, invoices & tickets
                </li>
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Automated rent reminders & collections
                </li>
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Download receipts & financial reports
                </li>
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Assign property managers with ease
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1700px] my-10 ml-auto">
          <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col-reverse max-[768px]:items-start">
            <div className="flex-1 max-w-[729px] mx-auto  max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-10">
              <h2 className="text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px] ">
                For Managers
              </h2>

              <ul className="my-3 px-10 max-[1024px]:px-2">
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  {' '}
                  Tenant database with contact details & unit status
                </li>

                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Monitor managed properties & rent summary
                </li>

                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Handle invoices & receipts digitally
                </li>

                <li className=" my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Respond to maintenance requests
                </li>

                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  {' '}
                  Communicate directly with landlords & tenants
                </li>
              </ul>
            </div>
            <div className="flex-1 max-w-[906px]  ">
              <img
                src={assets.images.Feature2}
                alt=""
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1700px] my-10 mr-auto">
          <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col max-[768px]:items-start">
            <div className="flex-1 max-w-[906px] xl:translate-y-[-50px]">
              <img
                src={assets.images.Feature3}
                alt=""
                className="w-full h-full  "
              />
            </div>
            <div className="flex-1 max-w-[729px] mx-auto pl-10 max-[1260px]:pl-0 max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-10">
              <h2 className="text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px] ">
                For Tenants
              </h2>

              <ul className="my-3 px-10 max-[1024px]:px-2">
                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  {' '}
                  Pay rent online in KD securely
                </li>

                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  View contracts & download receipts
                </li>

                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Submit & track maintenance requests
                </li>

                <li className=" my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  Access unit details & payment history
                </li>

                <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                  {' '}
                  Get reminders before due dates
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1700px] my-10 ml-auto">
          <div className="max-w-[1700px] my-10 ml-auto">
            <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col-reverse max-[768px]:items-start">
              <div className="flex-1 max-w-[729px] mx-auto  max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-10">
                <h2 className="text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px] ">
                  For Everyone
                </h2>

                <ul className="my-3 px-10 max-[1024px]:px-2">
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Multi-portal access (Landlord, Manager, Tenant, Admin)
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    24/7 cloud-based access (desktop & mobile)
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Arabic & English support
                  </li>

                  <li className=" my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Bank-grade payment security
                  </li>
                </ul>
              </div>
              <div className="flex-1 max-w-[906px]  ">
                <img
                  src={assets.images.Feature2}
                  alt=""
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Features;
