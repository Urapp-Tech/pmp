import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, FileText } from 'lucide-react';
import { ASSET_BASE_URL } from '@/utils/constants';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  formData: any;
};

const isImage = (p: string) => /\.(png|jpe?g|webp|gif)$/i.test(p);
const isDoc = (p: string) => /\.(pdf|docx?|xls[x]?|csv|pptx?)$/i.test(p);
const fname = (p: string) => p.split('/').pop() || p;

function ViewDialog({ isOpen, setIsOpen, formData }: Props) {
  const files = Array.isArray(formData?.images) ? formData.images : [];

  const imageFiles = files.filter(isImage);
  const docFiles = files.filter(isDoc);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* transparent shell so we can do rounded card ourselves */}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden">
        {/* Card */}
        {/* Header (blur/soft) */}
        <DialogHeader className="!h-[100px] !px-2 p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="px-4 rounded-tl-3xl relative text-center">
            <DialogTitle className="text-primary-bg text-4xl mt-2 font-extrabold tracking-wide">
              Maintenance Reported Request
            </DialogTitle>
            {/* 3) Custom rounded close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-6 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-primary-bg text-white shadow-md hover:opacity-90"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="bg-white rounded-bl-3xl px-6 pb-6 pt-5">
          {/* Top 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-semibold text-primary-bg/80">
                Title
              </div>
              <div className="mt-2 text-[17px] font-medium text-primary-bg">
                {formData?.subject || '—'}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary-bg/80">
                Reporter Name
              </div>
              <div className="mt-2 text-[17px] font-medium text-primary-bg">
                {formData?.first_name + ' ' + formData?.last_name || '—'}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-primary-bg/80">
                Status
              </div>
              <div className="mt-2 text-[17px] font-medium text-primary-bg">
                {formData?.status || '—'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <div className="text-sm font-semibold text-primary-bg/80">
              Description
            </div>
            <p className="mt-2 text-[17px] leading-7 text-primary-bg">
              {formData?.message || '—'}
            </p>
          </div>

          {/* Attachments: Images */}
          {imageFiles.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-semibold text-primary-bg/80 mb-3">
                Images
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageFiles.map((p: any, i: number) => {
                  const url = `${ASSET_BASE_URL}${p}`;
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-2xl bg-[#f4f7ff] p-2 shadow-sm hover:shadow-md transition"
                      title={fname(p)}
                    >
                      <img
                        src={url}
                        alt={fname(p)}
                        className="h-44 w-full object-contain rounded-xl"
                      />
                      <div className="mt-2 line-clamp-1 text-xs text-primary-bg/70 px-1">
                        {fname(p)}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachments: Documents */}
          {docFiles.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-semibold text-primary-bg/80 mb-3">
                Documents
              </div>
              <div className="flex flex-col gap-3">
                {docFiles.map((p: any, i: number) => {
                  const url = `${ASSET_BASE_URL}${p}`;
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-[#f4f7ff] px-4 py-3 shadow-sm hover:shadow-md transition"
                      title={fname(p)}
                    >
                      <div className="shrink-0 grid h-10 w-10 place-items-center rounded-lg bg-white">
                        <FileText className="h-5 w-5 text-primary-bg" />
                      </div>
                      <span className="text-sm text-primary-bg">
                        {fname(p)}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewDialog;
