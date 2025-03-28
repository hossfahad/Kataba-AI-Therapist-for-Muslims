import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/lib/store";
import { Info } from "lucide-react";

export const PrivacyToggle = () => {
  const { saveMessageContent, setSaveMessageContent } = useChatStore();
  const [open, setOpen] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    setSaveMessageContent(checked);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
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
          <PopoverTrigger asChild>
            <button aria-label="Privacy information" className="text-gray-400 hover:text-gray-600">
              <Info size={14} />
            </button>
          </PopoverTrigger>
        </div>
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}; 