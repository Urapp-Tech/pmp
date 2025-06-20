import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Form, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/TopBar';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import service from '@/services/adminapp/property';
import { Fields } from '@/interfaces/property.interface';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Papa from 'papaparse'; 

const UpdatePropertyPage = () => {
  const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [propertyPicturesPreview, setPropertyPicturesPreview] = useState<(File | string)[]>([]);
  const [unitPicturesPreview, setUnitPicturesPreview] = useState<Record<number, (File | string)[]>>({});
  const [removedUnitIds, setRemovedUnitIds] = useState<string[]>([]);

  const form = useForm<Fields>({
    defaultValues: {
      landlord_id: '',
      name: '',
      city: '',
      governance: '',
      address: '',
      address2: '',
      description: '',
      property_type: '',
      type: '',
      paci_no: '',
      property_no: '',
      civil_no: '',
      build_year: '',
      book_value: '',
      estimate_value: '',
      latitude: '',
      longitude: '',
      status: '',
      pictures: [],
      units: [],
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting }, control } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'units' });

  useEffect(() => {
    setMainIsLoader(true);
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const res = await service.getPropertyId(id);
        const property = res.data.property;

// Property Pictures
setPropertyPicturesPreview(
  (property.pictures || []).map((pic: string) =>
    pic.startsWith('http') ? pic : `${baseUrl}${pic}`
  )
);

// Unit Pictures
const previews: Record<number, (File | string)[]> = {};
property.units.forEach((u: any, i: number) => {
  previews[i] = (u.pictures || []).map((pic: string) =>
    pic.startsWith('http') ? pic : `${baseUrl}${pic}`
  );
});
setUnitPicturesPreview(previews);

        // Reset form values
        reset({
          ...property,
          pictures: [],
          units: property.units.map((u: any) => ({
            ...u,
            pictures: [],
          })),
        });

        setMainIsLoader(false);
      } catch (error) {
        toast({ description: 'Error loading property data' });
        navigate('/admin/property/list');
      }
    };
    fetchProperty();
  }, [id]);

  const onSubmit = async (data: Fields) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'pictures') {
        (value as File[]).forEach((file) => formData.append('pictures', file));
      } else if (key !== 'units') {
        formData.append(key, value as string);
      }
    });

    data.units.forEach((unit, index) => {
      const { pictures, ...unitData } = unit;
      const files = pictures as File[];
      unitData.pictures_count = files.length;
      formData.append('units_data', JSON.stringify(unitData));
      files.forEach((file) => formData.append('unit_pictures', file));
    });

    formData.append('removed_unit_ids', JSON.stringify(removedUnitIds));

    try {
      const response = await service.update(id!, formData);
      if (response.data.success) {
        toast({ description: 'Property updated successfully' });
        navigate('/admin/property/list');
      } else {
        toast({ description: response.data.message });
      }
    } catch (err) {
      toast({ description: 'Failed to update property' });
    }
  };

// Inside your component
const handleCSVUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const parsedUnits = results.data.map((row) => ({
        name: row.name || '',
        unit_no: row.unit_no || '',
        unit_type: row.unit_type || '',
        size: row.size || '',
        rent: row.rent || '',
        status: row.status || '',
        description: row.description || '',
        bedrooms: row.bedrooms || '',
        bathrooms: row.bathrooms || '',
        water_meter: row.water_meter || '',
        electricity_meter: row.electricity_meter || '',
        pictures: [], // CSV can't provide actual images
      }));

      // Append parsed units instead of replacing
      parsedUnits.forEach((unit) => append(unit));

      // Add blank picture previews for new units
      setUnitPicturesPreview((prev) => {
        const updated = { ...prev };
        const startIndex = fields.length;
        parsedUnits.forEach((_, i) => {
          updated[startIndex + i] = [];
        });
        return updated;
      });
    },
  });
};

  if (mainIsLoader) {
    return (
      <div className="flex justify-center h-[80%] bg-white rounded-[20px] items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 bg-white p-2 rounded-[20px]">
      <TopBar title="Update Property & Unit" />
      <div className="col-span-12 p-5">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
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
          {...form.register(field)}
          className="rounded-[20px] px-4 py-2 bg-earth-bg"
        />
      ) : field === 'type' ? (

    <SingleSelectDropDown
      {...form.register('type', { required: 'This field is required' })}
      value={form.watch('type')}
      onChange={(val) => form.setValue('type', val)}
      placeholder="Select Type"
      items={[
        { name: 'Residential', id: 'residential' },
        { name: 'Commercial', id: 'commercial' },
      ]}
    />
  ) : field === 'property_type' ? (
    <SingleSelectDropDown
      {...form.register('property_type', { required: 'This field is required' })}
      value={form.watch('property_type')}
      onChange={(val) => form.setValue('property_type', val)}
      placeholder="Select Property Type"
      items={[
        { name: 'Villa', id: 'villa' },
        { name: 'Building', id: 'building' },
        { name: 'Apartment', id: 'apartment' },
      ]}
    />
  ) : field === 'status' ? (
    <SingleSelectDropDown
      {...form.register('status', { required: 'This field is required' })}
      value={form.watch('status')}
      onChange={(val) => form.setValue('status', val)}
      placeholder="Select Status"
      items={[
        {  name: 'Available', id: 'available' },
        { name: 'Not Available', id: 'not_available' },
      ]}
    />
) : (
    <Input
      type="text"
      {...form.register(field)}
      className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
    />
  )}

      {form.formState.errors[field] && !['type', 'property_type', 'status'].includes(field) && (
        <FormMessage>
          *{form.formState.errors[field]?.message as string}
        </FormMessage>
      )}
    </div>
  </FormControl>
))}


            <FormControl className="mb-6">
              <div>
              <FormLabel className="text-sm font-semibold">Property Pictures</FormLabel>
<Input
  // name='pictures'
  type="file"
  multiple
  {...form.register('pictures')}
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    setPropertyPicturesPreview(files);
  }}
/>

<div className="flex flex-wrap gap-3 mt-3">
{propertyPicturesPreview.map((file, index) => {
  const imageUrl = file instanceof File ? URL.createObjectURL(file) : file;
  return (
    <div key={index} className="relative w-[80px] h-[80px]">
      <img
        src={imageUrl}
        alt="preview"
        className="w-full h-full object-cover rounded-lg border"
      />
      <button
        type="button"
        onClick={() => {
          const updated = [...propertyPicturesPreview];
          updated.splice(index, 1);
          setPropertyPicturesPreview(updated);
          form.setValue('pictures', updated.filter(f => f instanceof File), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
      >
        ✕
      </button>
    </div>
  );
})}

</div>
              </div>


            </FormControl>
</div>
            <h2 className="text-xl font-semibold mt-10 mb-4">Unit Details</h2>
<div className="mb-6">
  <FormLabel className="text-sm font-semibold">Upload Units CSV</FormLabel>
  <Input
    type="file"
    accept=".csv"
    onChange={handleCSVUpload}
    className="rounded-[20px] bg-earth-bg"
  />
  <p className="text-xs text-gray-500 mt-1">
    CSV should include columns: name, unit_no, unit_type, size, rent, status,
    description, bedrooms, bathrooms, water_meter, electricity_meter
  </p>
</div>
<div>
<div>
  {fields.length > 0 && (
  <Accordion
    className="w-full"
    type="multiple"
    defaultValue={["item-0"]} // must be array if type is multiple
  >
    {fields.map((field, index) => (
      <AccordionItem
        key={field.id}
        value={`item-${index}`}
        className="border rounded-[20px] p-0 bg-gray-50 mb-4 overflow-hidden"
      >
        <AccordionTrigger className="px-4 py-3 text-left text-base font-medium bg-gray-200">
          {`Section ${index + 1}`}
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-2">
          
          
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
                        ) : unitField === 'status' ? (
                          
                          <SingleSelectDropDown
                            {...register(`units.${index}.${unitField}`)}
                            value={form.watch(`units.${index}.${unitField}`)}
                            onChange={(val) => setValue(`units.${index}.${unitField}`, val)}
                            placeholder="Select Status"
                            items={[
                              { name: 'Available', id: 'available' },
                              { name: 'Not Available', id: 'not_available' },
                            ]}
                          />
                        ) : unitField === 'unit_type' ? (
          
              <SingleSelectDropDown
                {...form.register(`units.${index}.${unitField}`)}
                value={form.watch(`units.${index}.${unitField}`)}
                onChange={(val) => setValue(`units.${index}.${unitField}`, val)}
                placeholder="Select Type"
                items={[
                  { name: 'Residential', id: 'residential' },
                  { name: 'Commercial', id: 'commercial' },
                ]}
              />
            ) : (
                        <Input
                          type="text"
                          {...register(`units.${index}.${unitField}`)}
                          className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
                        />
                      )}
                      {errors.units?.[index]?.[unitField] && (
                        <FormMessage>
                          *{(errors.units[index][unitField] as any)?.message}
                        </FormMessage>
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
            // name={`units.${index}.pictures`}
            {...register(`units.${index}.pictures`)}
            className="rounded-[20px] bg-earth-bg"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
          
              // Set preview state
              setUnitPicturesPreview(prev => ({
                ...prev,
                [index]: files,
              }));
          
            }}
          />
          {/* {console.log("Unit Pictures:",watch(`units.${index}.pictures`))} */}
          <div className="flex flex-wrap gap-3 mt-3">
           {unitPicturesPreview[index]?.map((file, picIndex) => {
  const imageUrl = file instanceof File ? URL.createObjectURL(file) : file;
  return (
    <div key={picIndex} className="relative w-[80px] h-[80px]">
      <img
        src={imageUrl}
        alt="unit"
        className="w-full h-full object-cover rounded-lg border"
      />
      <button
        type="button"
        onClick={() => {
          const updated = [...unitPicturesPreview[index]];
          updated.splice(picIndex, 1);
          setUnitPicturesPreview(prev => ({ ...prev, [index]: updated }));
          form.setValue(`units.${index}.pictures`, updated.filter(f => f instanceof File), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
      >
        ✕
      </button>
    </div>
  );
})}

          </div>
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
        
        
       </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
)}
</div>
</div>

{/* <div>
  <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Information</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            Our flagship product combines cutting-edge technology with sleek
            design. Built with premium materials, it offers unparalleled
            performance and reliability.
          </p>
          <p>
            Key features include advanced processing capabilities, and an
            intuitive user interface designed for both beginners and experts.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express shipping
            ensures delivery within 1-2 business days.
          </p>
          <p>
            All orders are carefully packaged and fully insured. Track your
            shipment in real-time through our dedicated tracking portal.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return the
            item in its original condition.
          </p>
          <p>
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the returned
            item.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
</div> */}


<Button
  type="button"
className="mb-6 text-sm font-medium bg-gray-50 text-gray-700 px-5 py-3 rounded-2xl shadow-sm border border-gray-200 hover:text-white"
  onClick={() => {
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
  });
  setUnitPicturesPreview((prev) => ({
    ...prev,
    [fields.length]: [],
  }));
}}
>
  + Add Unit
</Button>

            <Button
              disabled={isSubmitting}
              type="submit"
              className="mt-7 w-[148px] h-[40px] bg-venus-bg rounded-[20px] text-sm font-semibold text-white"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Update'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdatePropertyPage;
