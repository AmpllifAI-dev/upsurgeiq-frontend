import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SchedulePublishingProps {
  onSchedule: (scheduledDate: Date) => void;
  currentScheduledDate?: Date;
  disabled?: boolean;
}

export function SchedulePublishing({
  onSchedule,
  currentScheduledDate,
  disabled = false,
}: SchedulePublishingProps) {
  const [date, setDate] = useState<Date | undefined>(currentScheduledDate);
  const [time, setTime] = useState<string>(
    currentScheduledDate ? format(currentScheduledDate, "HH:mm") : "09:00"
  );

  const handleSchedule = () => {
    if (!date) return;

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    onSchedule(scheduledDate);
  };

  const handleClearSchedule = () => {
    setDate(undefined);
    setTime("09:00");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Schedule Publishing
        </CardTitle>
        <CardDescription>
          Set a date and time for automatic publishing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Select Time
          </Label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {date && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium">Scheduled for:</p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(date, "EEEE, MMMM d, yyyy")} at {time}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSchedule}
            disabled={!date || disabled}
            className="flex-1"
          >
            Set Schedule
          </Button>
          {date && (
            <Button
              variant="outline"
              onClick={handleClearSchedule}
              disabled={disabled}
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
