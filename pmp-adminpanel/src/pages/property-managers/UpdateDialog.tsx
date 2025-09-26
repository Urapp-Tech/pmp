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
import { Fields } from '@/interfaces/users.interface';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DragDropFile from '@/components/DragDropImgFile';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/role-permissions';
import { ASSET_BASE_URL } from '@/utils/constants';

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
      profilePic: formData.profilePic || '',
      fname: formData.fname || '',
      lname: formData.lname || '',
      email: formData.email || '',
      gender: formData.gender || '',
      phone: formData.phone || '',
    },
  });

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#5CB85C',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const [file, setFile] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    let obj: any = {
      id: formData.id,
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      password: data.password,
      phone: data.phone,
      gender: data.gender,
      roleType: 'Manager',
    };
    if (file) obj.profilePic = file;
    callback(obj);
    console.log('UPDATEs', obj);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-tl-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-2 text-4xl font-semibold tracking-wide">
              Update Manager User
            </DialogTitle>
            {/* 3) Custom rounded close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-6 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-primary-bg text-white shadow-md hover:opacity-90"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="bg-white rounded-bl-3xl px-6 pb-6 pt-5">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="custom-form-section">
                <div className="form-group w-full flex gap-3">
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="fname"
                        className="text-sm font-medium"
                      >
                        First Name
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="fname"
                        placeholder="john"
                        type="text"
                        {...register('fname', {
                          required: 'Please enter your first name',
                        })}
                      />
                      {errors.fname && (
                        <FormMessage>*{errors.fname.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="lname"
                        className="text-sm font-medium"
                      >
                        Last Name
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="lname"
                        placeholder="doe"
                        type="text"
                        {...register('lname')}
                      />
                      {/* {errors.lname && (
                        <FormMessage>*{errors.lname.message}</FormMessage>
                      )} */}
                    </div>
                  </FormControl>
                </div>
                <div className="form-group w-full flex gap-3">
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="email"
                        className="text-sm font-medium"
                      >
                        Email
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="email"
                        placeholder="johndoe@gmail.com"
                        type="text"
                        {...register('email', {
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
                            // required: 'Please enter your password.',
                            pattern: {
                              value:
                                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
                              message:
                                'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
                            },
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
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="phone"
                          className="text-sm font-medium"
                        >
                          Phone
                        </FormLabel>
                        <Input
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="phone"
                          placeholder="876543215"
                          type="tel"
                          inputMode="numeric"
                          {...register('phone', {
                            required: 'Please enter your phone',
                            pattern: {
                              value: /^[9654]\d{7}$/,
                              message:
                                'Phone must start with 9, 6, 5, or 4 and be exactly 8 digits',
                            },
                          })}
                        />
                        {errors.phone && (
                          <FormMessage>*{errors.phone.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
                  </div>
                  <div className="w-full">
                    <FormLabel
                      htmlFor="gender"
                      className="text-sm font-medium my-2 block"
                    >
                      Gender
                    </FormLabel>
                    <SingleSelectDropDown
                      control={control}
                      name="gender"
                      label=""
                      items={[
                        { id: 'male', name: 'Male' },
                        { id: 'female', name: 'Female' },
                        { id: 'other', name: 'Other' },
                      ]}
                      placeholder="Choose an option"
                      // rules={{ required: 'This field is required' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <FormLabel
                      htmlFor="address"
                      className="text-sm font-medium my-3"
                    >
                      Upload Avatar
                    </FormLabel>
                  </div>
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 border-2 rounded border-scrollbar mb-1">
                      <DragDropFile
                        setFile={setFile}
                        setImg={setSelectedImg}
                        setIsNotify={ToastHandler}
                      />
                    </div>
                    {selectedImg ? (
                      <div className="col-span-6 relative h-full rounded border-2 border-scrollbar flex items-center justify-center xl:justify-center 2xl:justify-start p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImg(null);
                            setFile(null);
                            // clear saved value if you want:
                            // form?.setValue?.('agreementDoc', '');
                          }}
                          className="absolute -right-3 -top-3 h-7 w-7 grid place-items-center rounded-full bg-scrollbar text-white shadow hover:opacity-90"
                          aria-label="Remove file"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <img
                          className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                          src={selectedImg}
                          alt="profilePic"
                        />
                      </div>
                    ) : getValues('profilePic') ? (
                      <div className="col-span-6 relative h-full rounded border-2 border-scrollbar flex items-center justify-center xl:justify-center 2xl:justify-start p-3">
                        <img
                          className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                          src={`${ASSET_BASE_URL}${getValues('profilePic')}`}
                          alt="profilePic"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
                <DialogFooter className="mt-3">
                  <Button
                    disabled={isLoader}
                    type="submit"
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                  >
                    {isLoader && <Loader2 className="animate-spin" />} Update
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfficeUserUpdateDialog;
