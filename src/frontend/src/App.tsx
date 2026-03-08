import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Bike,
  Car,
  ChevronDown,
  Eye,
  Fuel,
  Gauge,
  GitCompare,
  Search,
  Settings2,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Vehicle } from "./backend.d";
import { useActor } from "./hooks/useActor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIndianPrice(price: bigint): string {
  const num = Number(price);
  return `₹${num.toLocaleString("en-IN")}`;
}

function getVehicleGradientClass(type: string): string {
  const t = type.toLowerCase();
  if (
    t.includes("car") ||
    t.includes("suv") ||
    t.includes("sedan") ||
    t.includes("hatchback")
  )
    return "vehicle-gradient-car";
  if (t.includes("bike") || t.includes("motorcycle"))
    return "vehicle-gradient-bike";
  if (t.includes("scooter")) return "vehicle-gradient-scooter";
  if (t.includes("ev") || t.includes("electric")) return "vehicle-gradient-ev";
  return "vehicle-gradient-default";
}

function getVehicleIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("bike") || t.includes("motorcycle"))
    return <Bike className="w-10 h-10" />;
  if (t.includes("ev") || t.includes("electric"))
    return <Zap className="w-10 h-10" />;
  if (t.includes("scooter")) return <Gauge className="w-10 h-10" />;
  return <Car className="w-10 h-10" />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Filters {
  brand: string;
  model: string;
  year: string;
  vehicleType: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useAllVehicles() {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle[]>({
    queryKey: ["allVehicles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVehicles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

function useBrands() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBrands();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

function useVehicleTypes() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["vehicleTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVehicleTypes();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

function useYears() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["years"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getYears();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

function useModels(brand: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["models", brand],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getModels(brand);
    },
    enabled: !!actor && !isFetching && brand !== "",
    staleTime: 60_000,
  });
}

function useSearchVehicles(query: string, filters: Filters) {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle[]>({
    queryKey: [
      "search",
      query,
      filters.brand,
      filters.model,
      filters.year,
      filters.vehicleType,
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchVehicles(
        query,
        filters.brand,
        filters.model,
        filters.year !== "" ? BigInt(filters.year) : 0n,
        filters.vehicleType,
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 5_000,
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VehicleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  compareList: bigint[];
  onCompare: (v: Vehicle) => void;
}

function VehicleCard({
  vehicle,
  index,
  compareList,
  onCompare,
}: VehicleCardProps) {
  const isCompared = compareList.includes(vehicle.id);
  const gradientClass = getVehicleGradientClass(vehicle.vehicleType);

  return (
    <motion.article
      data-ocid={`vehicle.card.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Image area */}
      <div
        className={`relative h-44 flex items-center justify-center overflow-hidden noise-overlay ${gradientClass}`}
      >
        {/* Vehicle type icon */}
        <div className="text-foreground/20 group-hover:text-foreground/30 transition-colors duration-300 group-hover:scale-105 transform">
          {getVehicleIcon(vehicle.vehicleType)}
        </div>
        {/* Year badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium font-display bg-black/40 backdrop-blur-sm text-foreground/80 px-2 py-1 rounded-md border border-white/10">
            {Number(vehicle.year)}
          </span>
        </div>
        {/* Vehicle type badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium font-display bg-primary/20 text-primary px-2 py-1 rounded-md border border-primary/30">
            {vehicle.vehicleType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-display font-semibold text-base text-foreground leading-tight line-clamp-1">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            {vehicle.name}
          </p>
        </div>

        <div className="text-xl font-display font-bold text-primary">
          {formatIndianPrice(vehicle.price)}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="text-xs font-body gap-1 px-2 py-0.5"
          >
            <Fuel className="w-3 h-3" />
            {vehicle.fuelType}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs font-body gap-1 px-2 py-0.5"
          >
            <Settings2 className="w-3 h-3" />
            {vehicle.transmission}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Button
            data-ocid={`vehicle.compare_button.${index}`}
            variant={isCompared ? "default" : "outline"}
            size="sm"
            className={`flex-1 text-xs font-body gap-1.5 ${isCompared ? "bg-primary text-primary-foreground" : "border-border hover:border-primary/60 hover:text-primary"}`}
            onClick={() => onCompare(vehicle)}
          >
            <GitCompare className="w-3.5 h-3.5" />
            {isCompared ? "Added" : "Compare"}
          </Button>
          <Button
            data-ocid={`vehicle.details_button.${index}`}
            variant="ghost"
            size="sm"
            className="flex-1 text-xs font-body gap-1.5 hover:bg-accent hover:text-foreground"
            onClick={() =>
              toast.info(`${vehicle.brand} ${vehicle.model}`, {
                description: `${vehicle.fuelType} · ${vehicle.transmission} · ${Number(vehicle.year)}`,
              })
            }
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1 text-xs font-body bg-primary/15 text-primary border border-primary/30 px-2 py-1 rounded-full"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-primary/70 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    brand: "",
    model: "",
    year: "",
    vehicleType: "",
  });
  const [suggestions, setSuggestions] = useState<Vehicle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [compareList, setCompareList] = useState<bigint[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Backend queries (parallel)
  const { data: allVehicles = [], isLoading: vehiclesLoading } =
    useAllVehicles();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();
  const { data: vehicleTypes = [], isLoading: typesLoading } =
    useVehicleTypes();
  const { data: years = [], isLoading: yearsLoading } = useYears();
  const { data: models = [] } = useModels(filters.brand);

  const hasFilters =
    debouncedQuery !== "" ||
    filters.brand !== "" ||
    filters.model !== "" ||
    filters.year !== "" ||
    filters.vehicleType !== "";

  const {
    data: searchResults,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useSearchVehicles(debouncedQuery, filters);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-suggest: filter allVehicles locally
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = allVehicles
      .filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q),
      )
      .slice(0, 5);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setSelectedSuggestionIndex(-1);
  }, [searchQuery, allVehicles]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((i) =>
          Math.min(i + 1, suggestions.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        if (selectedSuggestionIndex >= 0) {
          const v = suggestions[selectedSuggestionIndex];
          setSearchQuery(`${v.brand} ${v.model}`);
          setShowSuggestions(false);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [showSuggestions, suggestions, selectedSuggestionIndex],
  );

  const selectSuggestion = (v: Vehicle) => {
    setSearchQuery(`${v.brand} ${v.model}`);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setFilters({ brand: "", model: "", year: "", vehicleType: "" });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBrandChange = (value: string) => {
    setFilters((f) => ({
      ...f,
      brand: value === "all" ? "" : value,
      model: "",
    }));
  };

  const handleCompare = (vehicle: Vehicle) => {
    setCompareList((prev) => {
      if (prev.includes(vehicle.id)) {
        toast.info(`Removed ${vehicle.brand} ${vehicle.model} from compare`);
        return prev.filter((id) => id !== vehicle.id);
      }
      if (prev.length >= 3) {
        toast.error("You can compare up to 3 vehicles at a time");
        return prev;
      }
      toast.success(`Added ${vehicle.brand} ${vehicle.model} to compare`);
      return [...prev, vehicle.id];
    });
  };

  const displayedVehicles = searchResults ?? allVehicles;
  const isLoading =
    vehiclesLoading || brandsLoading || typesLoading || yearsLoading;
  const isSearching = searchLoading || searchFetching;

  const sortedYears = [...years].sort((a, b) => Number(b) - Number(a));

  // Active filter chips
  const activeFilters: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.brand)
    activeFilters.push({
      label: filters.brand,
      onRemove: () => setFilters((f) => ({ ...f, brand: "", model: "" })),
    });
  if (filters.model)
    activeFilters.push({
      label: filters.model,
      onRemove: () => setFilters((f) => ({ ...f, model: "" })),
    });
  if (filters.year)
    activeFilters.push({
      label: filters.year,
      onRemove: () => setFilters((f) => ({ ...f, year: "" })),
    });
  if (filters.vehicleType)
    activeFilters.push({
      label: filters.vehicleType,
      onRemove: () => setFilters((f) => ({ ...f, vehicleType: "" })),
    });

  const FiltersPanel = () => (
    <div className="space-y-5">
      {/* Filters header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold text-sm text-foreground uppercase tracking-wider">
            Filters
          </span>
        </div>
        {hasFilters && (
          <Button
            data-ocid="filters.clear_button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-primary px-2 h-7 font-body"
          >
            Clear All
          </Button>
        )}
      </div>

      <Separator className="bg-border/60" />

      {/* Filter selects */}
      <div className="space-y-4">
        {/* Brand */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-brand"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body"
          >
            Brand / Company
          </label>
          <Select
            value={filters.brand || "all"}
            onValueChange={handleBrandChange}
            disabled={brandsLoading}
          >
            <SelectTrigger
              id="filter-brand"
              data-ocid="filters.brand.select"
              className="h-9 text-sm bg-secondary border-border font-body"
            >
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border font-body">
              <SelectItem value="all" className="text-sm">
                All Brands
              </SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b} className="text-sm">
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-model"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body"
          >
            Model
          </label>
          <Select
            value={filters.model || "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, model: v === "all" ? "" : v }))
            }
            disabled={!filters.brand || models.length === 0}
          >
            <SelectTrigger
              id="filter-model"
              data-ocid="filters.model.select"
              className="h-9 text-sm bg-secondary border-border font-body disabled:opacity-40"
            >
              <SelectValue
                placeholder={
                  filters.brand ? "All Models" : "Select brand first"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border font-body">
              <SelectItem value="all" className="text-sm">
                All Models
              </SelectItem>
              {models.map((m) => (
                <SelectItem key={m} value={m} className="text-sm">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-year"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body"
          >
            Year
          </label>
          <Select
            value={filters.year || "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, year: v === "all" ? "" : v }))
            }
            disabled={yearsLoading}
          >
            <SelectTrigger
              id="filter-year"
              data-ocid="filters.year.select"
              className="h-9 text-sm bg-secondary border-border font-body"
            >
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border font-body">
              <SelectItem value="all" className="text-sm">
                All Years
              </SelectItem>
              {sortedYears.map((y) => (
                <SelectItem
                  key={String(y)}
                  value={String(Number(y))}
                  className="text-sm"
                >
                  {Number(y)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-type"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body"
          >
            Vehicle Type
          </label>
          <Select
            value={filters.vehicleType || "all"}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, vehicleType: v === "all" ? "" : v }))
            }
            disabled={typesLoading}
          >
            <SelectTrigger
              id="filter-type"
              data-ocid="filters.type.select"
              className="h-9 text-sm bg-secondary border-border font-body"
            >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border font-body">
              <SelectItem value="all" className="text-sm">
                All Types
              </SelectItem>
              {vehicleTypes.map((t) => (
                <SelectItem key={t} value={t} className="text-sm">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeFilters.map((chip) => (
              <FilterChip
                key={chip.label}
                label={chip.label}
                onRemove={chip.onRemove}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Compare tray */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="border border-primary/30 bg-primary/10 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-semibold text-primary uppercase tracking-wide">
                Compare ({compareList.length}/3)
              </span>
              <button
                type="button"
                onClick={() => setCompareList([])}
                className="text-muted-foreground hover:text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {compareList.map((id) => {
              const v = allVehicles.find((v) => v.id === id);
              if (!v) return null;
              return (
                <div
                  key={String(id)}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-foreground font-body truncate">
                    {v.brand} {v.model}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCompareList((l) => l.filter((x) => x !== id))
                    }
                    className="text-muted-foreground hover:text-destructive ml-2 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            {compareList.length >= 2 && (
              <Button
                variant="default"
                size="sm"
                className="w-full text-xs font-body bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() =>
                  toast.success("Opening comparison view", {
                    description: "Comparing selected vehicles...",
                  })
                }
              >
                <GitCompare className="w-3.5 h-3.5 mr-1.5" />
                Compare Now
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster
        theme="dark"
        className="font-body"
        toastOptions={{ className: "font-body" }}
      />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="h-16 px-4 md:px-6 flex items-center gap-4">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="AutoCompare home"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/generated/autocompare-logo-icon-transparent.dim_48x48.png"
                alt=""
                className="w-6 h-6 object-contain opacity-90"
              />
            </div>
            <span className="font-display font-bold text-lg tracking-tight hidden sm:block">
              Auto<span className="text-primary">Compare</span>
            </span>
          </a>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-auto relative">
            <div className="search-glow relative flex items-center bg-secondary border border-border rounded-xl transition-all duration-200">
              <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                data-ocid="header.search_input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="Search cars, bikes, scooters..."
                className="w-full bg-transparent h-11 pl-10 pr-10 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-expanded={showSuggestions}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  ref={suggestionsRef}
                  id="search-suggestions"
                  data-ocid="search.suggestions.dropdown_menu"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 right-0 z-50 bg-popover border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                  aria-label="Vehicle suggestions"
                >
                  {suggestions.map((v, i) => (
                    <button
                      key={String(v.id)}
                      type="button"
                      data-ocid={`search.suggestion.item.${i + 1}`}
                      data-selected={i === selectedSuggestionIndex}
                      aria-selected={i === selectedSuggestionIndex}
                      onClick={() => selectSuggestion(v)}
                      onMouseEnter={() => setSelectedSuggestionIndex(i)}
                      className="suggestion-item w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-foreground">
                        {getVehicleIcon(v.vehicleType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-body font-medium text-foreground truncate">
                          {v.brand} {v.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {v.vehicleType} · {Number(v.year)} ·{" "}
                          {formatIndianPrice(v.price)}
                        </div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-[-90deg] shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden border-border font-body gap-1.5 h-9"
            onClick={() => setMobileFiltersOpen((o) => !o)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="ml-0.5 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile filters panel (animated) */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <div className="p-4">
                <FiltersPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <main className="flex-1 flex overflow-hidden">
        {/* Filters sidebar (desktop) */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-border overflow-y-auto p-5">
          <FiltersPanel />
        </aside>

        {/* Results area */}
        <section className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-semibold text-foreground">
                  {isLoading ? (
                    <Skeleton className="h-5 w-36" />
                  ) : (
                    <>
                      Showing{" "}
                      <span className="text-primary">
                        {isSearching ? "..." : displayedVehicles.length}
                      </span>{" "}
                      vehicle{displayedVehicles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </h2>
                {isSearching && !isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                )}
              </div>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground font-body gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </Button>
              )}
            </div>

            {/* Loading skeleton grid */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((k) => (
                  <VehicleCardSkeleton key={k} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isSearching && displayedVehicles.length === 0 && (
              <motion.div
                data-ocid="results.empty_state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
                  <Car className="w-9 h-9 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  No vehicles found
                </h3>
                <p className="text-sm text-muted-foreground font-body max-w-xs mb-4">
                  Try adjusting your search or clearing the filters to find more
                  results.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="font-body border-border hover:border-primary/60 hover:text-primary"
                >
                  Clear all filters
                </Button>
              </motion.div>
            )}

            {/* Results grid */}
            {!isLoading && (
              <div
                data-ocid="results.list"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {displayedVehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={String(vehicle.id)}
                    vehicle={vehicle}
                    index={index + 1}
                    compareList={compareList}
                    onCompare={handleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-4 px-6">
        <p className="text-center text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. Built with{" "}
          <span aria-label="love">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
