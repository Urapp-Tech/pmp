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
      complete: function (results: any) {
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
      error: function (err: any) {
        ToastHandler(`CSV Parse Error: ${err.message}`);
      },
    });
  };

  return mainIsLoader ? (
    <div className="flex justify-center h-[80%] bg-white items-center">
      <Loader2 className="animate-spin" />
    </div>
  ) : (
    <div className="grid grid-cols-12 bg-secondary-bg p-2">
      <div className="col-span-12 p-5">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden Landlord ID */}
            <input type="hidden" {...form.register('landlord_id')} />

            <h2 className="text-4xl font-bold text-primary-bg mb-4">
              Property Details
            </h2>

            {/* Row 1: Name | City | Governance */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm text-primary-bg font-semibold">
                  Name
                </FormLabel>
                <Input
                  {...form.register('name', {
                    required: 'This field is required',
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.name && (
                  <FormMessage>*{errors.name.message}</FormMessage>
                )}
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm text-primary-bg font-semibold">
                  City
                </FormLabel>
                <Input
                  {...form.register('city', {
                    required: 'This field is required',
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.city && (
                  <FormMessage>*{errors.city.message}</FormMessage>
                )}
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm text-primary-bg font-semibold">
                  Governance
                </FormLabel>
                <Input
                  {...form.register('governance', {
                    required: 'This field is required',
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.governance && (
                  <FormMessage>*{errors.governance.message}</FormMessage>
                )}
              </div>
            </div>

            {/* Row 2: Address (full) */}
            <div className="mt-4">
              <FormLabel className="text-sm text-primary-bg font-semibold">
                Address
              </FormLabel>
              <Input
                {...form.register('address', {
                  required: 'This field is required',
                })}
                className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
              />
              {errors.address && (
                <FormMessage>*{errors.address.message}</FormMessage>
              )}
            </div>

            {/* Row 3: Address 2 (full) */}
            <div className="mt-4">
              <FormLabel className="text-sm text-primary-bg font-semibold">
                Address 2
              </FormLabel>
              <Input
                {...form.register('address2')}
                className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
              />
            </div>

            {/* Row 4: Description (full textarea) */}
            <div className="mt-4">
              <FormLabel className="text-sm text-primary-bg font-semibold">
                Description
              </FormLabel>
              <Textarea
                {...form.register('description')}
                className="rounded-[18px] px-4 py-3 bg-dialogBg focus-visible:ring-0 min-h-[150px]"
              />
            </div>

            {/* Row 5: Property Type | Type | PACI No. */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Property Type
                </FormLabel>
                <SingleSelectDropDown
                  control={form.control}
                  placeholder="Select Property Type"
                  label="Property Type"
                  items={[
                    { name: 'Villa', id: 'villa' },
                    { name: 'Building', id: 'building' },
                    { name: 'Apartment', id: 'apartment' },
                  ]}
                  {...form.register('property_type', {
                    required: 'This field is required',
                  })}
                  customClassName="p-select-field"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Type
                </FormLabel>
                <SingleSelectDropDown
                  control={form.control}
                  placeholder="Select Type"
                  label="Type"
                  items={[
                    { name: 'Residential', id: 'residential' },
                    { name: 'Commercial', id: 'commercial' },
                  ]}
                  {...form.register('type', {
                    required: 'This field is required',
                  })}
                  customClassName="p-select-field"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  PACI No.
                </FormLabel>
                <Input
                  {...form.register('paci_no')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Row 6: Property No. | Civil No. | Build Year */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Property No.
                </FormLabel>
                <Input
                  {...form.register('property_no')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Civil No.
                </FormLabel>
                <Input
                  {...form.register('civil_no')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Build Year
                </FormLabel>
                <Input
                  {...form.register('build_year')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Row 7: Book Value | Estimate Value | (empty spacer or Email) */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Book Value
                </FormLabel>
                <Input
                  {...form.register('book_value')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Estimate Value
                </FormLabel>
                <Input
                  {...form.register('estimate_value')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  {...form.register('email')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Row 8: Latitude | Longitude | Status */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Latitude
                </FormLabel>
                <Input
                  {...form.register('latitude')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Longitude
                </FormLabel>
                <Input
                  {...form.register('longitude')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Status
                </FormLabel>
                <SingleSelectDropDown
                  control={form.control}
                  label="Status"
                  placeholder="Select Status"
                  items={[
                    { name: 'Available', id: 'available' },
                    { name: 'Not Available', id: 'not_available' },
                  ]}
                  {...form.register('status', {
                    required: 'This field is required',
                  })}
                  customClassName="p-select-field"
                />
              </div>
            </div>

            {/* Row 9: Phone | Number Of Units | Email already placed above (or keep here if you prefer) */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Phone
                </FormLabel>
                <Input
                  type="number"
                  {...form.register('phone', {
                    pattern: {
                      value: /^[9654]\d{7}$/,
                      message:
                        'Phone must start with 9, 6, 5, or 4 and be exactly 8 digits',
                    },
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.phone && (
                  <FormMessage>*{errors.phone.message}</FormMessage>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Number Of Units
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
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.unit_count && (
                  <FormMessage>*{errors.unit_count.message}</FormMessage>
                )}
              </div>

              {/* <div className="col-span-12 md:col-span-4" /> */}
            </div>

            {/* Row 10: Bank Name | Account Name | IBAN No. */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Bank Name
                </FormLabel>
                <Input
                  {...form.register('bank_name')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Beneficiary Name
                </FormLabel>
                <Input
                  {...form.register('account_name')}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  IBAN No.
                </FormLabel>
                <Input
                  {...form.register('iban_no', {
                    pattern: {
                      value: /^QA\d{2}[A-Z]{4}\d{21}$/,
                      message:
                        'IBAN must start with QA, have 2 check digits, 4-letter bank code, and 21-digit account number',
                    },
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.iban_no && (
                  <FormMessage>*{errors.iban_no.message}</FormMessage>
                )}
              </div>
              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Account No.
                </FormLabel>
                <Input
                  {...form.register('account_no', {
                    pattern: {
                      value: /^\d{21}$/,
                      message: 'Account number must be exactly 21 digits',
                    },
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.account_no && (
                  <FormMessage>*{errors.account_no.message}</FormMessage>
                )}
              </div>
            </div>

            {/* Row 11: Account No. (full width) */}

            {/* Row 12: Property Pictures (full) */}
            <div className="mt-6">
              <FormLabel className="text-sm font-semibold text-primary-bg">
                Property Pictures
              </FormLabel>
              <Input
                type="file"
                multiple
                className="bg-dialogBg"
                {...form.register('pictures')}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setPropertyPicturesPreview(files);
                }}
              />
              <div className="flex flex-wrap gap-3 mt-3">
                {propertyPicturesPreview.map((file, i) => (
                  <div key={i} className="relative w-[80px] h-[80px]">
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...propertyPicturesPreview];
                        next.splice(i, 1);
                        setPropertyPicturesPreview(next);
                        form.setValue('pictures', next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      className="absolute -top-1 -right-3 bg-primary-bg text-white rounded-full px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl text-primary-bg font-bold mt-10 mb-4">
              Unit Details
            </h2>
            <div className="mb-6">
              <FormLabel className="text-sm text-primary-bg font-semibold">
                Upload Units CSV
              </FormLabel>
              <Input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="bg-dialogBg my-2"
              />
              <p className="text-xs text-primary-bg mt-1">
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
                  className="rounded-[18px] p-0 bg-secondary-bg border border-scrollbar mb-4 overflow-hidden"
                >
                  <AccordionTrigger className="px-5 pt-5 text-left text-xl font-bold bg-secondary-bg border-b border-scrollbar mx-4 text-primary-bg">
                    {`Unit ${index + 1}`}
                  </AccordionTrigger>

                  <AccordionContent className="px-5 pb-5 pt-4">
                    <div className="rounded-[16px] border border-scrollbar bg-secondary-bg p-4">
                      {/* Row 1: Name | Unit No. | Unit Type */}
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Name
                          </FormLabel>
                          <Input
                            {...form.register(`units.${index}.name`, {
                              required: 'Name is required',
                            })}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.name && (
                            <FormMessage>
                              *{errors.units[index]?.name?.message as string}
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Unit No.
                          </FormLabel>
                          <Input
                            {...form.register(`units.${index}.unit_no`, {
                              required: 'Unit no. is required',
                            })}
                            className="rounded-[18px] h-[46px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.unit_no && (
                            <FormMessage>
                              *{errors.units[index]?.unit_no?.message as string}
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Unit Type
                          </FormLabel>
                          <SingleSelectDropDown
                            label="Type"
                            control={form.control}
                            placeholder="Select Type"
                            items={[
                              { name: 'Residential', id: 'residential' },
                              { name: 'Commercial', id: 'commercial' },
                            ]}
                            {...form.register(`units.${index}.unit_type`, {
                              required: 'Unit type is required',
                            })}
                            customClassName="p-select-field my-0 w-full"
                          />
                        </div>
                      </div>

                      {/* Row 2: Size | Rent | Status */}
                      <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Size
                          </FormLabel>
                          <Input
                            {...form.register(`units.${index}.size`, {
                              required: 'Size is required',
                            })}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.size && (
                            <FormMessage>
                              *{errors.units[index]?.size?.message as string}
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Rent
                          </FormLabel>
                          <Input
                            type="number"
                            {...form.register(`units.${index}.rent`, {
                              required: 'Rent is required',
                            })}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.rent && (
                            <FormMessage>
                              *{errors.units[index]?.rent?.message as string}
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Status
                          </FormLabel>
                          <SingleSelectDropDown
                            label="Status"
                            control={form.control}
                            placeholder="Select Status"
                            items={[
                              { name: 'Available', id: 'available' },
                              { name: 'Not Available', id: 'occupied' },
                            ]}
                            {...form.register(`units.${index}.status`, {
                              required: 'Status is required',
                            })}
                            customClassName="p-select-field"
                          />
                        </div>
                      </div>

                      {/* Row 3: Description (full width) */}
                      <div className="mt-4">
                        <FormLabel className="text-sm font-semibold text-primary-bg">
                          Description
                        </FormLabel>
                        <Textarea
                          {...form.register(`units.${index}.description`)}
                          className="rounded-[18px] px-4 py-3 bg-dialogBg focus-visible:ring-0 min-h-[130px]"
                        />
                      </div>

                      {/* Row 4: Bedrooms | Bathrooms | Water Meter */}
                      <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Bedrooms
                          </FormLabel>
                          <Input
                            {...form.register(`units.${index}.bedrooms`, {
                              required: 'Bedrooms is required',
                            })}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.bedrooms && (
                            <FormMessage>
                              *
                              {errors.units[index]?.bedrooms?.message as string}
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Bathrooms
                          </FormLabel>
                          <Input
                            {...form.register(`units.${index}.bathrooms`, {
                              required: 'Bathrooms is required',
                            })}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.bathrooms && (
                            <FormMessage>
                              *
                              {
                                errors.units[index]?.bathrooms
                                  ?.message as string
                              }
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-4">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Water Meter
                          </FormLabel>
                          <Input
                            {...form.register(`units.${index}.water_meter`, {
                              required: 'Water meter is required',
                            })}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.water_meter && (
                            <FormMessage>
                              *
                              {
                                errors.units[index]?.water_meter
                                  ?.message as string
                              }
                            </FormMessage>
                          )}
                        </div>
                      </div>

                      {/* Row 5: Electricity Meter | Unit Pictures */}
                      <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-12 md:col-span-3">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Electricity Meter
                          </FormLabel>
                          <Input
                            {...form.register(
                              `units.${index}.electricity_meter`,
                              {
                                required: 'Electricity meter is required',
                              }
                            )}
                            className="rounded-[18px] h-[44px] px-4 bg-dialogBg focus-visible:ring-0"
                          />
                          {errors.units?.[index]?.electricity_meter && (
                            <FormMessage>
                              *
                              {
                                errors.units[index]?.electricity_meter
                                  ?.message as string
                              }
                            </FormMessage>
                          )}
                        </div>

                        <div className="col-span-12 md:col-span-9">
                          <FormLabel className="text-sm font-semibold text-primary-bg">
                            Unit Pictures
                          </FormLabel>
                          <Input
                            type="file"
                            multiple
                            {...form.register(`units.${index}.pictures`)}
                            className="rounded-[18px] h-[44px] bg-dialogBg"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setUnitPicturesPreview((prev) => ({
                                ...prev,
                                [index]: files,
                              }));
                            }}
                          />
                          <div className="flex flex-wrap gap-3 mt-3">
                            {unitPicturesPreview[index]?.map(
                              (file, picIndex) =>
                                file instanceof File ? (
                                  <div
                                    key={picIndex}
                                    className="relative w-[100px] h-[100px]"
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
                                      className="absolute -top-1 -right-1 p-1 bg-primary-bg text-white rounded-full leading-none"
                                      aria-label="Remove"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : null
                            )}
                          </div>
                        </div>
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
              className="mt-7 w-[148px] h-[40px] bg-primary-bg rounded-[18px] text-sm font-semibold text-white"
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
