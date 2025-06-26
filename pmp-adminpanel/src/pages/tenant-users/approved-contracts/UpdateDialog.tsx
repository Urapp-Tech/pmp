import {
  Dialog,
  DialogContent,
  //   DialogTrigger,
  DialogFooter,
  //   DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Fields } from '@/interfaces/back-office-user.interface';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DragDropFile from '@/components/DragDropImgFile';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/role-permissions';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
  formData: any;
};

const OfficeUserUpdateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}: Props) => {
  const form = useForm<Fields>({
    defaultValues: {
      password: '',
      avatar: formData.avatar || '',
      role: formData.role || '',
    },
  });

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

  const [file, setFile] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [roleLov, setRoleLov] = useState([]);

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    if (file) data.avatar = file;
    data.userType = 'USER';
    data.id = formData.id;
    callback(data);
    // console.log('s', data);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const fetchRoleLov = async () => {
    try {
      const roles = await service.lov();
      if (roles.data.success) {
        const lov = roles.data.data.map((el: any) => {
          return {
            name: el.name,
            id: el.id,
          };
        });
        setRoleLov(lov);
      } else {
        console.log('error: ', roles.data.message);
      }
    } catch (error: Error | unknown) {
      console.log('error: ', error);
    }
  };

  useEffect(() => {
    fetchRoleLov();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[600px] cs-dialog-box"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Update Admin User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="custom-form-section">
              <div className="form-group w-full flex gap-3">
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel
                      htmlFor="firstName"
                      className="text-sm font-medium"
                    >
                      First Name
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      id="firstName"
                      placeholder="john"
                      type="text"
                      {...register('firstName', {
                        value: formData?.firstName,
                        required: 'Please enter your first name',
                      })}
                    />
                    {errors.firstName && (
                      <FormMessage>*{errors.firstName.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel
                      htmlFor="lastName"
                      className="text-sm font-medium"
                    >
                      Last Name
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      id="lastName"
                      placeholder="doe"
                      type="text"
                      {...register('lastName', {
                        value: formData?.lastName,
                      })}
                    />
                    {/* {errors.lastName && (
                      <FormMessage>*{errors.lastName.message}</FormMessage>
                    )} */}
                  </div>
                </FormControl>
              </div>
              <div className="form-group w-full flex gap-3">
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel htmlFor="email" className="text-sm font-medium">
                      Eamil
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      id="email"
                      placeholder="johndoe@gmail.com"
                      type="text"
                      {...register('email', {
                        value: formData?.email,
                        required: 'Please enter your email',
                      })}
                    />
                    {errors.email && (
                      <FormMessage>*{errors.email.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
                {/* <div className="form-group w-full"> */}
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Password
                    </FormLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="********"
                        type={passwordVisible ? 'text' : 'password'}
                        className="text-sm pr-10 mt-2"
                        {...register('password', {
                          required: 'Please enter your password.',
                          value: '',
                        })}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="bg-transparent absolute inset-y-0 right-0 flex items-center pr-3 mt-[11px]"
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? (
                          <EyeOff color="black" />
                        ) : (
                          <Eye color="black" />
                        )}
                      </Button>
                      {errors.password && (
                        <FormMessage>*{errors.password.message}</FormMessage>
                      )}
                    </div>
                  </div>
                </FormControl>
                {/* </div> */}
              </div>
              <div className="form-group w-full flex items-center justify-center gap-3 m-1">
                <div className="w-full">
                  <FormLabel
                    htmlFor="phone"
                    className="text-sm font-medium my-2 block"
                  >
                    Roles
                  </FormLabel>
                  <SingleSelectDropDown
                    control={control}
                    name="role"
                    label=""
                    items={roleLov}
                    // value={formData.role}
                    placeholder="Choose an option"
                    rules={{ required: 'This field is required' }}
                  />
                </div>
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      id="phone"
                      placeholder="876543215"
                      type="number"
                      {...register('phone', {
                        required: 'Please enter your phone',
                        value: formData.phone,
                      })}
                    />
                    {errors.phone && (
                      <FormMessage>*{errors.phone.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
              </div>
              <FormControl className="m-1 w-full">
                <div className="">
                  <FormLabel htmlFor="address" className="text-sm font-medium">
                    Address
                  </FormLabel>
                  <Input
                    className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                    id="address"
                    placeholder="Street 55"
                    type="text"
                    {...register('address', { value: formData.address })}
                  />
                  {errors.address && (
                    <FormMessage>*{errors.address.message}</FormMessage>
                  )}
                </div>
              </FormControl>
              <div>
                <div className="flex justify-between">
                  <FormLabel
                    htmlFor="address"
                    className="text-sm font-medium my-3"
                  >
                    Upload Avatar
                  </FormLabel>
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
                    <div className="col-span-6 flex items-center justify-center xl:justify-center 2xl:justify-start">
                      <img
                        className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                        src={selectedImg}
                        alt="Shop Logo"
                      />
                    </div>
                  ) : getValues('avatar') ? (
                    <div className="col-span-6 flex items-center justify-center  xl:justify-center 2xl:justify-start">
                      <img
                        className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                        src={getValues('avatar')}
                        alt="Shop Logo"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <DialogFooter className="mt-3">
                <Button
                  disabled={isLoader}
                  type="submit"
                  className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
                >
                  {isLoader && <Loader2 className="animate-spin" />} Update
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OfficeUserUpdateDialog;
