import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Vehicle {
    id: bigint;
    model: string;
    vehicleType: string;
    name: string;
    year: bigint;
    transmission: string;
    fuelType: string;
    brand: string;
    price: bigint;
}
export interface backendInterface {
    getAllVehicles(): Promise<Array<Vehicle>>;
    getBrands(): Promise<Array<string>>;
    getModels(brand: string): Promise<Array<string>>;
    getVehicleTypes(): Promise<Array<string>>;
    getYears(): Promise<Array<bigint>>;
    searchVehicles(searchQuery: string, brand: string, model: string, year: bigint, vehicleType: string): Promise<Array<Vehicle>>;
}
