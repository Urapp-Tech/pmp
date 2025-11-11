type Props = {
  bannerImage: string;
  title?: string;
  subTitle?: string;
};
const Banner = ({ bannerImage, title, subTitle }: Props) => {
  return (
    <div className="min-h-[420px] flex justify-start items-end  max-[1260px]:items-center">
      <img
        src={bannerImage}
        className="w-full h-[540px] absolute top-0 left-0 right-0 object-cover object-bottom-right
             z-[-2] max-[1440px]:h-[500px] max-[1024px]:opacity-50  max-[1024px]:object-cover max-[1024px]:object-top-center"
      />
      <div className="flex-1 flex max-w-[1256px] gap-x-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
        <h1 className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[50px]">
          {title}
        </h1>
        <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px]">
          {subTitle}
        </p>
      </div>
    </div>
  );
};

export default Banner;
