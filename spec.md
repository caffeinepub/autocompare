# AutoCompare - Vehicle Search Dashboard

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-page dashboard with header (logo + search bar) and two-column layout (filters sidebar + results grid)
- Search bar with live filtering by vehicle name (search by make, model, or type)
- Auto-suggest dropdown showing matching vehicle names as user types
- Filters sidebar with dropdowns for: Company/Brand, Model, Year, Vehicle Type
- Vehicle result cards showing: image placeholder, name, year, price (INR), fuel type, Compare and View Details buttons
- Dummy vehicle data covering cars, bikes, scooters, and EVs from brands Toyota, Hyundai, Honda, Tata, Suzuki, Royal Enfield, Bajaj
- Active filter tags / clear filters button
- Results count display

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Store vehicle records with fields: id, name, brand, model, year, type (Car/Bike/Scooter/EV), price, fuelType, imageUrl. Expose query functions: searchVehicles(query, filters), getBrands(), getModels(brand), getYears(), getTypes().
2. Seed ~15-20 dummy vehicles across brands and types.
3. Frontend header: logo "AutoCompare" on left, large search bar in center/right.
4. Frontend sidebar: filter panel with Brand, Model, Year, Vehicle Type dropdowns. Model options update based on selected brand.
5. Frontend results grid: responsive 2-3 column grid of vehicle cards.
6. Vehicle card: image area, vehicle name + year, price in INR format, fuel type badge, Compare and View Details action buttons.
7. Wire search input and filter changes to live re-query the backend.
8. Auto-suggest dropdown on search input with up to 5 matching suggestions.
