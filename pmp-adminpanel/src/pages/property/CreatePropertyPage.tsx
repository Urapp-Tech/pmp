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
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { Fields } from '@/interfaces/property.interface';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import Papa from 'papaparse';

const CreatePropertyPage = () => {
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const landlord: any = getItem('USER');
  const navigate = useNavigate();
  const [propertyPicturesPreview, setPropertyPicturesPreview] = useState<
    File[]
  >([]);
  const [unitPicturesPreview, setUnitPicturesPreview] = useState<
    Record<number, File[]>
  >({});
  const [csvMode, setCsvMode] = useState(false);

  const form = useForm<Fields>({
    defaultValues: {
      landlord_id: landlord?.landlordId || '',
      type: '',
      property_type: '',
      pictures: [], // ✅ add this
      status: '',
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
  // const { fields, append, remove } = useFieldArray({
  //   control: form.control,
  //   name: 'units',
  // });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
    setValue, // ✅ Add this
  } = form;
  useEffect(() => {
    setMainIsLoader(false);
  }, []);
  // useEffect(() => {
  //   return () => {
  //     // propertyPicturesPreview.forEach(file => URL.revokeObjectURL(file.preview));
  //     // Object.values(unitPicturesPreview).flat().forEach(file => URL.revokeObjectURL(file.preview));
  //   };
  // }, []);
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

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'pictures') {
        const files = Array.isArray(value)
          ? value
          : Array.from(value as FileList);

        files.forEach((file) => {
          // check if formData already has a 'pictures' entry
          if (!formData.has('pictures')) {
            // append the file to the existing 'pictures' entry
            formData.append('pictures', file);
          }
          // formData.append('pictures', file);
        });
      } else if (key !== 'units') {
        formData.append(key, value as string);
      }
    });

    // Handle units: metadata + flat pictures
    data.units.forEach((unit) => {
      const { pictures, ...unitData } = unit;

      const unitFiles = Array.isArray(pictures)
        ? pictures
        : Array.from(pictures as FileList);

      (unitData as any).pictures_count = unitFiles.length;

      // Append JSON-serialized unit metadata
      formData.append('units_data', JSON.stringify(unitData));

      // Append all unit pictures
      unitFiles.forEach((file) => {
        // check if formData already has a 'unit_pictures' entry
        if (!formData.has('unit_pictures')) {
          formData.append('unit_pictures', file);
        }
      });
    });

    // Submit to backend
    try {
      const response = await service.create(formData);
      if (response.data.success) {
        // toast({ description: 'Property created successfully!' });/
        toast({
                  description: response.data.message,
                  className: cn(
                    'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
                  ),
                  style: {
                    backgroundColor: '#5CB85C',
                    color: 'white',
                  },
                });
        reset();
        navigate('/admin-panel/property/list');
        setPropertyPicturesPreview([]);
        setUnitPicturesPreview({});
      } else {
        ToastHandler(response.data.message);
      }
    } catch (error: any) {
      ToastHandler(error?.response?.data?.message || 'An error occurred.');
    }
  };
  const handleCSVUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const { data, meta } = results;

        const REQUIRED_COLUMNS = [
          'name',
          'unit_no',
          'unit_type',
          'size',
          'rent',
          'status',
          'description',
          'bedrooms',
          'bathrooms',
          'water_meter',
          'electricity_meter',
        ];

        const VALID_UNIT_TYPES = ['commercial', 'residential'];
        const VALID_STATUSES = ['available', 'not_available'];

        // Check for missing columns
        const missingColumns = REQUIRED_COLUMNS.filter(
          (col) => !(meta.fields ?? []).includes(col)
        );

        if (missingColumns.length > 0) {
          ToastHandler(
            `Invalid CSV: Missing columns → ${missingColumns.join(', ')}`
          );
          return;
        }

        const validRows: any[] = [];
        let invalidRowIndex: number | null = null;

        for (let i = 0; i < data.length; i++) {
          const row = data[i] as Record<string, any>;

          // Check required fields are not empty
          const hasAllFields = REQUIRED_COLUMNS.every(
            (col) =>
              typeof row[col] !== 'undefined' &&
              row[col].toString().trim() !== ''
          );

          // Validate dropdown values
          const validType = VALID_UNIT_TYPES.includes(
            row.unit_type?.toLowerCase()
          );
          const validStatus = VALID_STATUSES.includes(
            row.status?.toLowerCase()
          );

          if (!hasAllFields || !validType || !validStatus) {
            invalidRowIndex = i + 1;
            break;
          }

          // Build final validated unit object
          validRows.push({
            name: row.name,
            unit_no: row.unit_no,
            unit_type: row.unit_type.toLowerCase(),
            size: row.size,
            rent: row.rent,
            status: row.status.toLowerCase(),
            description: row.description,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            water_meter: row.water_meter,
            electricity_meter: row.electricity_meter,
            pictures: [],
          });
        }

        if (invalidRowIndex !== null) {
          ToastHandler(
            `Invalid data in row ${invalidRowIndex}. Ensure all fields are filled, and 'unit_type' is 'commercial/residential', 'status' is 'available/not_available'.`
          );
          return;
        }

        // ✅ Correctly reset form with only required fields
        reset({
          ...form.getValues(),
          units: validRows,
          unit_count: validRows.length,
        });

        // ✅ Setup picture previews
        const previewMap: Record<number, File[]> = {};
        validRows.forEach((_, i) => (previewMap[i] = []));
        setUnitPicturesPreview(previewMap);

        // ✅ Enable CSV mode
        setCsvMode(true);

        ToastHandler('CSV uploaded successfully.');
      },
      error: function (err) {
        ToastHandler(`CSV Parse Error: ${err.message}`);
      },
    });
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
            <input type="hidden" {...form.register('landlord_id')} />

            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'name',
                'city',
                'governance',
                'address',
                'address2',
                'description',
                'property_type',
                'type',
                'paci_no',
                'property_no',
                'civil_no',
                'build_year',
                'book_value',
                'estimate_value',
                'latitude',
                'longitude',
                'status',
                'bank_name',
                'account_no',
                'account_name',
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
                        label=" Type"
                        {...form.register('type', {
                          required: 'This field is required',
                        })}
                        control={form.control}
                        placeholder="Select Type"
                        items={[
                          { name: 'Residential', id: 'residential' },
                          { name: 'Commercial', id: 'commercial' },
                        ]}
                      />
                    ) : field === 'property_type' ? (
                      <SingleSelectDropDown
                        {...form.register('property_type', {
                          required: 'This field is required',
                        })}
                        label="Property Type"
                        control={form.control}
                        placeholder="Select Property Type"
                        items={[
                          { name: 'Villa', id: 'villa' },
                          { name: 'Building', id: 'building' },
                          { name: 'Apartment', id: 'apartment' },
                        ]}
                      />
                    ) : field === 'status' ? (
                      <SingleSelectDropDown
                        {...form.register('status', {
                          required: 'This field is required',
                        })}
                        label='Status'
                        control={form.control}
                        placeholder="Select Status"
                        items={[
                          { name: 'Available', id: 'available' },
                          { name: 'Not Available', id: 'not_available' },
                        ]}
                      />
                    ) : (
                      <Input
                        type="text"
                        {...form.register(field as any, {
                          required: 'This field is required',
                        })}
                        className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
                      />
                    )}

                    {form.formState.errors[field as keyof Fields] &&
                      !['type', 'property_type', 'status'].includes(field) && (
                        <>
                          <FormMessage>
                            *{(form.formState.errors[field as keyof Fields]?.message) as string}
                          </FormMessage>
                        </>
                      )}
                  </div>
                </FormControl>
              ))}

              <FormControl className="mb-6">
                <div>
                  <FormLabel className="text-sm font-semibold">
                    Property Pictures
                  </FormLabel>
                  <Input
                    type="file"
                    multiple
                    {...form.register('pictures')}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setPropertyPicturesPreview(files);
                    }}
                  />

                  <div className="flex flex-wrap gap-3 mt-3">
                    {propertyPicturesPreview.map(
                      (file, index) =>
                        file instanceof File && (
                          <div
                            key={index}
                            className="relative w-[80px] h-[80px]"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="w-full h-full object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...propertyPicturesPreview];
                                updated.splice(index, 1);
                                setPropertyPicturesPreview(updated);

                                form.setValue('pictures', updated, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
                            >
                              ✕
                            </button>
                          </div>
                        )
                    )}
                  </div>
                </div>
              </FormControl>

              <FormControl className="mb-4">
                <div>
                  <FormLabel className="text-sm font-semibold">
                    Number of Units
                  </FormLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    {...form.register('unit_count', {
                      required: 'Please provide unit count',
                      min: { value: 1, message: 'At least 1 unit is required' },
                      max: { value: 100, message: 'Maximum 100 units allowed' },
                      valueAsNumber: true,
                    })}
                    className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
                    onChange={(e) => {
                      const value = e.target.value;
                      const count = parseInt(value, 10);

                      if (!value || isNaN(count)) return;

                      const existingUnits = form.getValues('units') || [];

                      let newUnits;
                      if (count > existingUnits.length) {
                        const additional = Array.from(
                          { length: count - existingUnits.length },
                          () => ({
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
                        );
                        newUnits = [...existingUnits, ...additional];
                      } else {
                        newUnits = existingUnits.slice(0, count);
                      }
                      form.unregister('units');

                      // ✅ Final fix: reset whole form with new values
                      form.reset({
                        ...form.getValues(), // preserve other values
                        unit_count: count,
                        units: newUnits,
                      });

                      form.clearErrors('units');

                      // ✅ Reset previews too
                      setUnitPicturesPreview((prev) => {
                        const updated: Record<number, File[]> = {};
                        for (let i = 0; i < count; i++) {
                          updated[i] = prev[i] || [];
                        }
                        return updated;
                      });
                    }}
                  />
                  {form.formState.errors.unit_count && (
                    <FormMessage>
                      *{form.formState.errors.unit_count.message}
                    </FormMessage>
                  )}
                </div>
              </FormControl>
            </div>
            <h2 className="text-xl font-semibold mt-10 mb-4">Unit Details</h2>
            <div className="mb-6">
              <FormLabel className="text-sm font-semibold">
                Upload Units CSV
              </FormLabel>
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="rounded-[20px] bg-earth-bg"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV should include columns: name, unit_no, size, rent,
                description, bedrooms, bathrooms, water_meter,
                electricity_meter, [unit_type is only (commercial, residential),
                status is only (available, not_available)]
              </p>
            </div>
            <Accordion
              className="w-full"
              type="multiple"
              defaultValue={(form.watch('units') || []).map(
                (_, idx) => `item-${idx}`
              )} // open all by default
            >
              {(form.watch('units') || []).map((field, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-[20px] p-0 bg-gray-50 mb-4 overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 text-left text-base font-medium bg-gray-200">
                    {`Unit ${index + 1}`}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-2">
                    <div
                      key={index}
                      className="border  rounded-[20px] p-4 mb-6 bg-gray-50 relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'name',
                          'unit_no',
                          'unit_type',
                          'size',
                          'rent',
                          'status',
                          'description',
                          'bedrooms',
                          'bathrooms',
                          'water_meter',
                          'electricity_meter',
                        ].map((unitField) => (
                          <FormControl key={unitField} className="m-1 w-full">
                            <div>
                              <FormLabel className="text-sm font-semibold capitalize">
                                {unitField.replace(/_/g, ' ')}
                              </FormLabel>
                              {unitField === 'description' ? (
                                <Textarea
                                  {...form.register(
                                    `units.${index}.${unitField}`
                                  )}
                                  className="rounded-[20px] px-4 py-2 bg-earth-bg"
                                />
                              ) : unitField === 'status' ? (
                                <SingleSelectDropDown
                                  {...form.register(
                                    `units.${index}.${unitField}`,
                                    {
                                      required: `${unitField.replace(/_/g, ' ')} is required`,
                                    }
                                  )}
                                  control={form.control}
                                  label="Status"
                                  placeholder="Select Status"
                                  items={[
                                    { name: 'Available', id: 'available' },
                                    {
                                      name: 'Not Available',
                                      id: 'not_available',
                                    },
                                  ]}
                                />
                              ) : unitField === 'unit_type' ? (
                                <SingleSelectDropDown
                                  {...form.register(
                                    `units.${index}.${unitField}`,
                                    {
                                      required: `${unitField.replace(/_/g, ' ')} is required`,
                                    }
                                  )}
                                  control={form.control}
                                  label="Unit Type"
                                  placeholder="Select Type"
                                  items={[
                                    { name: 'Residential', id: 'residential' },
                                    { name: 'Commercial', id: 'commercial' },
                                  ]}
                                />
                              ) : (
                                <Input
                                  type="text"
                                  {...form.register(
                                    `units.${index}.${unitField}` as any,
                                    {
                                      required: `${unitField.replace(/_/g, ' ')} is required`,
                                    }
                                  )}
                                  className="rounded-[20px] h-[50px] px-5 bg-earth-bg"
                                />
                              )}
                              {errors.units?.[index]?.[unitField as keyof typeof errors.units[number]] &&
                                ![
                                  'description',
                                  'status',
                                  'unit_type',
                                ].includes(unitField) && (
                                  <FormMessage>
                                    *
                                    {
                                      (
                                        errors?.units?.[index]?.[
                                          unitField as keyof typeof errors.units[number]
                                        ] as { message?: string }
                                      )?.message
                                    }
                                  </FormMessage>
                                )}
                            </div>
                          </FormControl>
                        ))}

                        <FormControl className="">
                          <div>
                            <FormLabel className="text-sm font-semibold">
                              Unit Pictures
                            </FormLabel>
                            <Input
                              type="file"
                              multiple
                              // name={`units.${index}.pictures`}
                              {...form.register(`units.${index}.pictures`)}
                              className="rounded-[20px] bg-earth-bg"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);

                                // Set preview state
                                setUnitPicturesPreview((prev) => ({
                                  ...prev,
                                  [index]: files,
                                }));
                              }}
                            />
                            <div className="flex flex-wrap gap-3 mt-3">
                              {unitPicturesPreview[index]?.map(
                                (file, picIndex) =>
                                  file instanceof File && (
                                    <div
                                      key={picIndex}
                                      className="relative w-[80px] h-[80px]"
                                    >
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt="unit"
                                        className="w-full h-full object-cover rounded-lg border"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [
                                            ...unitPicturesPreview[index],
                                          ];
                                          updated.splice(picIndex, 1);
                                          setUnitPicturesPreview((prev) => ({
                                            ...prev,
                                            [index]: updated,
                                          }));
                                          form.setValue(
                                            `units.${index}.pictures`,
                                            updated,
                                            {
                                              shouldValidate: true,
                                              shouldDirty: true,
                                            }
                                          );
                                        }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        </FormControl>
                      </div>
                      <div className="text-right mt-4">
                        {/* <button
                          type="button"
                          onClick={() => remove(index)}
                          className="  text-red-500 font-semibold"
                        >
                          🗑 Remove
                        </button> */}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {/* <Button
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
    bank_name: '',
    account_no: '',
    account_name: '',
    pictures: [],
  });
  setUnitPicturesPreview((prev) => ({
    ...prev,
    [fields.length]: [],
  }));
}}
>
  + Add Unit
</Button> */}

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
