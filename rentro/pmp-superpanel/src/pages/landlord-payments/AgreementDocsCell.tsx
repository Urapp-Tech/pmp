// AgreementDocsCell.tsx
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { FileText, ImageIcon, FileQuestion, Download } from 'lucide-react';

type Props = {
  value: any; // row.getValue('docs') or docs.attachments
  assetBaseUrl: string; // ASSET_BASE_URL (e.g., 'https://api.example.com/')
  maxInline?: number;
};

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
const isDoc = (name: string) => /\.(pdf|docx?|xlsx?)$/i.test(name);

type DocLike = string | { url?: string } | null | undefined;
type DocsInput =
  | DocLike
  | DocLike[]
  | { attachments?: DocLike[] }
  | { url?: string };

const normalizeFiles = (docs: DocsInput): string[] => {
  if (!docs) return [];

  // Support object wrapper: { attachments: [...] }
  if (
    !Array.isArray(docs) &&
    typeof docs === 'object' &&
    'attachments' in docs
  ) {
    // @ts-ignore
    docs = docs.attachments as DocLike[];
  }

  const arr = Array.isArray(docs) ? docs : [docs];

  return arr
    .map((d: any) => {
      if (!d) return '';
      if (typeof d === 'string') return d.trim();
      if (typeof d === 'object' && typeof d.url === 'string')
        return d.url.trim();
      return '';
    })
    .filter(Boolean);
};

const toURL = (base: string, path: string) => {
  const p = String(path);
  if (/^https?:\/\//i.test(p)) return p;
  const b = base.endsWith('/') ? base : `${base}/`;
  const clean = p.startsWith('/') ? p.slice(1) : p;
  return `${b}${clean}`;
};

const fileName = (url: string) => {
  try {
    // allow relative URLs
    const u = new URL(url, 'http://_/');
    const last = u.pathname.split('/').pop() || '';
    return decodeURIComponent(last || 'file');
  } catch {
    const last = url.split('?')[0].split('/').pop();
    return last || 'file';
  }
};

export default function AgreementDocsCell({
  value,
  assetBaseUrl,
  maxInline = 3,
}: Props) {
  // Accepts: docs, docs.attachments, array of urls, array of {url}
  const files = normalizeFiles(value);
  if (!files.length) {
    return <span className="text-muted-foreground text-xs">No file</span>;
  }

  const visible = files.slice(0, maxInline);
  const overflow = files.length - visible.length;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {visible.map((file, i) => {
          const href = toURL(assetBaseUrl, file);
          const name = fileName(href);
          const img = isImage(name);
          const doc = isDoc(name);

          return (
            <Tooltip key={`${name}-${i}`}>
              <TooltipTrigger asChild>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border bg-white ring-1 ring-muted hover:shadow-sm"
                >
                  {img ? (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  ) : doc ? (
                    <FileText className="h-4 w-4 text-primary" />
                  ) : (
                    <FileQuestion className="h-4 w-4 text-muted-foreground" />
                  )}
                </a>
              </TooltipTrigger>
              <TooltipContent className="flex items-center gap-2">
                <span className="max-w-[220px] truncate">{name}</span>
                <a
                  href={href}
                  download
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {overflow > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 rounded-full px-2 text-xs"
                title="Show more"
              >
                +{overflow}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-3" side="top" align="start">
              <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto">
                {files.slice(maxInline).map((file, i) => {
                  const href = toURL(assetBaseUrl, file);
                  const name = fileName(href);
                  const img = isImage(name);
                  const doc = isDoc(name);

                  return (
                    <a
                      key={`${name}-more-${i}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center gap-1 rounded-md border bg-white p-2 text-center hover:shadow-sm"
                      title={name}
                    >
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm ring-1 ring-muted">
                        {img ? (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        ) : doc ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="line-clamp-2 w-full break-all text-[10px] leading-tight text-muted-foreground">
                        {name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}
