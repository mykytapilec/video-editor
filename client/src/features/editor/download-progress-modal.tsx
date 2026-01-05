import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleCheckIcon, XIcon } from "lucide-react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useDownloadState } from "./store/use-download-state";

const DownloadProgressModal = () => {
  const {
    progress,
    displayProgressModal,
    output,
    exporting,
    actions
  } = useDownloadState();

  const isCompleted = progress === 100 && !!output;
  const isJson = output?.type === "json";

  const title = isCompleted
    ? isJson
      ? "Exported as JSON"
      : "Exported"
    : "Exporting...";

  const description = isCompleted
    ? isJson
      ? "You can download the project design as a JSON file."
      : "You can download the video to your device."
    : "Closing the browser will not cancel the export.";

  const handleDownload = () => {
    if (!output) return;

    const link = document.createElement("a");
    link.href = output.url;
    link.download = output.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={displayProgressModal}
      onOpenChange={actions.setDisplayProgressModal}
    >
      <DialogContent className="flex h-[627px] flex-col gap-0 bg-background p-0 sm:max-w-[844px]">
        <DialogTitle className="hidden" />
        <DialogDescription className="hidden" />

        <XIcon
          onClick={() => actions.setDisplayProgressModal(false)}
          className="absolute right-4 top-5 h-5 w-5 text-zinc-400 hover:cursor-pointer hover:text-zinc-500"
        />

        <div className="flex h-16 items-center border-b px-4 font-medium">
          Export
        </div>

        {isCompleted ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <CircleCheckIcon className="h-10 w-10 text-emerald-500" />

            <div className="text-lg font-semibold">{title}</div>
            <div className="text-muted-foreground max-w-md">
              {description}
            </div>

            <Button onClick={handleDownload}>
              Download {isJson ? "JSON" : "Video"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="text-5xl font-semibold">
              {Math.floor(progress)}%
            </div>

            <div className="text-lg font-semibold">{title}</div>

            <div className="text-muted-foreground max-w-md">
              {description}
            </div>

            {!exporting && (
              <Button
                variant="outline"
                onClick={() => actions.setDisplayProgressModal(false)}
              >
                Close
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadProgressModal;
