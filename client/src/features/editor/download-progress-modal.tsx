// client/src/features/editor/download-progress-modal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDownloadState } from "./store/use-download-state";
import { Button } from "@/components/ui/button";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { download } from "@/utils/download";

const DownloadProgressModal = () => {
  const { progress, displayProgressModal, output, actions } =
    useDownloadState();

  const isCompleted = progress === 100;

  const handleDownload = async () => {
    if (!output?.url) return;

    await download(output.url, output.filename);

    actions.setDisplayProgressModal(false);
  };

  return (
    <Dialog
      open={displayProgressModal}
      onOpenChange={actions.setDisplayProgressModal}
    >
      <DialogContent className="flex h-[627px] flex-col gap-0 bg-background p-0 sm:max-w-[844px]">
        <DialogTitle className="hidden" />
        <DialogDescription className="hidden" />

        <div className="flex h-16 items-center border-b px-4 font-medium">
          Export
        </div>

        {isCompleted ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center space-y-2 text-center">
              <CircleCheckIcon className="h-8 w-8 text-green-500" />
              <div className="text-lg font-bold">Exported</div>
              <div className="text-muted-foreground">
                {output?.type === "json"
                  ? "You can download the design JSON file."
                  : "You can download the video to your device."}
              </div>
            </div>

            <Button onClick={handleDownload}>
              Download
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-5xl font-semibold">
              {Math.floor(progress)}%
            </div>
            <div className="font-bold">Exporting...</div>
            <div className="text-center text-zinc-500 space-y-1">
              <div>Closing the browser will not cancel the export.</div>
              <div>The file will be saved in your space.</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadProgressModal;
