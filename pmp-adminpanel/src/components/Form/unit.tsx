import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const PropertyUnitsForm = () => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "units"
  });

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Units</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border p-4 mb-4 rounded-lg bg-gray-50 shadow-sm"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              {...register(`units.${index}.name`)}
              placeholder="Unit Name"
            />
            <Input
              {...register(`units.${index}.unit_no`)}
              placeholder="Unit No"
            />
            <Input
              {...register(`units.${index}.unit_type`)}
              placeholder="Unit Type"
            />
            <Input
              type="number"
              {...register(`units.${index}.size`)}
              placeholder="Size"
            />
            <Input
              type="number"
              {...register(`units.${index}.rent`)}
              placeholder="Rent"
            />
            <Input
              type="number"
              {...register(`units.${index}.bedrooms`)}
              placeholder="Bedrooms"
            />
            <Input
              type="number"
              {...register(`units.${index}.bathrooms`)}
              placeholder="Bathrooms"
            />
            <Input
              {...register(`units.${index}.water_meter`)}
              placeholder="Water Meter No"
            />
            <Input
              {...register(`units.${index}.electricity_meter`)}
              placeholder="Electricity Meter No"
            />
            <Input
              {...register(`units.${index}.status`)}
              placeholder="Status"
              defaultValue="active"
            />
          </div>
          <Textarea
            {...register(`units.${index}.description`)}
            placeholder="Description"
            className="mt-4"
          />
          <Input
            type="file"
            multiple
            {...register(`units.${index}.pictures`)}
            className="mt-2"
          />
          <Button
            variant="destructive"
            className="mt-3"
            onClick={() => remove(index)}
          >
            Remove Unit
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            name: "",
            unit_no: "",
            unit_type: "",
            size: "",
            rent: "",
            description: "",
            pictures: [],
            bedrooms: 0,
            bathrooms: 0,
            water_meter: "",
            electricity_meter: "",
            status: "active"
          })
        }
      >
        + Add Unit
      </Button>
    </div>
  );
};
