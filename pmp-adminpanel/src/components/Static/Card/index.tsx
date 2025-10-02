import React from 'react';
import assets from '@/assets/images';

const Card: React.FC = () => {
  return (
    <div className="flex- justify-between items-center">
      <div className="group h-[500px] w-[438px] [perspective:1000px]">
        <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div className="max-h-[300px]">
              <img
                src={assets.images.card1}
                alt="icon"
                width={438}
                height={300}
                className="w-full h-auto rounded-t-sm"
              />
            </div>
            <div className="h-[200px] bg-white rounded-b-lg flex justify-center items-center flex-col gap-3">
              <img
                src={assets.images.icon1}
                alt="icon"
                className="w-[40px] h-[40px]"
              />
              <p className="max-w-[250px] mx-auto text-primary text-[32px] font-medium leading-1.1">
                Smart Property Management
              </p>
            </div>
          </div>

          {/* Back Side of the Card */}
          <div className="absolute inset-0 bg-[#242460] rounded-lg text-white p-6 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <img
              src={assets.images.card1}
              alt="banner"
              className="w-full h-full object-contain object-center absolute z-[-1]"
            />
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="41"
                height="40"
                viewBox="0 0 41 40"
                fill="none"
                className="mx-auto"
              >
                <path
                  d="M36.9163 6.6665H3.58301V33.3332H36.9163V6.6665ZM33.583 29.9998H6.91634V19.9998H33.583V29.9998ZM33.583 13.3332H6.91634V9.99984H33.583V13.3332Z"
                  fill="#DFF4EC"
                />
              </svg>
              <h5 className="text-[32px] font-medium mt-4 text-[#DFF4EC]">
                More Info
              </h5>
            </div>

            <p className="text-[24px] font-light  text-center mt-2 text-[#DFF4EC]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
      // card 2
      <div className="group h-[500px] w-[438px] [perspective:1000px]">
        <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div className="max-h-[300px]">
              <img
                src={assets.images.card1}
                alt="icon"
                width={438}
                height={300}
                className="w-full h-auto rounded-t-sm"
              />
            </div>
            <div className="h-[200px] bg-white rounded-b-lg flex justify-center items-center flex-col gap-3">
              <img
                src={assets.images.icon1}
                alt="icon"
                className="w-[40px] h-[40px]"
              />
              <p className="max-w-[250px] mx-auto text-primary text-[32px] font-medium leading-1.1">
                Smart Property Management
              </p>
            </div>
          </div>

          {/* Back Side of the Card */}
          <div className="absolute inset-0 bg-[#242460] rounded-lg text-white p-6 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <img
              src={assets.images.card1}
              alt="banner"
              className="w-full h-full object-contain object-center absolute z-[-1]"
            />
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="41"
                height="40"
                viewBox="0 0 41 40"
                fill="none"
                className="mx-auto"
              >
                <path
                  d="M36.9163 6.6665H3.58301V33.3332H36.9163V6.6665ZM33.583 29.9998H6.91634V19.9998H33.583V29.9998ZM33.583 13.3332H6.91634V9.99984H33.583V13.3332Z"
                  fill="#DFF4EC"
                />
              </svg>
              <h5 className="text-[32px] font-medium mt-4 text-[#DFF4EC]">
                More Info
              </h5>
            </div>

            <p className="text-[24px] font-light  text-center mt-2 text-[#DFF4EC]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
