import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/lib/store";
import { Info, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const PrivacyToggle = () => {
  const { saveMessageContent, setSaveMessageContent } = useChatStore();
  const [open, setOpen] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setSaveMessageContent(checked);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Switch
                id="privacy-mode"
                checked={saveMessageContent}
                onCheckedChange={handleToggleChange}
                aria-label="Toggle message saving"
              />
              <Label 
                htmlFor="privacy-mode" 
                className="text-xs font-medium cursor-pointer hidden sm:inline"
              >
                Save messages
              </Label>
              <Shield size={12} className={saveMessageContent ? "text-teal-500" : "text-red-500"} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">
              {saveMessageContent 
                ? "Messages will be saved to your account. You can view them later in your chat history."
                : "Messages will NOT be stored in the database. Only conversation titles will be saved."}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button aria-label="Privacy information" className="text-gray-400 hover:text-gray-600">
            <Info size={14} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium">Message Privacy Settings</h3>
            <p className="text-xs text-gray-500">
              When enabled, message content will be saved to your account for future reference.
              When disabled, only conversation titles will be saved, but not the actual messages.
            </p>
            <p className="text-xs text-gray-500">
              You can toggle this setting at any time during your conversation.
            </p>
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <Shield size={14} className="text-teal-500" />
              <span>ON: Full message content is saved</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield size={14} className="text-red-500" />
              <span>OFF: Only conversation titles are saved</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 