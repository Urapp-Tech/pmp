import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, X, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import assets from '@/assets/images';
import { Fields } from '@/interfaces/support-tickets.interface';
import { getItem } from '@/utils/storage';
import { ASSET_BASE_URL } from '@/utils/constants';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
  formData: any;
};

const SupportTicketUpdateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}: Props) => {
  const userDetails: any = getItem('USER');

  const form = useForm({
    defaultValues: {
      subject: formData?.subject || '',
      message: formData?.message || '',
      images: [],
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

  const [planFiles, setPlanFiles] = useState<any>([]);
  const [selectedPlanImages, setSelectedPlanImages] = useState<any>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields | any) => {
    let obj: any = {
      id: formData.id,
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

  useEffect(() => {
    if (formData?.images?.length) {
      setExistingFiles(formData.images);
    }
  }, [formData]);

  const handleFileChange = async (
    onChange: any,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
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
    const previews: (string | { name: string; type: string })[] = [];

    await Promise.all(
      selectedFiles.map(async (file) => {
        if (!allowedTypes.includes(file.type)) {
          ToastHandler('Only images or supported document types allowed.');
          return;
        }

        validFiles.push(file);

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const result = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          previews.push(result);
        } else {
          previews.push({ name: file.name, type: file.type });
        }
      })
    );

    // Update file states
    if (validFiles.length > 0) {
      setPlanFiles((prev: File[]) => [...prev, ...validFiles]);
      setSelectedPlanImages((prev: any[]) => [...prev, ...previews]);
      onChange(validFiles);
    }
  };

  const handleRemoveFile = (index: number, onChange: any) => {
    const newImages = [...selectedPlanImages];
    const newFiles = [...planFiles];
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    setSelectedPlanImages(newImages);
    setPlanFiles(newFiles);
    onChange(newFiles);
  };

  const handleFileOnClick = (event: any) => {
    event.target.value = null;
    setPlanFiles([]);
    setSelectedPlanImages([]);
    setValue('images', []);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[900px] cs-dialog-box">
        <DialogHeader>
          <DialogTitle>Update Support Ticket</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-6">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="custom-form-section">
                  {/* Subject */}
                  <div className="form-group w-full flex gap-3">
                    <FormControl className="m-1 w-full">
                      <div>
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
                        {typeof errors.subject?.message === 'string' && (
                          <FormMessage>*{errors.subject.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
                  </div>

                  {/* Description */}
                  <div className="form-group w-full flex">
                    <FormControl className="m-1 w-full">
                      <div>
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

                  {/* File Upload */}
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
                    <div className="FormField">
                      <div className="ImageBox">
                        <Controller
                          name="images"
                          control={control}
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
                                      alt="upload-icon"
                                    />
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

                  {/* Footer */}
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
          </div>
          <div>
            {existingFiles?.length > 0 && (
              <div className="mt-6">
                <Label
                  htmlFor="existing-files"
                  className="text-sm underline underline-offset-2 font-medium my-3"
                >
                  Existing Uploaded Files
                </Label>
                <div className="mt-2 p-2 flex flex-wrap rounded-2xl">
                  {existingFiles.map((file: string, index: number) => {
                    const isImage = /\.(jpg|jpeg|png)$/i.test(file);
                    // const isPdf = /\.pdf$/i.test(file);
                    // const isDoc = /\.(doc|docx)$/i.test(file);
                    // const isXls = /\.(xls|xlsx)$/i.test(file);
                    const fileUrl = `${ASSET_BASE_URL}${file}`;
                    const fileName = file.split('/').pop();

                    return (
                      <div
                        key={index}
                        className="ShowFileItem p-1 flex items-center relative"
                      >
                        <div className="p-4 border-dashed flex items-center justify-center rounded-[20px] bg-earth-bg w-[180px] h-[150px]">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-[88px] h-[88px] flex items-center justify-center">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt="preview"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={fileName}
                                >
                                  <FileText
                                    className="text-lunar-bg cursor-pointer"
                                    size={50}
                                  />
                                </a>
                              )}
                            </div>
                            <div className="text-xs mt-1 line-clamp-1 w-[100px]">
                              {fileName}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="col-span-6">
            <Controller
              name="images"
              control={control}
              render={({ field: { onChange } }) => (
                <div>
                  <Label className="text-sm underline font-medium my-3">
                    Uploaded Files
                  </Label>
                  {selectedPlanImages.length > 0 ? (
                    <div className="mt-2 p-2 flex flex-wrap rounded-2xl">
                      {selectedPlanImages.map((item: any, index: number) => {
                        const isImage =
                          typeof item === 'string' &&
                          item.startsWith('data:image/');
                        return (
                          <div
                            key={index}
                            className="ShowFileItem p-1 flex items-center relative"
                          >
                            <X
                              size={20}
                              className="absolute top-1 right-[-1px] cursor-pointer text-white bg-red-500 rounded-full p-1"
                              onClick={() => handleRemoveFile(index, onChange)}
                            />
                            <div className="p-4 bg-blue-50 rounded-[20px] w-[180px] h-[150px] flex items-center justify-center">
                              {isImage ? (
                                <img
                                  src={item}
                                  alt="Uploaded"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                  <FileText
                                    className="text-lunar-bg"
                                    size={50}
                                  />
                                  <p className="text-xs mt-1 w-[100px] break-all text-center">
                                    {item?.name ||
                                      item?.split?.('/')?.pop() ||
                                      'Document'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center text-sm w-full h-[300px]">
                      No files uploaded.
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

export default SupportTicketUpdateDialog;
