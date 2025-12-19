import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  statusOptions?: FilterOption[];
  onSearchChange: (search: string) => void;
  onStatusChange?: (status: string) => void;
  onClearFilters: () => void;
  showStatusFilter?: boolean;
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  statusOptions = [],
  onSearchChange,
  onStatusChange,
  onClearFilters,
  showStatusFilter = true,
}: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    onSearchChange("");
    if (onStatusChange) {
      onStatusChange("all");
    }
    onClearFilters();
  };

  const hasActiveFilters = searchTerm !== "" || selectedStatus !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sm:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="default" className="ml-2 px-1.5 py-0.5 text-xs">
              Active
            </Badge>
          )}
        </Button>

        {/* Status Filter (Desktop) */}
        {showStatusFilter && statusOptions.length > 0 && (
          <div className="hidden sm:block w-48">
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters} className="hidden sm:flex">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Mobile Filters */}
      {isFilterOpen && showStatusFilter && statusOptions.length > 0 && (
        <div className="sm:hidden space-y-3 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <button
                onClick={() => handleSearchChange("")}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedStatus !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find((o) => o.value === selectedStatus)?.label}
              <button
                onClick={() => handleStatusChange("all")}
                className="hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
