import { useEffect, useState } from 'react';
import DragDropFile from '@/components/DragDropImgFile';
import { TopBar } from '@/components/TopBar';
import { SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Fields } from '@/interfaces/setting.interface';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import settingService from '@/services/adminapp/setting';
import {
  Facebook,
  Instagram,
  PhoneCall,
  Linkedin,
  Loader2,
  Twitter,
  Youtube,
} from 'lucide-react';
import { getItem } from '@/utils/storage';
import { useDispatch } from 'react-redux';
import { setShopTenantState } from '@/redux/features/appSlice';
import { setSystemConfig } from '@/redux/features/authSlice';

const PanelSetting = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const userDetails: any = getItem('USER');
  const form = useForm<Fields>();
  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [bannerFile, setBannerFile] = useState<any>(null);
  const [settingData, setSettingData] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [selectedBannerImg, setSelectedBannerImg] = useState<any>(null);
  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#FF5733',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    setIsLoader(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('desc', data.desc);
    formData.append('media', JSON.stringify(data.media));
    if (file) formData.append('logo', file);
    if (bannerFile) formData.append('banner', bannerFile);
    try {
      const settingData = await settingService.updateSetting(formData);
      if (settingData.data.success) {
        setIsLoader(false);
        dispatch(setShopTenantState(settingData.data.data));
        dispatch(
          setSystemConfig({
            tenantLogo: settingData.data.data.logo,
            tenantBanner: settingData.data.data.banner,
          })
        );
        ToastHandler('Setting updated successfully');
      } else {
        setIsLoader(false);
        ToastHandler(settingData.data.message);
      }
    } catch (error: Error | any) {
      setIsLoader(false);
      ToastHandler(error.data.message);
    }
  };

  const fetchSetting = async () => {
    try {
      setMainIsLoader(true);
      const settingData = await settingService.getSetting();
      if (settingData.data.success) {
        setMainIsLoader(false);
        setSettingData(settingData.data.data);
        setValue('name', settingData.data.data.name);
        setValue('address', settingData.data.data.address);
        setValue('desc', settingData.data.data.description);
        setValue('media', settingData.data.data.media);
        setValue('logo', settingData.data.data.logo);
        setValue('banner', settingData.data.data.banner);
      } else {
        setMainIsLoader(false);
        // console.log('error: ', settingData.data.message);
      }
    } catch (error: Error | unknown) {
      setMainIsLoader(false);
      // console.log('error: ', error);
    }
  };

  const handleSocialLinks = () => {
    const socialMediaMap = {
      facebook: <Facebook />,
      instagram: <Instagram />,
      twitter: <Twitter />,
      whatsapp: <PhoneCall />,
      linkedin: <Linkedin />,
      youtube: <Youtube />,
    };
    const logosToShow = [];
    for (const [key, logo] of Object.entries(socialMediaMap)) {
      if (getValues(`media.${key}`)) {
        logosToShow.push(logo);
      }
    }
    if (logosToShow.length === 0) {
      // console.log('No social media links found', getValues('media'));
      return null;
    }
    return (
      <div className="flex gap-2 mt-4">
        {logosToShow?.map((logo, index) => (
          <span key={index} className="">
            {logo}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  return (
    <div className="">
      <TopBar title="App Setting" />
      {mainIsLoader ? (
        <div className="flex items-center w-full justify-center mt-[20%]">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="w-full grid grid-cols-12 gap-0">
            <div className="col-span-6">
              <div className="flex justify-between">
                <div className="mb-3 text-base">
                  <span className="font-semibold">Upload Vendor Logo</span>
                </div>
              </div>
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 mb-1">
                  <DragDropFile
                    setFile={setFile}
                    setImg={setSelectedImg}
                    setIsNotify={ToastHandler}
                  />
                </div>
                {selectedImg ? (
                  <div className="col-span-6 flex items-center xl:justify-center 2xl:justify-start">
                    <img
                      className="max-h-[100px] max-w-[150px] rounded-md"
                      src={selectedImg}
                      alt="Shop Logo"
                    />
                  </div>
                ) : getValues('logo') ? (
                  <div className="col-span-6 flex items-center xl:justify-center 2xl:justify-start">
                    <img
                      className="max-h-[100px] max-w-[150px] rounded-md"
                      src={getValues('logo')}
                      alt="Shop Logo"
                    />
                  </div>
                ) : null}
              </div>
              <span className="text-xs">Dimension: 256px by 100px</span>
              <div className="flex mt-5 justify-between">
                <div className="mb-3 text-base">
                  <span className="font-semibold">Upload Vendor Banner</span>
                </div>
              </div>
              <div className="grid grid-cols-12 items-center">
                <div className="col-span-5 mb-1">
                  <DragDropFile
                    setFile={setBannerFile}
                    setImg={setSelectedBannerImg}
                    setIsNotify={ToastHandler}
                  />
                </div>
                {selectedBannerImg ? (
                  <div className="col-span-6 flex items-center xl:justify-center 2xl:justify-start">
                    <img
                      className="max-h-[100px] max-w-[150px] rounded-md"
                      src={selectedBannerImg}
                      alt="Shop Logo"
                    />
                  </div>
                ) : getValues('banner') ? (
                  <div className="col-span-6 flex items-center xl:justify-center 2xl:justify-start">
                    <img
                      className="max-h-[100px] max-w-[150px] rounded-md"
                      src={getValues('banner')}
                      alt="banner Logo"
                    />
                  </div>
                ) : null}
              </div>
              <span className="text-xs">Dimension: 1080px by 1080px</span>
            </div>
            <div className="col-span-6">
              <div>
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="name"
                          className="text-sm font-medium"
                        >
                          Name
                        </FormLabel>
                        <Input
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="name"
                          placeholder="Siddiq Sons"
                          type="text"
                          {...register('name', {
                            required: 'Please enter your vendor name',
                          })}
                        />
                        {errors.name && (
                          <FormMessage>*{errors.name.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="address"
                          className="text-sm font-medium"
                        >
                          Address
                        </FormLabel>
                        <Input
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="email"
                          placeholder="Falcon Street, DD 4.5"
                          type="text"
                          {...register('address')}
                        />
                      </div>
                    </FormControl>
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="desc"
                          className="text-sm font-medium"
                        >
                          Description
                        </FormLabel>
                        <Textarea
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="desc"
                          placeholder="Type your message here."
                          {...register('desc')}
                        />
                      </div>
                    </FormControl>
                    <div className="flex justify-start items-center mt-5">
                      <div>
                        <Label className="">Socail Links</Label>
                      </div>
                      <div className="mx-4">
                        <Button
                          onClick={() => setIsOpen(true)}
                          variant="secondary"
                          type="button"
                        >
                          Add & Edit
                        </Button>
                      </div>
                    </div>
                    <div>{handleSocialLinks()}</div>
                    <div className="flex items-end justify-end">
                      <Button
                        disabled={isLoader}
                        className="mt-4"
                        type="submit"
                        variant="default"
                      >
                        {isLoader && <Loader2 className="animate-spin" />} Save
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
              {isOpen && (
                <SocailLinks
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  register={register}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      )}
    </div>
  );
};

const SocailLinks = ({ isOpen, setIsOpen, register }: any) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add & Edit Socail Links</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="https://www.facebook.com/"
                className="col-span-2 h-8 outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                {...register('media.facebook')}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="https://www.instagram.com/"
                className="col-span-2 h-8 outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                {...register('media.instagram')}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Twitter">Twitter</Label>
              <Input
                id="twitter"
                placeholder="https://www.twitter.com/"
                className="col-span-2 h-8 outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                {...register('media.twitter')}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Whats-app">Whats-app</Label>
              <Input
                id="whatsapp"
                placeholder="+9234565432"
                className="col-span-2 h-8 outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                {...register('media.whatsapp')}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Linkedin">Linkedin</Label>
              <Input
                id="linkedin"
                placeholder="https://www.linkedin.com/"
                className="col-span-2 h-8 outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                {...register('media.linkedin')}
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="Youtube">Youtube</Label>
              <Input
                id="youtube"
                placeholder="https://www.youtube.com/"
                className="col-span-2 h-8 outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                {...register('media.youtube')}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PanelSetting;
