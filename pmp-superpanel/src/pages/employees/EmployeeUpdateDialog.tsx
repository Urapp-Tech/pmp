import {
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  //   DialogDescription,
  DialogHeader,
  DialogTitle,
  //   DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Fields } from '@/interfaces/employee.interface';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import DragDropFile from '@/components/DragDropImgFile';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  formData: any;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
};

const EmployeeUpdateDialog = ({
  isOpen,
  setIsOpen,
  formData,
  callback,
  isLoader,
}: Props) => {
  const form = useForm<Fields>({
    defaultValues: {
      avatar: formData.avatar || '',
    },
  });
  const [file, setFile] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);

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

  const onSubmit = async (data: Fields | any) => {
    if (file) {
      data.avatar = file;
    } else {
      delete data.avatar;
    }
    data.id = formData.id;
    callback(data);
  };

  const handleOnClose = () => setIsOpen(false);

  return (
    <>
      {formData && (
        <Dialog open={isOpen} onOpenChange={handleOnClose}>
          <DialogContent
            className="sm:max-w-[600px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Update Employee</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="">
                  <div className="form-group w-full flex gap-3">
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
                          placeholder="Update Name"
                          type="text"
                          {...register('name', {
                            value: formData?.name,
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
                        <FormLabel
                          htmlFor="email"
                          className="text-sm font-medium"
                        >
                          Eamil
                        </FormLabel>
                        <Input
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="email"
                          placeholder="Update Email"
                          type="text"
                          {...register('email', {
                            value: formData.email,
                            required: 'Please enter your email',
                          })}
                        />
                        {errors.email && (
                          <FormMessage>*{errors.email.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
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
                          placeholder="Update Card Number"
                          type="text"
                          {...register('cardNumber', {
                            value: formData.cardNumber,
                          })}
                        />
                        {errors.cardNumber && (
                          <FormMessage>
                            *{errors.cardNumber.message}
                          </FormMessage>
                        )}
                      </div>
                    </FormControl>
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
                          placeholder="Update Phone Number"
                          type="number"
                          {...register('phone', {
                            value: formData.phone,
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
                          placeholder="Update Address"
                          type="text"
                          {...register('address', {
                            value: formData.address,
                          })}
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
                        <div className="col-span-6 flex items-center xl:justify-center 2xl:justify-start">
                          <img
                            className="max-h-[100px] max-w-[150px] rounded-md"
                            src={selectedImg}
                            alt="Shop Logo"
                          />
                        </div>
                      ) : getValues('avatar') ? (
                        <div className="col-span-6 flex items-center xl:justify-center 2xl:justify-start">
                          <img
                            className="max-h-[100px] max-w-[150px] rounded-md"
                            src={getValues('avatar')}
                            alt="Shop Logo"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <DialogFooter className="mt-3">
                    <Button disabled={isLoader} type="submit" className="w-24">
                      {isLoader && <Loader2 className="animate-spin" />} Update
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EmployeeUpdateDialog;
