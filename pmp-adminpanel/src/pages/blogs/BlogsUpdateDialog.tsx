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
import { Fields } from '@/interfaces/blog.interface';
import { Eye, EyeOff, FileDown, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import DragDropFile from '@/components/DragDropImgFile';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/role-permissions';
import { Textarea } from '@/components/ui/textarea';
import assets from '@/assets/images';
import DeleteDialog from '@/components/DeletePopup';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
  formData: any;
};

const BlogsUpdateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
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

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [planFiles, setPlanFiles] = useState<any>([]);
  const [selectedPlanImages, setSelectedPlanImages] = useState<any>([]);

  const [prevFiles, setPrevFiles] = useState<any>(formData?.images || []);
  const [deletedFiles, setDeletedFiles] = useState<any>([]);

  const [imageToDelete, setImageToDelete] = useState<{
    index: number | any;
    onChange: any;
    file: any;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    // if (file) data.images = file;
    data.images = planFiles;
    data.deletedPrevImages = deletedFiles;
    data.id = formData.id;
    // console.log('updated submit', data);
    callback(data);
  };

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

  const handleRemoveFile = (index: number, onChange: any, file: any) => {
    setImageToDelete({ index, onChange, file });
    setDeleteOpen(true);
  };

  const deleteUserHandler = (_: any) => {
    const deletedImgs = prevFiles.filter(
      (_: any, i: number) => i === imageToDelete?.index
    );
    setDeletedFiles((prev: any) => [...prev, ...deletedImgs]);
    if (typeof imageToDelete?.file === 'string') {
      setPrevFiles((prevFiles: any) => {
        const updatedFiles = [...prevFiles];
        updatedFiles.splice(imageToDelete?.index, 1);
        imageToDelete?.onChange(updatedFiles);
        return updatedFiles;
      });
    } else {
      setPlanFiles((prevFiles: any) => {
        const updatedFiles = [...prevFiles];
        updatedFiles.splice(imageToDelete?.index, 1);
        imageToDelete?.onChange(updatedFiles);
        return updatedFiles;
      });
    }
    setImageToDelete({ index: null, onChange: null, file: null });
    setDeleteOpen(false);
  };

  return (
    <>
      {deleteOpen && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title={'Blog'}
          formData={formData}
          callback={deleteUserHandler}
        />
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[900px] cs-dialog-box"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Update Blog</DialogTitle>
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
                              required: 'Please update your title name',
                              value: formData?.title,
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
                            {...register('description', {
                              value: formData?.description,
                            })}
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
                                validate: () => {
                                  if (
                                    [...prevFiles, ...planFiles]?.length > 0
                                  ) {
                                    return true;
                                  }
                                  return 'At least one image is required';
                                },
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
                              <FormMessage>
                                *{errors.images?.message}
                              </FormMessage>
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
                        {isLoader && <Loader2 className="animate-spin" />}{' '}
                        Update
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
                    if ([...prevFiles, ...planFiles]?.length > 0) {
                      return true;
                    }
                    return 'At least one image is required';
                  },
                }}
                render={({ field: { onChange } }) => (
                  <div>
                    <span className="text-sm mb-2 block font-medium underline-offset-2 underline">
                      Uploaded Images
                    </span>
                    {prevFiles?.length > 0 ? (
                      <div className="mt-2 p-2 flex flex-wrap rounded-2xl">
                        {prevFiles?.map((file: any, index: number) => (
                          <div
                            key={index}
                            className="ShowFileItem p-1 flex items-center relative"
                          >
                            <X
                              size={20}
                              className="absolute top-1 right-[-1px] cursor-pointer text-white bg-red-500 rounded-full p-1"
                              onClick={() =>
                                handleRemoveFile(index, onChange, file)
                              }
                            />
                            <div
                              className={`p-4 border-dashed border-0 flex items-center justify-center rounded-[20px] cursor-pointer bg-earth-bg w-[180px] h-[150px]
                            border-blue-500 bg-blue-50'
                            }`}
                            >
                              <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-[88px] h-[88px]">
                                  <img
                                    src={file}
                                    alt={file}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              />
              <Controller
                name="images"
                control={control}
                rules={{
                  validate: () => {
                    if ([...prevFiles, ...planFiles]?.length > 0) {
                      return true;
                    }
                    return 'At least one image is required';
                  },
                }}
                render={({ field: { onChange } }) => (
                  <div>
                    <span className="text-sm mb-2 block font-medium underline-offset-2 underline">
                      New Images
                    </span>
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
                              onClick={() =>
                                handleRemoveFile(index, onChange, file)
                              }
                            />
                            <div
                              className={`p-4 border-dashed border-0 flex items-center justify-center rounded-[20px] cursor-pointer bg-earth-bg w-[180px] h-[150px]
                          border-blue-500 bg-blue-50'
                          }`}
                            >
                              <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-[88px] h-[88px]">
                                  <img
                                    src={file}
                                    alt={file}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center items-center text-sm w-full">
                        New images not uploaded yet.
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogsUpdateDialog;
