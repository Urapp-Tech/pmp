import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Fields } from '@/interfaces/role-permissions.interface';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import service from '@/services/adminapp/role-permissions';
import { breakCamelCase } from '@/utils/helper';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router';

const UpdateRolePermissionPage = () => {
  const form = useForm<Fields>();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<any>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [isLoader, setIsLoader] = useState(false);
  // console.log('state', state);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

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

  const onSubmit = async (data: Fields) => {
    if (checkedIds?.length <= 0) {
      ToastHandler('Please select atleast one permission');
      return;
    }
    setIsLoader(true);
    let obj = {
      name: data.name,
      permissions: checkedIds,
    };
    try {
      const response = await service.update(state.id, obj);
      if (response.data.success) {
        setIsLoader(false);
        navigate('../list');
      } else {
        setIsLoader(false);
        setMainIsLoader(false);
        ToastHandler(response.data.message);
        console.log('error: ', response.data.message);
      }
    } catch (error: Error | any) {
      setIsLoader(false);
      setMainIsLoader(false);
      ToastHandler(error.response.data.message);
      console.log('error: ', error);
    }
  };

  const compilePermissions = (data: any) => {
    const grouped: any = {};
    data.forEach((item: any) => {
      if (item.parent === null) {
        // Parent item
        grouped[item.id] = {
          ...item,
          child: [],
        };
      }
    });

    data.forEach((item: any) => {
      if (item.parent) {
        const parentId = item.parent;
        if (grouped[parentId]) {
          grouped[parentId].child.push(item);
        }
      }
    });

    return Object.values(grouped);
  };

  const fetch = async () => {
    try {
      const users = await service.permissionList();
      if (users.data.success) {
        setMainIsLoader(false);
        const result = compilePermissions(users.data.data.list);
        setList(result);
        console.log('res', result);

        const ids: any = [];
        result?.forEach((x: any) => {
          x.child.forEach((y: any) => {
            if (state.permissions.includes(y.id)) {
              return ids.push(y.id);
            }
          });
        });
        setCheckedIds(ids);
        setTotal(users.data.data.total);
      } else {
        setMainIsLoader(false);
        console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      setMainIsLoader(false);
      console.log('error: ', error);
    }
  };

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    setCheckedIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((checkedId) => checkedId !== id)
    );
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      const allIds = list.flatMap((item: any) =>
        item.child.map((child: any) => child.id)
      );
      setCheckedIds(allIds);
    } else {
      setCheckedIds([]);
    }
  };

  const isAllSelected = () => {
    const allIds = list.flatMap((item: any) =>
      item.child.map((child: any) => child.id)
    );

    return allIds.every((id: any) => checkedIds.includes(id));
  };

  useEffect(() => {
    fetch();
  }, []);

  return mainIsLoader ? (
    <div className="flex justify-center bg-white h-[80%] rounded-[20px]  items-center">
      <Loader2 className="animate-spin" />
    </div>
  ) : (
    <div className="grid grid-cols-12 bg-white p-2 rounded-[20px]">
      <div className="col-span-5 p-5">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <div className="form-group w-full gap-3">
                <h2 className="text-tertiary-bg font-semibold text-[20px] leading-normal capitalize">
                  Roles & Permissions
                </h2>
                <h5 className="text-lunar-bg font-semibold text-[14px] leading-normal capitalize mt-8 mb-4">
                  Update Role
                </h5>
                <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel htmlFor="name" className="text-sm font-semibold">
                      Name
                    </FormLabel>
                    <Input
                      className="rounded-[20px] h-[60px] px-2 bg-earth-bg text-secondary-bg mt-2 text-[14px] font-medium outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[0] focus-visible:ring-0"
                      id="name"
                      placeholder="manager"
                      type="text"
                      {...register('name', {
                        required: 'Please enter your role name',
                        value: state?.name ?? '',
                      })}
                    />
                    {errors.name && (
                      <FormMessage>*{errors.name.message}</FormMessage>
                    )}
                  </div>
                </FormControl>
                <div className="flex items-center justify-between mt-6">
                  <FormLabel
                    htmlFor="permissions"
                    className="text-sm font-semibold block"
                  >
                    Assign Permissions
                  </FormLabel>
                  <div className="flex items-center">
                    <Checkbox
                      id="select-all"
                      onCheckedChange={(isChecked: boolean) =>
                        handleSelectAll(isChecked)
                      }
                      checked={isAllSelected()}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium pl-2 leading-none"
                    >
                      Select All
                    </label>
                  </div>
                </div>
                <div className="mt-2">
                  {list.map((item: any, index: number) => (
                    <div className="mt-2" key={index}>
                      <FormLabel
                        htmlFor={item.name}
                        className="text-sm font-medium underline underline-offset-2"
                      >
                        {item.name}
                      </FormLabel>
                      <div className="flex py-2">
                        {item?.child?.map((child: any, i: number) => (
                          <div key={i} className="flex items-center">
                            <Checkbox
                              id={child.id}
                              checked={checkedIds.includes(child.id)}
                              onCheckedChange={(isChecked: any) =>
                                handleCheckboxChange(child.id, isChecked)
                              }
                            />
                            <label
                              htmlFor={child.id}
                              className="text-sm font-medium pr-6 pl-2 leading-none"
                            >
                              {breakCamelCase(child.name)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* <FormControl className="m-1 w-full">
                  <div className="">
                    <FormLabel htmlFor="desc" className="text-sm font-medium">
                      Description
                    </FormLabel>
                    <Textarea
                      className="rounded-[20px] h-[60px] p-3 bg-primary-bg text-secondary-bg mt-2 text-[14px] font-medium outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[0] focus-visible:ring-0"
                      id="desc"
                      placeholder="Type your message here."
                      {...register('description')}
                    />
                  </div>
                </FormControl> */}
              </div>
              <Button
                disabled={isLoader}
                type="submit"
                className="mt-7 ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
              >
                {isLoader ? <Loader2 className="animate-spin" /> : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateRolePermissionPage;
