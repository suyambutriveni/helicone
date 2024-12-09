import {
  CircleStackIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Column } from "@tanstack/react-table";
import { useEffect, useState, useRef } from "react";
import { Result } from "../../../../lib/result";
import { TimeInterval } from "../../../../lib/timeCalculations/time";
import { SingleFilterDef } from "../../../../services/lib/filters/frontendFilterDefs";
import { AdvancedFilters } from "../themedAdvancedFilters";
import ThemedTimeFilter from "../themedTimeFilter";
import ExportButton from "./exportButton";
import ViewColumns from "./columns/viewColumns";
import useSearchParams from "../../utils/useSearchParams";
import { TimeFilter } from "@/types/timeFilter";
import ViewButton from "./viewButton";
import { RequestViews } from "./RequestViews";
import { OrganizationFilter } from "../../../../services/lib/organization_layout/organization_layout";
import FiltersButton from "./filtersButton";
import { DragColumnItem } from "./columns/DragList";
import { UIFilterRowTree } from "@/services/lib/filters/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PinIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThemedTableHeaderProps<T> {
  rows?: T[];

  // define this if you want the advanced filters
  advancedFilters?: {
    filterMap: SingleFilterDef<any>[];
    filters: UIFilterRowTree;
    setAdvancedFilters: (filters: UIFilterRowTree) => void;
    searchPropertyFilters: (
      property: string,
      search: string
    ) => Promise<Result<void, string>>;
    show?: boolean;
  };
  columns: Column<T, unknown>[];

  // define this if you want the time filter
  timeFilter?: {
    currentTimeFilter: TimeFilter;
    defaultValue: "24h" | "7d" | "1m" | "3m" | "all";
    onTimeSelectHandler: (key: TimeInterval, value: string) => void;
  };

  // define this if you want a table and view toggle
  viewToggle?: {
    currentView: RequestViews;
    onViewChange: (value: RequestViews) => void;
  };
  onDataSet?: () => void;
  savedFilters?: {
    filters?: OrganizationFilter[];
    currentFilter?: string;
    onFilterChange?: (value: OrganizationFilter | null) => void;
    onSaveFilterCallback?: () => void;
    layoutPage: "dashboard" | "requests";
  };
  activeColumns: DragColumnItem[];
  setActiveColumns: (columns: DragColumnItem[]) => void;
  customButtons?: React.ReactNode[];
  isDatasetsPage?: boolean;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
}

export default function ThemedTableHeader<T>(props: ThemedTableHeaderProps<T>) {
  const {
    rows,
    columns,
    timeFilter,
    advancedFilters,
    viewToggle,
    savedFilters,
    activeColumns,
    setActiveColumns,
    customButtons,
    isDatasetsPage,
    search,
  } = props;

  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Add state variables to manage the popover's open state and pin status
  const [isFiltersPopoverOpen, setIsFiltersPopoverOpen] = useState(false);
  const [isFiltersPinned, setIsFiltersPinned] = useState(false);
  const popoverContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const displayFilters = window.sessionStorage.getItem("showFilters") || null;
    setShowFilters(displayFilters ? JSON.parse(displayFilters) : false);
  }, []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const showFilterHandler = () => {
    setShowFilters(!showFilters);
    window.sessionStorage.setItem("showFilters", JSON.stringify(!showFilters));
  };

  const getDefaultValue = () => {
    const currentTimeFilter = searchParams.get("t");

    if (currentTimeFilter && currentTimeFilter.split("_")[0] === "custom") {
      return "custom";
    } else {
      return currentTimeFilter || "24h";
    }
  };

  const handlePopoverInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col">
        <div className="flex flex-col gap-3 lg:flex-row justify-between ">
          <div className="flex flex-row gap-3 items-center">
            {timeFilter !== undefined ? (
              <ThemedTimeFilter
                currentTimeFilter={timeFilter.currentTimeFilter}
                timeFilterOptions={[]}
                onSelect={function (key: string, value: string): void {
                  timeFilter.onTimeSelectHandler(key as TimeInterval, value);
                }}
                isFetching={false}
                defaultValue={getDefaultValue()}
                custom={true}
              />
            ) : (
              <div />
            )}
            <div className="flex flex-row">
              {advancedFilters && (
                <Popover
                  open={isFiltersPopoverOpen}
                  onOpenChange={setIsFiltersPopoverOpen}
                >
                  {!isFiltersPinned ? (
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghostLinear"
                        className="gap-2"
                        size="sm_sleek"
                        onClick={() => {
                          if (isFiltersPinned) {
                            setShowFilters(!showFilters);
                            setIsFiltersPopoverOpen(false);
                          } else {
                            setIsFiltersPopoverOpen(!isFiltersPopoverOpen);
                            setShowFilters(false);
                          }
                        }}
                      >
                        <FunnelIcon className="h-[13px] w-[13px]" />
                        <span className="hidden sm:inline font-normal text-[13px]">
                          Filters
                        </span>
                      </Button>
                    </PopoverTrigger>
                  ) : (
                    <Button
                      variant="ghostLinear"
                      className="gap-2"
                      size="sm_sleek"
                      onClick={() => {
                        setShowFilters(!showFilters);
                      }}
                    >
                      <FunnelIcon className="h-[13px] w-[13px]" />
                      <span className="hidden sm:inline font-normal text-[13px]">
                        {isFiltersPinned
                          ? showFilters
                            ? "Hide Filters"
                            : "Show Filters"
                          : "Filters"}
                      </span>
                    </Button>
                  )}
                  <PopoverContent
                    className="min-w-[40rem] w-[40vw] flex items-start p-0 mx-2 rounded-lg"
                    ref={popoverContentRef}
                    onInteractOutside={(e) => {}}
                    onClick={handlePopoverInteraction}
                  >
                    <AdvancedFilters
                      filterMap={advancedFilters.filterMap}
                      filters={advancedFilters.filters}
                      setAdvancedFilters={advancedFilters.setAdvancedFilters}
                      searchPropertyFilters={
                        advancedFilters.searchPropertyFilters
                      }
                      savedFilters={savedFilters?.filters}
                      onSaveFilterCallback={savedFilters?.onSaveFilterCallback}
                      layoutPage={savedFilters?.layoutPage ?? "requests"}
                    />
                    <div className="flex justify-end ml-4">
                      <Button
                        variant="ghostLinear"
                        onClick={() => {
                          setIsFiltersPinned(!isFiltersPinned);
                          setIsFiltersPopoverOpen(isFiltersPinned);
                          setShowFilters(!isFiltersPinned);
                        }}
                        className="text-gray-500 hover:text-gray-700 p-0 mt-4 mr-4 h-auto w-auto"
                      >
                        {isFiltersPinned ? (
                          <PinIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <PinIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {savedFilters && (
                <FiltersButton
                  filters={savedFilters.filters}
                  currentFilter={savedFilters.currentFilter}
                  onFilterChange={savedFilters.onFilterChange}
                  onDeleteCallback={() => {
                    if (savedFilters.onSaveFilterCallback) {
                      savedFilters.onSaveFilterCallback();
                    }
                  }}
                  layoutPage={savedFilters.layoutPage}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-start lg:justify-end items-center">
            {search && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex items-center">
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isSearchExpanded ? "w-40 sm:w-64" : "w-0"
                      }`}
                    >
                      <Input
                        ref={searchInputRef}
                        type="text"
                        value={search.value}
                        onChange={(e) => search.onChange(e.target.value)}
                        placeholder={search.placeholder}
                        className={clsx(
                          "w-40 sm:w-64 text-sm pr-8 transition-transform duration-300 ease-in-out outline-none border-none ring-0",
                          isSearchExpanded
                            ? "translate-x-0"
                            : "translate-x-full"
                        )}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={
                        isSearchExpanded
                          ? "absolute right-0 hover:bg-transparent"
                          : ""
                      }
                      onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    >
                      {isSearchExpanded ? (
                        <XMarkIcon className="h-4 w-4" />
                      ) : (
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isSearchExpanded ? "Close search" : "Open search"}
                </TooltipContent>
              </Tooltip>
            )}

            {columns && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ViewColumns
                      columns={columns}
                      activeColumns={activeColumns}
                      setActiveColumns={setActiveColumns}
                      isDatasetsPage={isDatasetsPage}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Manage columns</TooltipContent>
              </Tooltip>
            )}

            {rows && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ExportButton rows={rows} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Export data</TooltipContent>
              </Tooltip>
            )}

            {viewToggle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ViewButton
                      currentView={viewToggle.currentView}
                      onViewChange={(value: RequestViews) => {
                        viewToggle.onViewChange(value);
                      }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Toggle view</TooltipContent>
              </Tooltip>
            )}

            {advancedFilters && props.onDataSet && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (props.onDataSet) {
                    props.onDataSet();
                  }
                }}
                size="xs"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-400"
              >
                <CircleStackIcon className="h-4 w-4" />
              </Button>
            )}

            {customButtons && customButtons.map((button) => button)}
          </div>
        </div>

        {advancedFilters && showFilters && isFiltersPinned && (
          <div className="flex justify-start min-w-[50rem] w-full mt-1">
            <div className="flex-1 rounded-lg">
              <AdvancedFilters
                filterMap={advancedFilters.filterMap}
                filters={advancedFilters.filters}
                setAdvancedFilters={advancedFilters.setAdvancedFilters}
                searchPropertyFilters={advancedFilters.searchPropertyFilters}
                savedFilters={savedFilters?.filters}
                onSaveFilterCallback={savedFilters?.onSaveFilterCallback}
                layoutPage={savedFilters?.layoutPage ?? "requests"}
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                setIsFiltersPinned(false);
                setShowFilters(false);
                setIsFiltersPopoverOpen(true);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <PinIcon className="h-5 w-5 text-primary rotate-45 fill-gray-500" />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
