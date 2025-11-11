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
import { useState } from 'react';
// import { Label } from '@/components/ui/label';
import DragDropFile from '@/components/DragDropImgFile';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Label } from '@/components/ui/label';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Checkbox } from '@/components/ui/checkbox';

import { toast } from '@/hooks/use-toast';
import { Fields } from '@/interfaces/employee.interface';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
};

const EmployeeCreationDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
}: Props) => {
  const form = useForm<Fields>();
  const [file, setFile] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    if (file) data.avatar = file;
    callback(data);
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[600px] cs-dialog-box"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="custom-form-section">
              <div className="form-group w-full flex gap-3">
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel htmlFor="name" className="text-sm font-medium">
                      Name
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      id="name"
                      placeholder="john doe"
                      type="text"
                      {...register('name', {
                        required: 'Please enter your name',
                      })}
                    />
                    {errors.name && (
                      <FormMessage>*{errors.name.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel htmlFor="email" className="text-sm font-medium">
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
              </div>
              <div className="form-group w-full my-2">
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
                        className="text-sm pr-10 mt-2 text-tertiary-bg"
                        {...register('password', {
                          required: 'Please enter your password.',
                        })}
                      />
                      <Button
                        variant="ghost"
                        type="button"
                        className="bg-transparent absolute inset-y-0 right-0 flex items-center pr-3 h-[60px] hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? (
                          <EyeOff color="black" />
                        ) : (
                          <Eye color="black" />
                        )}
                      </Button>
                      {<errors className="password"></errors> && (
                        <p></p>
                        // <FormMessage>*{errors.password.message}</FormMessage>
                      )}
                    </div>
                  </div>
                </FormControl>
              </div>
              <div className="form-group w-full my-2 cs-radio-wrap">
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="form-group w-full my-2">
                <div className="flex gap-2 items-center custom--checkbox">
                  <Checkbox /> <label>i agree terms</label>
                </div>
              </div>
              <div className="form-group w-full my-2">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <div className="form-group w-full flex gap-3">
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel
                      htmlFor="cardNumber"
                      className="text-sm font-medium"
                    >
                      Card Number
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      id="cardNumber"
                      placeholder="876543567"
                      type="text"
                      {...register('cardNumber')}
                    />
                    {errors.cardNumber && (
                      <FormMessage>*{errors.cardNumber.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
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
                      })}
                    />
                    {errors.phone && (
                      <FormMessage>*{errors.phone.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
              </div>
              <div>
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
                      id="address"
                      placeholder="Street 55"
                      type="text"
                      {...register('address')}
                    />
                    {errors.address && (
                      <FormMessage>*{errors.address.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
              </div>

              <div>
                <div className="flex justify-between">
                  <FormLabel
                    htmlFor="address"
                    className="text-sm font-medium my-3"
                  >
                    Select Theme
                  </FormLabel>
                </div>
                <div className="w-full my-2 select-field">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-mars-bg select-contents">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Button disabled={isLoader} type="submit" className="w-24">
                  {isLoader && <Loader2 className="animate-spin" />} Add
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeCreationDialog;
