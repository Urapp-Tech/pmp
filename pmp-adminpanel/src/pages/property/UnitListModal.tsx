import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import propertyService from '@/services/adminapp/property'; // adjust if needed

const UnitListModal = ({ open, setOpen, property, units }: any) => {
  // const [units, setUnits] = useState([]);
  console.log('UnitListModal property:', property);

  // useEffect(() => {

  //   if (open && property) {
  //     fetchUnits();
  //   }
  // }, [open, property]);

  // const fetchUnits = async () => {
  //   try {
  //     const res = await propertyService.getUnitsByPropertyId(property, '', 1, 20);
  //     setUnits(res.data?.items || []);
  //   } catch (error) {
  //     console.error('Failed to fetch units', error);
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Units for {property?.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit No</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length > 0 ? (
                units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.unit_no}</TableCell>
                    <TableCell>{unit.floor || '-'}</TableCell>
                    <TableCell>{unit.unit_type}</TableCell>
                    <TableCell>{unit.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No units found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitListModal;
