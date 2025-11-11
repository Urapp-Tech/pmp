import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
} from '@/components/ui/accordion';
import Papa from 'papaparse';
import { ASSET_BASE_URL } from '@/utils/constants';

const UpdatePropertyPage = () => {
  // const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [propertyPicturesPreview, setPropertyPicturesPreview] = useState<
    (File | string)[]
  >([]);
  const [unitPicturesPreview, setUnitPicturesPreview] = useState<
    Record<number, (File | string)[]>
  >({});
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

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    control,
  } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'units' });

  useEffect(() => {
    setMainIsLoader(true);
    if (!id) {
      toast({ description: 'Invalid property ID' });
      navigate('/admin-panel/property/list');
      return;
    }

    const fetchProperty = async () => {
      try {
        const res = await service.getPropertyId(id);
        const property = res.data.property;

        // ✅ Set raw image paths for form submission
        setPropertyPicturesPreview(property.pictures || []);

        const previews: Record<number, (File | string)[]> = {};
        property.units.forEach((u: any, i: number) => {
          previews[i] = u.pictures || [];
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
        navigate('/admin-panel/property/list');
      }
    };
    fetchProperty();
  }, [id]);

  const onSubmit = async (data: Fields) => {
    const formData = new FormData();

    // ✅ Append regular fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'pictures' && key !== 'units') {
        formData.append(key, value as string);
      }
    });

    // ✅ Property Pictures
    const newPropertyPictures = propertyPicturesPreview.filter(
      (p) => p instanceof File
    );
    const existingPropertyPictures = propertyPicturesPreview.filter(
      (p) => typeof p === 'string'
    );

    newPropertyPictures.forEach((file) => formData.append('pictures', file));
    formData.append(
      'existing_pictures',
      JSON.stringify(existingPropertyPictures)
    );

    // ✅ Units processing
    const existingUnitPicturesMap: Record<number, string[]> = {};

    data.units.forEach((unit: any, index) => {
      const unitData = { ...unit };
      delete unitData?.pictures;

      const previews = unitPicturesPreview[index] || [];
      const newFiles = previews.filter((p) => p instanceof File);
      const existingPaths = previews.filter((p) => typeof p === 'string');

      unitData.pictures_count = newFiles.length;

      formData.append('units_data', JSON.stringify(unitData));
      existingUnitPicturesMap[index] = existingPaths;

      newFiles.forEach((file) => formData.append('unit_pictures', file));
    });

    // ✅ Append both JSONs
    formData.append(
      'existing_unit_pictures',
      JSON.stringify(existingUnitPicturesMap)
    );
    formData.append('removed_unit_ids', JSON.stringify(removedUnitIds));

    try {
      const response = await service.update(id!, formData);
      if (response.data.success) {
        // toast({ description: 'Property updated successfully!' });
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
        navigate('/admin-panel/property/list');
      } else {
        toast({ description: response.data.message });
      }
    } catch (error: any) {
      toast({
        description: error?.response?.data?.message || 'Update failed.',
      });
    }
  };

  // Inside your component
  const handleCSVUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const parsedUnits = results.data.map((row: any) => ({
          // name: row.name || '',
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
        parsedUnits.forEach((unit: any) => append(unit));

        // Add blank picture previews for new units
        setUnitPicturesPreview((prev) => {
          const updated = { ...prev };
          const startIndex = fields.length;
          parsedUnits.forEach((_: any, i: number) => {
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
    <div className="grid grid-cols-12 bg-secondary-bg p-2 m-10 rounded-xl">
      <div className="col-span-12 p-5">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('landlord_id')} />
            <h2 className="text-4xl font-semibold text-primary-bg mb-10">
              Update Property Details
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
                  max={40}
                  {...form.register('unit_counts', {
                    required: 'Please provide unit count',
                    min: { value: 1, message: 'At least 1 unit is required' },
                    max: { value: 40, message: 'Maximum 40 units allowed' },
                    valueAsNumber: true,
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
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
                          // name: '',
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
                      unit_counts: count,
                      units: newUnits,
                    });

                    form.clearErrors('units');

                    // ✅ Reset previews too
                    setUnitPicturesPreview((prev) => {
                      const updated: any = {};
                      for (let i = 0; i < count; i++) {
                        updated[i] = prev[i] || [];
                      }
                      return updated;
                    });
                  }}
                />
                {errors.unit_counts && (
                  <FormMessage>*{errors.unit_counts.message}</FormMessage>
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
                  {...form.register('bank_name', {
                    required: 'Please provide beneficiary name',
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.bank_name && (
                  <FormMessage>*{errors.bank_name.message}</FormMessage>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  Beneficiary Name
                </FormLabel>
                <Input
                  {...form.register('account_name', {
                    required: 'Please provide beneficiary name',
                  })}
                  className="rounded-[18px] h-[50px] px-5 bg-dialogBg focus-visible:ring-0"
                />
                {errors.account_name && (
                  <FormMessage>*{errors.account_name.message}</FormMessage>
                )}
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormLabel className="text-sm font-semibold text-primary-bg">
                  IBAN No.
                </FormLabel>
                <Input
                  {...form.register('iban_no', {
                    required: 'Please provide IBAN number',
                    pattern: {
                      // value: /^QA\d{2}[A-Z]{4}\d{21}$/,
                      value: /^[A-Z0-9]{30}$/,
                      message:
                        'IBAN must be 30 characters long e.g. KW47KFHO0000000000201050199391',
                      // 'IBAN must start with QA, have 2 check digits, 4-letter bank code, and 21-digit account number',
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
                    required: 'Please provide account number',
                    pattern: {
                      value: /^\d{12}$/,
                      message: 'Account number must be exactly 12 digits',
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
              <FormControl className="mb-6">
                <div>
                  <Input
                    type="file"
                    multiple
                    {...form.register('pictures')}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);

                      // ✅ Fix: Properly merge existing and new files
                      setPropertyPicturesPreview((prev) => [...prev, ...files]);

                      // ✅ Fix: Set form value correctly
                      const currentFiles = form.getValues('pictures') || [];
                      form.setValue('pictures', [...currentFiles, ...files]);
                    }}
                  />

                  <div className="flex flex-wrap gap-3 mt-3">
                    {propertyPicturesPreview.map((file, index) => {
                      const imageUrl =
                        typeof file === 'string'
                          ? file.startsWith('http')
                            ? file
                            : `${ASSET_BASE_URL}${file}`
                          : URL.createObjectURL(file);
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
                              form.setValue(
                                'pictures',
                                updated.filter((f) => f instanceof File),
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
                      );
                    })}
                  </div>
                </div>
              </FormControl>
            </div>
            <h2 className="text-2xl text-primary-bg font-semibold mt-10 mb-4">
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
                CSV should include columns: unit_no, size, rent, description,
                bedrooms, bathrooms, water_meter, electricity_meter, [unit_type
                is only (commercial, residential), status is only (available,
                not_available)]
              </p>
            </div>
            <div>
              <div>
                {fields.length > 0 && (
                  <Accordion
                    className="w-full"
                    type="multiple"
                    defaultValue={['item-0']} // must be array if type is multiple
                  >
                    {fields.map((field, index: number) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="rounded-[18px] p-0 bg-secondary-bg border border-scrollbar mb-4 overflow-hidden"
                      >
                        <AccordionTrigger className="px-5 pt-5 text-left text-xl font-semibold bg-secondary-bg border-b border-scrollbar mx-4 text-primary-bg">
                          {`Unit ${index + 1}`}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 pt-4">
                          <div className="rounded-[16px] border border-scrollbar bg-secondary-bg p-4">
                            {/* Row 1: Name | Unit No. | Unit Type */}
                            <div className="grid grid-cols-12 gap-4">
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
                                    *
                                    {
                                      errors.units[index]?.unit_no
                                        ?.message as string
                                    }
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
                                  {...form.register(
                                    `units.${index}.unit_type`,
                                    {
                                      required: 'Unit type is required',
                                    }
                                  )}
                                  customClassName="p-select-field my-0 w-full"
                                />
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
                                    {
                                      name: 'Not Available',
                                      id: 'occupied',
                                    },
                                  ]}
                                  {...form.register(`units.${index}.status`, {
                                    required: 'Status is required',
                                  })}
                                  customClassName="p-select-field"
                                />
                              </div>
                            </div>

                            {/* Row 2: Size | Rent | Status */}
                            <div className="grid grid-cols-12 gap-4 mt-4">
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
                                    *
                                    {
                                      errors.units[index]?.rent
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
                                  {...form.register(
                                    `units.${index}.water_meter`,
                                    {
                                      required: 'Water meter is required',
                                    }
                                  )}
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
                                    *
                                    {
                                      errors.units[index]?.size
                                        ?.message as string
                                    }
                                  </FormMessage>
                                )}
                              </div>
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
                                    {
                                      errors.units[index]?.bedrooms
                                        ?.message as string
                                    }
                                  </FormMessage>
                                )}
                              </div>

                              <div className="col-span-12 md:col-span-4">
                                <FormLabel className="text-sm font-semibold text-primary-bg">
                                  Bathrooms
                                </FormLabel>
                                <Input
                                  {...form.register(
                                    `units.${index}.bathrooms`,
                                    {
                                      required: 'Bathrooms is required',
                                    }
                                  )}
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
                            </div>

                            {/* Row 5: Electricity Meter | Unit Pictures */}
                            <div className="grid grid-cols-12 gap-4 mt-4">
                              <div className="col-span-12 md:col-span-12">
                                <FormControl className="">
                                  <div>
                                    <FormLabel className="text-sm font-semibold text-primary-bg">
                                      Unit Pictures
                                    </FormLabel>

                                    <Input
                                      type="file"
                                      multiple
                                      {...register(`units.${index}.pictures`)}
                                      className="rounded-[20px] bg-dialogBg"
                                      onChange={(e) => {
                                        const files = Array.from(
                                          e.target.files || []
                                        );

                                        // ✅ Fix: Update preview state
                                        setUnitPicturesPreview((prev) => ({
                                          ...prev,
                                          [index]: [
                                            ...(prev[index] || []),
                                            ...files,
                                          ],
                                        }));

                                        // ✅ Fix: Update form value
                                        const currentFiles =
                                          form.getValues(
                                            `units.${index}.pictures`
                                          ) || [];
                                        form.setValue(
                                          `units.${index}.pictures`,
                                          [...currentFiles, ...files]
                                        );
                                      }}
                                    />
                                    <div className="flex flex-wrap gap-3 mt-3">
                                      {unitPicturesPreview[index]?.map(
                                        (file, picIndex) => {
                                          const imageUrl =
                                            typeof file === 'string'
                                              ? file.startsWith('http')
                                                ? file
                                                : `${ASSET_BASE_URL}${file}`
                                              : URL.createObjectURL(file);
                                          return (
                                            <div
                                              key={picIndex}
                                              className="relative w-[80px] h-[80px]"
                                            >
                                              <img
                                                src={imageUrl}
                                                alt="unit"
                                                className="w-full h-full object-cover rounded-lg border"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = [
                                                    ...unitPicturesPreview[
                                                      index
                                                    ],
                                                  ];
                                                  updated.splice(picIndex, 1);
                                                  setUnitPicturesPreview(
                                                    (prev) => ({
                                                      ...prev,
                                                      [index]: updated,
                                                    })
                                                  );
                                                  form.setValue(
                                                    `units.${index}.pictures`,
                                                    updated.filter(
                                                      (f) => f instanceof File
                                                    ),
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
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </FormControl>
                              </div>
                            </div>
                            <div className="text-right mt-4">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="  text-primary-bg font-semibold"
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
            <div className="flex justify-end">
              <Button
                disabled={isSubmitting}
                type="submit"
                className="mt-7 w-[148px] h-[40px] bg-primary-bg rounded-[20px] text-sm font-semibold text-white"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Update'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdatePropertyPage;
