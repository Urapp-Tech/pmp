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
import assets from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Fields } from '@/interfaces/support-tickets.interface';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { getItem } from '@/utils/storage';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
};

const BlogsCreateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
}: Props) => {
  const form = useForm<Fields>();
  const userDetails: any = getItem('USER');
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

  const [planFiles, setPlanFiles] = useState<any>([]);
  const [selectedPlanImages, setSelectedPlanImages] = useState<any>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    let obj: any = {
      senderId:
        userDetails?.role?.name === 'Landlord'
          ? userDetails?.landlordId
          : userDetails?.id,
      senderRoleId: userDetails?.role?.id,
      subject: data.subject,
      message: data.message,
    };
    if (data?.images?.length > 0) obj.images = data.images;
    console.log('data', obj);
    callback(obj);
  };

  const handleFileChange = async (onChange: any, event: any) => {
    const selectedFiles = Array.from(event.target.files || []); // Files from input
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];

    const validFiles: File[] = [];
    const fileReaders = selectedFiles.map((file: any) => {
      return new Promise<string | null>((resolve) => {
        if (allowedTypes.includes(file.type)) {
          validFiles.push(file);

          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          } else {
            // For docs, show a generic icon or filename
            resolve(file.name);
          }
        } else {
          ToastHandler('Only images or supported document types allowed.');
          resolve(null);
        }
      });
    });

    const imageUrls = (await Promise.all(fileReaders)).filter(
      (url) => url !== null
    ) as string[];

    if (validFiles.length > 0) {
      setPlanFiles((prevFiles: any) => [...(prevFiles || []), ...validFiles]);
      setSelectedPlanImages((prevImages: any) => [
        ...(prevImages || []),
        ...imageUrls,
      ]); // Store Image URLs
      onChange(validFiles);
    }
  };

  const handleFileOnClick = (event: any) => {
    event.target.value = null;
    setPlanFiles([]);
    setSelectedPlanImages([]);
  };

  const handleRemoveFile = (index: number, onChange: any) => {
    setSelectedPlanImages((prevFiles: any) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      onChange(updatedFiles);
      return updatedFiles;
    });
    setPlanFiles((prevFiles: any) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      onChange(updatedFiles);
      return updatedFiles;
    });
  };
  console.log('watch', errors, watch('images'));
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[800px] cs-dialog-box"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Request</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="custom-form-section">
                  <div className="form-group w-full flex gap-3">
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="title"
                          className="text-sm font-medium"
                        >
                          Title
                        </FormLabel>
                        <Input
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="subject"
                          placeholder="Rent listing issues"
                          type="text"
                          {...register('subject', {
                            required: 'Please enter your title name',
                          })}
                        />
                        {errors.subject && (
                          <FormMessage>*{errors.subject.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
                  </div>
                  <div className="form-group w-full flex">
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="message"
                          className="text-sm font-medium"
                        >
                          Description
                        </FormLabel>
                        <Textarea
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="message"
                          placeholder="Type your report here."
                          {...register('message')}
                        />
                      </div>
                    </FormControl>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <FormLabel
                        htmlFor="images"
                        className="text-sm font-medium my-3"
                      >
                        Upload Docs / Images
                        <span className="text-xs font-normal">
                          {' '}
                          ( Images should be in JPG, JPEG, or PNG format )
                        </span>
                      </FormLabel>
                    </div>
                    <div className="">
                      <div className="FormField">
                        <div className="ImageBox">
                          <Controller
                            name="images"
                            control={control}
                            // rules={{
                            //   required: 'Required',
                            // }}
                            render={({ field: { onChange } }) => (
                              <>
                                <div className="w-full flex h-[50px] items-center">
                                  <input
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                                    style={{ display: 'none' }}
                                    id="raised-button-files"
                                    type="file"
                                    multiple
                                    onChange={(event) =>
                                      handleFileChange(onChange, event)
                                    }
                                    onClick={handleFileOnClick}
                                  />
                                  <span className="bg-lunar-bg w-full rounded-2xl">
                                    <label
                                      htmlFor="raised-button-files"
                                      className="ImageLabel text-white flex h-[50px] justify-center items-center w-full "
                                    >
                                      <img
                                        width={22}
                                        src={assets.images.uploadIcon}
                                      />{' '}
                                      <span className="text-white px-1">
                                        Upload
                                      </span>
                                    </label>
                                  </span>
                                </div>
                              </>
                            )}
                          />
                          {errors.images && (
                            <FormMessage>*{errors.images?.message}</FormMessage>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-3">
                    <Button
                      disabled={isLoader}
                      type="submit"
                      className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
                    >
                      {isLoader && <Loader2 className="animate-spin" />} Add
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </div>
          <div className="col-span-6">
            <Controller
              name="images"
              control={control}
              // rules={{
              //   validate: () => {
              //     if (planFiles?.length > 0) {
              //       return true;
              //     }
              //     return 'At least one image is required';
              //   },
              // }}
              render={({ field: { onChange } }) => (
                <div>
                  <Label
                    htmlFor="address"
                    className="text-sm underline underline-offset-2 font-medium my-3"
                  >
                    Images
                  </Label>
                  {selectedPlanImages?.map((file: any, index: number) => (
                    <div
                      key={index}
                      className="ShowFileItem p-1 flex items-center relative"
                    >
                      <X
                        size={20}
                        className="absolute top-1 right-[-1px] cursor-pointer text-white bg-red-500 rounded-full p-1"
                        onClick={() => handleRemoveFile(index, onChange)}
                      />
                      <div
                        className={`p-4 border-dashed border-0 flex items-center justify-center rounded-[20px] bg-earth-bg w-[180px] h-[150px]`}
                      >
                        {file.startsWith('data:image') ? (
                          <img
                            src={file}
                            alt="preview"
                            className="w-[88px] h-[88px] object-contain"
                          />
                        ) : (
                          <span className="text-xs text-center break-all">
                            {file}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogsCreateDialog;
