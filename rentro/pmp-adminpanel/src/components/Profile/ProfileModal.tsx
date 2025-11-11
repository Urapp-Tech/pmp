import { useState, useEffect } from 'react';
import { Loader2, Eye, EyeOff, X } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import DragDropFile from '@/components/DragDropImgFile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ASSET_BASE_URL } from '@/utils/constants';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initial: any; // { fname, lname, email, phone, gender, profilePic/profile_pic }
  onSave: (payload: any) => Promise<void>;
  saving: boolean;
};

const ProfileModal = ({
  isOpen,
  onClose,
  initial,
  onSave,
  saving,
}: ProfileModalProps) => {
  const { toast } = useToast();

  const form = useForm<any>({
    defaultValues: {
      id: initial?.id ?? '',
      fname: initial?.fname ?? '',
      lname: initial?.lname ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      gender: initial?.gender ?? '',
      password: '',
      confirmPassword: '',
      profilePic: initial?.profilePic ?? initial?.profile_pic ?? '',
    },
  });

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = form;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwd = watch('password');

  // Reset on open/initial change
  useEffect(() => {
    if (!isOpen) return;
    reset({
      id: initial?.id ?? '',
      fname: initial?.fname ?? '',
      lname: initial?.lname ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      gender: initial?.gender ?? '',
      password: '',
      confirmPassword: '',
      profilePic: initial?.profilePic ?? initial?.profile_pic ?? '',
    });
    setFile(null);
    setPreview(null);
    setShowPwd(false);
    setShowConfirm(false);
  }, [isOpen, initial, reset]);

  const onSubmit = async (data: any) => {
    const payload = {
      id: data.id,
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      // Only send password if user entered it
      ...(data.password ? { password: data.password } : {}),
      profilePic: file ?? undefined, // File when changed
    };
    await onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !saving && !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden">
        <DialogHeader className="!h-[110px] p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-tl-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg capitalize mt-12 text-4xl font-semibold tracking-wide text-center ">
              Edit Profile
            </DialogTitle>
            {/* 3) Custom rounded close button */}
            <button
              type="button"
              onClick={() => onClose()}
              className="absolute right-2 top-6 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-primary-bg text-white shadow-md hover:opacity-90"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="bg-white rounded-bl-3xl px-6 pb-6 pt-5">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">
                      First Name
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] focus-visible:ring-0"
                      autoComplete="given-name"
                      {...register('fname', {
                        required: 'First name is required',
                      })}
                      placeholder="John"
                    />
                    {errors.fname && (
                      <FormMessage>*{String(errors.fname.message)}</FormMessage>
                    )}
                  </div>
                </FormControl>

                <FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Last Name
                    </FormLabel>
                    <Input
                      className="mt-2 text-[11px] focus-visible:ring-0"
                      autoComplete="family-name"
                      {...register('lname')}
                      placeholder="Doe"
                    />
                  </div>
                </FormControl>

                <FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <Input
                      className="mt-2 text-[11px] focus-visible:ring-0"
                      type="email"
                      readOnly
                      autoComplete="email"
                      {...register('email', { required: 'Email is required' })}
                      placeholder="johndoe@email.com"
                    />
                    {errors.email && (
                      <FormMessage>*{String(errors.email.message)}</FormMessage>
                    )}
                  </div>
                </FormControl>

                <FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">Phone</FormLabel>
                    <Input
                      className="mt-2 text-[11px] focus-visible:ring-0"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="87654321"
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: {
                          value: /^[9654]\d{7}$/,
                          message:
                            'Must start with 9, 6, 5, or 4 and be exactly 8 digits',
                        },
                      })}
                    />
                    {errors.phone && (
                      <FormMessage>*{String(errors.phone.message)}</FormMessage>
                    )}
                  </div>
                </FormControl>

                <div className="sm:col-span-1">
                  <FormLabel className="text-sm font-medium">Gender</FormLabel>
                  <SingleSelectDropDown
                    control={control}
                    name="gender"
                    label=""
                    items={[
                      { id: 'male', name: 'Male' },
                      { id: 'female', name: 'Female' },
                      { id: 'other', name: 'Other' },
                    ]}
                    placeholder="Choose gender"
                  />
                </div>

                {/* Password with visibility toggle */}
                <FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">
                      New Password (optional)
                    </FormLabel>
                    <div className="relative">
                      <Input
                        className="mt-2 pr-10 text-[11px] focus-visible:ring-0"
                        type={showPwd ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...register('password', {
                          pattern: {
                            value:
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
                            message:
                              'Min 8 chars with upper, lower, number & special',
                          },
                        })}
                        placeholder="********"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-1/2 -translate-y-1/2 mt-[2px] px-3"
                        onClick={() => setShowPwd((s) => !s)}
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                      >
                        {showPwd ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    {errors.password && (
                      <FormMessage>
                        *{String(errors.password.message)}
                      </FormMessage>
                    )}
                  </div>
                </FormControl>

                {/* Confirm Password with visibility toggle & match validation */}
                <FormControl>
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Confirm Password
                    </FormLabel>
                    <div className="relative">
                      <Input
                        className="mt-2 pr-10 text-[11px] focus-visible:ring-0"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...register('confirmPassword', {
                          validate: (v) =>
                            !pwd || v === pwd || 'Passwords do not match',
                        })}
                        placeholder="********"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-0 top-1/2 -translate-y-1/2 mt-[2px] px-3"
                        onClick={() => setShowConfirm((s) => !s)}
                        aria-label={
                          showConfirm
                            ? 'Hide confirm password'
                            : 'Show confirm password'
                        }
                      >
                        {showConfirm ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <FormMessage>
                        *{String(errors.confirmPassword.message)}
                      </FormMessage>
                    )}
                  </div>
                </FormControl>
              </div>

              {/* Avatar */}
              <div>
                <FormLabel className="text-sm font-medium">Avatar</FormLabel>
                <div className="grid grid-cols-12 gap-4 items-center mt-2">
                  <div className="col-span-12 sm:col-span-6 border-2 rounded border-scrollbar">
                    <DragDropFile
                    singleImage={true}
                      setFile={(f: File | null) => setFile(f)}
                      setImg={(url: string | null) => setPreview(url)}
                      setIsNotify={(text: string) =>
                        toast({
                          description: text,
                          className: cn(
                            'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
                          ),
                          style: { backgroundColor: '#5CB85C', color: 'white' },
                        })
                      }
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    {preview ? (
                      <img
                        src={preview}
                        alt="New avatar preview"
                        className="max-h-[100px] rounded-md"
                      />
                    ) : getValues('profilePic') ? (
                      <img
                        src={`${ASSET_BASE_URL}${getValues('profilePic')}`}
                        alt="Current avatar"
                        className="max-h-[100px] rounded-md"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-bg text-white"
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{' '}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
