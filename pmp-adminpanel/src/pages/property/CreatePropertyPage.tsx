import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { TopBar } from '@/components/TopBar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import service from '@/services/adminapp/property';
import { getItem } from '@/utils/storage';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Fields } from '@/interfaces/property.interface';

const CreatePropertyPage = () => {
  
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const landlord: any = getItem('USER');
  const navigate = useNavigate();

const form = useForm<Fields>({
  defaultValues: {
    landlord_id: landlord?.id || '',
    units: [
      {
        name: '',
        unit_no: '',
        unit_type: '',
        size: '',
        rent: '',
        status: '',
        description: '',
        bedrooms: '',
        bathrooms: '',
        water_meter: '',
        electricity_meter: '',
        pictures: [],
      },
    ],
  },
});
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'units',
});
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;
useEffect(() => {
  setMainIsLoader(false);
}, []);
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
  const formData = new FormData();

  // Append top-level property fields
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'pictures') {
      const files = Array.from(value as FileList);
      files.forEach((file) => formData.append('pictures', file));
    } else if (key !== 'units') {
      formData.append(key, value as string);
    }
  });

  // Handle units: send as JSON strings + unit pictures flat
  data.units.forEach((unit, index) => {
    const { pictures, ...unitData } = unit;
    const unitFiles = Array.from(pictures as unknown as FileList);


    // Tell backend how many pictures this unit has
    unitData.pictures_count = unitFiles.length;

    // Add unit data as JSON string
    formData.append('units_data', JSON.stringify(unitData));

    // Add each picture to a flat array
    unitFiles.forEach((file) => {
      formData.append('unit_pictures', file);
    });
  });

  // Submit to backend
  try {
    const response = await service.create(formData);
    if (response.data.success) {
      toast({ description: 'Property created successfully!' });
      reset();
      navigate('/property/list');
    } else {
      ToastHandler(response.data.message);
    }
  } catch (error: any) {
    ToastHandler(error?.response?.data?.message || 'An error occurred.');
  }
};


   return mainIsLoader ? (
    <div className="flex justify-center h-[80%] bg-white rounded-[20px] items-center">
      <Loader2 className="animate-spin" />
    </div>
  ) : (
    <div className="grid grid-cols-12 bg-white p-2 rounded-[20px]">
      <TopBar title="Add Property & Unit" />
      <div className="col-span-12 p-5">
        <Form {...form}>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden Landlord ID */}
            <input type="hidden" {...register('landlord_id')} />

            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'name', 'city', 'governance', 'address', 'address2',
              'description', 'property_type', 'type', 'paci_no',
              'property_no', 'civil_no', 'build_year', 'book_value',
              'estimate_value', 'latitude', 'longitude', 'status',
            ].map((field) => (
              <FormControl key={field} className="mb-4">
                <div>
                <FormLabel className="text-sm font-semibold capitalize">
                  {field.replace(/_/g, ' ')}
                </FormLabel>
                {field === 'description' ? (
                  <Textarea
                    {...register(field as keyof Fields)}
                    className="rounded-[20px] px-4 py-2 bg-earth-bg"
                  />
                ) : (
                  <Input
                    type="text"
                    {...register(field as keyof Fields)}
                    className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
                  />
                )}
                {errors[field as keyof Fields] && (
                  <FormMessage>
                    *{(errors[field as keyof Fields] as any)?.message}
                  </FormMessage>
                )}
                </div>
              </FormControl>
            ))}

            <FormControl className="mb-6">
              <div>
              <FormLabel className="text-sm font-semibold">Property Pictures</FormLabel>
              <Input
                type="file"
                multiple
                {...register('pictures')}
                className="rounded-[20px] bg-earth-bg"
              />
              </div>
              
            </FormControl>
</div>
            <h2 className="text-xl font-semibold mt-10 mb-4">Unit Details</h2>

{fields.map((field, index) => (
  <div
    key={field.id}
    className="border  rounded-[20px] p-4 mb-6 bg-gray-50 relative"
  >
   

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        'name', 'unit_no', 'unit_type', 'size', 'rent',
        'status', 'description', 'bedrooms', 'bathrooms',
        'water_meter', 'electricity_meter',
      ].map((unitField) => (
        <FormControl key={unitField} className="m-1 w-full">
          <div>
            <FormLabel className="text-sm font-semibold capitalize">
              {unitField.replace(/_/g, ' ')}
            </FormLabel>
            {unitField === 'description' ? (
              <Textarea
                {...register(`units.${index}.${unitField}`)}
                className="rounded-[20px] px-4 py-2 bg-earth-bg"
              />
            ) : (
              <Input
                type="text"
                {...register(`units.${index}.${unitField}`)}
                className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
              />
            )}
          </div>
        </FormControl>
      ))}

      <FormControl className="">
        <div>
        <FormLabel className="text-sm font-semibold">Unit Pictures</FormLabel>
        <Input
          type="file"
          multiple
          {...register(`units.${index}.pictures`)}
          className="rounded-[20px] bg-earth-bg"
        />
        </div>
        
      </FormControl>
    </div>
    <div className="text-right mt-4">
      <button
        type="button"
        onClick={() => remove(index)}
        className="  text-red-500 font-semibold"
      >
        🗑 Remove
      </button>
    </div>
  </div>
))}
<Button
  type="button"
  className="mb-6 text-sm font-semibold bg-gray-100 text-gray-800 px-4 py-2 rounded-[20px]"
  onClick={() =>
    append({
      name: '',
      unit_no: '',
      unit_type: '',
      size: '',
      rent: '',
      status: '',
      description: '',
      bedrooms: '',
      bathrooms: '',
      water_meter: '',
      electricity_meter: '',
      pictures: [],
    })
  }
>
  + Add Unit
</Button>

            <Button
              disabled={isSubmitting}
              type="submit"
              className="mt-7 w-[148px] h-[40px] bg-venus-bg rounded-[20px] text-sm font-semibold text-white"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePropertyPage;
