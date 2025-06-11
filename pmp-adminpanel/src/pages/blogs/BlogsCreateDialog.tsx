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
import { Fields } from '@/interfaces/blog.interface';
import { cn } from '@/lib/utils';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';

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

  const [planFiles, setPlanFiles] = useState<any>([]);
  const [selectedPlanImages, setSelectedPlanImages] = useState<any>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    callback(data);
  };

  // const droppedFile = e.dataTransfer.files[0];
  //   if (droppedFile) {
  //     const fileType = droppedFile.type;
  //     if (imageAllowedTypes.includes(fileType)) {
  //       setFile(droppedFile);
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         setImg(reader.result as string);
  //       };
  //       reader.readAsDataURL(droppedFile);
  //     } else {
  //       setIsNotify('Only .png, .jpg, and .jpeg files are allowed');
  //     }
  //   }

  const handleFileChange = async (onChange: any, event: any) => {
    const selectedFiles = Array.from(event.target.files || []); // Files from input
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    const validFiles: File[] = [];
    const fileReaders = selectedFiles.map((file: any) => {
      return new Promise<string | null>((resolve) => {
        if (allowedImageTypes.includes(file.type)) {
          validFiles.push(file);

          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        } else {
          ToastHandler('Only .jpeg, .jpg, .png images are allowed');
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[900px] cs-dialog-box"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Blog</DialogTitle>
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
                          id="title"
                          placeholder="news"
                          type="text"
                          {...register('title', {
                            required: 'Please enter your title name',
                          })}
                        />
                        {errors.title && (
                          <FormMessage>*{errors.title.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
                  </div>
                  <div className="form-group w-full flex">
                    <FormControl className="m-1 w-full">
                      <div className="">
                        <FormLabel
                          htmlFor="description"
                          className="text-sm font-medium"
                        >
                          Description
                        </FormLabel>
                        <Textarea
                          className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                          id="description"
                          placeholder="Type your message here."
                          {...register('description')}
                        />
                      </div>
                    </FormControl>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <FormLabel
                        htmlFor="address"
                        className="text-sm font-medium my-3"
                      >
                        Upload Images
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
                            rules={{
                              required: 'Required',
                            }}
                            render={({ field: { onChange } }) => (
                              <>
                                <div className="w-full flex h-[50px] items-center">
                                  <input
                                    accept="image/jpeg,image/png,image/jpg"
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
              rules={{
                validate: () => {
                  if (planFiles?.length > 0) {
                    return true;
                  }
                  return 'At least one image is required';
                },
              }}
              render={({ field: { onChange } }) => (
                <div>
                  <Label
                    htmlFor="address"
                    className="text-sm underline underline-offset-2 font-medium my-3"
                  >
                    New Images
                  </Label>
                  {selectedPlanImages?.length > 0 ? (
                    <div className="mt-2 p-2 flex flex-wrap rounded-2xl">
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
                            className={`p-4 border-dashed border-0 flex items-center justify-center rounded-[20px] bg-earth-bg w-[180px] h-[150px]
                            border-blue-500 bg-blue-50'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-[88px] h-[88px]">
                                <img
                                  src={file}
                                  alt="image"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center text-sm w-full h-[300px]">
                      Images not uploaded yet.
                    </div>
                  )}
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
