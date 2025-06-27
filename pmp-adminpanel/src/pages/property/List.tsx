import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { SidebarInset } from '@/components/ui/sidebar';
import { TopBar } from '@/components/TopBar';
import { Paginator } from '@/components/Paginator';
import UnitListModal from './UnitListModal';
import propertyService from '@/services/adminapp/property';
import DeleteDialog from '@/components/DeletePopup';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePermission } from '@/utils/hasPermission';
import { PERMISSIONS } from '@/utils/constants';
import { getItem } from '@/utils/storage';

const PropertyList = () => {
  const userDetails: any = getItem('USER');
  const navigate = useNavigate();
  const { can } = usePermission();
  const { toast } = useToast();
  const [search, setSearchKey] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState([]);
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editFormData, setEditFormData] = useState();

  const [units, setUnits] = useState([]);

  const fetchList = async (search = '', page=1) => {
    setIsLoader(true);

    try {
      const res = await propertyService.list(
        userDetails?.id,
        userDetails?.role?.name,
        search,
        page,
        pageSize
      );
      if (res.data && res.data.items) {
        setList(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setMainIsLoader(false);
      setIsLoader(false);
    }
  };

  useEffect(() => {
    fetchList(search, page);
  }, [page]);

  const handleSearchKey = (e: any) => {
    setSearchKey(e.target.value);
    // fetchList(search, page);
  };
  const handlePageChange = (p: any) => {
    // setPageIndex(newPage + 1);
    setPage(p+1);
    fetchList(search, p+1);
  };

  const openUnitsModal = (property: any, units: any) => {
    setSelectedProperty(property);
    setUnitModalOpen(true);
    setUnits(units);
  };

  const deleteHandler = async (id: any) => {
    setDeleteOpen(false);
    setIsLoader(true); // Start loader before request
    try {
      const response = await propertyService.deleteProperty(id.id);

      if (response.data.success) {
        fetchList(search, page);
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
      } else {
        setIsLoader(false);
      }
    } catch (error) {
      toast({
        description: 'Failed to delete property.',
        className: cn(
          'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
        ),
        style: {
          backgroundColor: '#D9534F',
          color: 'white',
        },
      });
    } finally {
      setIsLoader(false); // Always stop loader
      setDeleteOpen(false); // Ensure modal closes even on error
    }
  };
  const handleActionMenu = (action: any, item: any) => {
    const id = item.id;
    setEditFormData(item);
    if (action === 'edit') {
      navigate(`/admin-panel/property/edit/${id}`);
    } else if (action === 'delete') {
      setSelectedProperty(id);
      setDeleteOpen(true);
    }
  };
  return (
    <div className="bg-white p-2 rounded-[20px] shadow-2xl mt-5">
      <TopBar title="Property List" />
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center py-4">
          <h2 className="text-xl font-semibold text-tertiary-bg">Properties</h2>
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Search properties..."
              value={search}
              onKeyUp={handleSearchKey}
              className="w-[300px] rounded-full bg-mars-bg/50"
            />
            {can(PERMISSIONS.PROPERTY.CREATE) && (
              <Button
                onClick={() => navigate('/admin-panel/property/add')}
                className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
                variant={'outline'}
              >
                + Add New
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          {mainIsLoader ? (
            <div className="flex justify-center items-center h-[50px]">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length > 0 ? (
                  list.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        <div className=" flex">
                          <span className="bg-blue-500 mt-3 text-center text-white w-[18px] h-[18px] rounded-[30px] text-[10px] leading-normal font-semibold  py-[1px]">
                            {item.units.length}
                          </span>
                          <Eye
                            className="pl-3 cursor-pointer text-blue-500 w-[40px] h-[40px]"
                            onClick={() =>
                              openUnitsModal(item?.id, item?.units)
                            }
                          />
                        </div>{' '}
                      </TableCell>
                      <TableCell>
                        {!can(PERMISSIONS.PROPERTY.UPDATE) &&
                          !can(PERMISSIONS.PROPERTY.UPDATE) && (
                            <div className="text-center">Restricted</div>
                          )}
                        <div className="flex justify-center items-center">
                          {can(PERMISSIONS.PROPERTY.UPDATE) && (
                            <div className="pl-3">
                              <Pencil
                                className="text-lunar-bg cursor-pointer"
                                onClick={() => handleActionMenu('edit', item)}
                                size={20}
                              />
                            </div>
                          )}
                          {can(PERMISSIONS.PROPERTY.DELETE) && (
                            <div className="pl-3">
                              <Trash2
                                className="text-lunar-bg cursor-pointer"
                                size={20}
                                onClick={() => handleActionMenu('delete', item)}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No properties found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="my-5 flex justify-center">
          <Paginator
            pageSize={pageSize}
            currentPage={page-1}
            totalPages={total}
            onPageChange={handlePageChange}
            showPreviousNext
          />
        </div>
      </SidebarInset>

      {unitModalOpen && (
        <UnitListModal
          open={unitModalOpen}
          setOpen={setUnitModalOpen}
          property={selectedProperty}
          units={units}
        />
      )}
      {deleteOpen && (
        <DeleteDialog
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title={'Property'}
          isLoader={isLoader}
          formData={editFormData}
          callback={deleteHandler}
        />
      )}
    </div>
  );
};

export default PropertyList;
