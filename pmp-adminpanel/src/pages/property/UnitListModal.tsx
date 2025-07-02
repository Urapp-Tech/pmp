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
import { ASSET_BASE_URL } from '@/utils/constants';
import { FileText } from 'lucide-react';

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
                <TableHead>Images</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.length > 0 ? (
                units.map((unit: any) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.unit_no}</TableCell>
                    <TableCell>
                      {(() => {
                        const images = unit.pictures as string[] | null;

                        if (!images || images.length === 0) {
                          return (
                            <span className="text-gray-400 text-xs">
                              No files
                            </span>
                          );
                        }

                        return (
                          <div className="flex gap-2 flex-wrap">
                            {images.map((url, idx) => {
                              const isImage =
                                /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
                              const isPDF = /\.pdf$/i.test(url);
                              const isDoc = /\.(docx?|txt)$/i.test(url);

                              return (
                                <a
                                  key={idx}
                                  href={ASSET_BASE_URL + url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-12 h-12 border border-gray-200 rounded overflow-hidden items-center justify-center"
                                  title={url.split('/').pop()}
                                >
                                  {isImage ? (
                                    <img
                                      src={ASSET_BASE_URL + url}
                                      alt={`attachment-${idx}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : isPDF || isDoc ? (
                                    <FileText
                                      className="text-lunar-bg"
                                      size={20}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-500">
                                      File
                                    </span>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </TableCell>
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
