import Nat "mo:core/Nat";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {
  type Vehicle = {
    id : Nat;
    name : Text;
    brand : Text;
    model : Text;
    year : Nat;
    vehicleType : Text;
    price : Nat;
    fuelType : Text;
    transmission : Text;
  };

  let vehicles : [Vehicle] = [
    // Toyota
    {
      id = 1;
      name = "Toyota Fortuner";
      brand = "Toyota";
      model = "Fortuner";
      year = 2023;
      vehicleType = "Car";
      price = 3200000;
      fuelType = "Diesel";
      transmission = "Automatic";
    },
    {
      id = 2;
      name = "Toyota Innova Crysta";
      brand = "Toyota";
      model = "Innova Crysta";
      year = 2024;
      vehicleType = "Car";
      price = 2500000;
      fuelType = "Petrol";
      transmission = "Manual";
    },

    // Hyundai
    {
      id = 3;
      name = "Hyundai Creta";
      brand = "Hyundai";
      model = "Creta";
      year = 2022;
      vehicleType = "Car";
      price = 1500000;
      fuelType = "Petrol";
      transmission = "Automatic";
    },
    {
      id = 4;
      name = "Hyundai i20";
      brand = "Hyundai";
      model = "i20";
      year = 2021;
      vehicleType = "Car";
      price = 900000;
      fuelType = "Petrol";
      transmission = "Manual";
    },
    {
      id = 5;
      name = "Hyundai Verna";
      brand = "Hyundai";
      model = "Verna";
      year = 2023;
      vehicleType = "Car";
      price = 1300000;
      fuelType = "Diesel";
      transmission = "Manual";
    },

    // Honda
    {
      id = 6;
      name = "Honda City";
      brand = "Honda";
      model = "City";
      year = 2022;
      vehicleType = "Car";
      price = 1200000;
      fuelType = "Petrol";
      transmission = "Automatic";
    },
    {
      id = 7;
      name = "Honda Activa 6G";
      brand = "Honda";
      model = "Activa 6G";
      year = 2024;
      vehicleType = "Scooter";
      price = 80000;
      fuelType = "Petrol";
      transmission = "Automatic";
    },

    // Tata
    {
      id = 8;
      name = "Tata Nexon";
      brand = "Tata";
      model = "Nexon";
      year = 2023;
      vehicleType = "Car";
      price = 1200000;
      fuelType = "Petrol";
      transmission = "Manual";
    },
    {
      id = 9;
      name = "Tata Altroz";
      brand = "Tata";
      model = "Altroz";
      year = 2022;
      vehicleType = "Car";
      price = 800000;
      fuelType = "Diesel";
      transmission = "Manual";
    },
    {
      id = 10;
      name = "Tata Nexon EV";
      brand = "Tata";
      model = "Nexon EV";
      year = 2024;
      vehicleType = "EV";
      price = 1600000;
      fuelType = "Electric";
      transmission = "Automatic";
    },

    // Suzuki
    {
      id = 11;
      name = "Suzuki Swift";
      brand = "Suzuki";
      model = "Swift";
      year = 2021;
      vehicleType = "Car";
      price = 700000;
      fuelType = "Petrol";
      transmission = "Manual";
    },
    {
      id = 12;
      name = "Suzuki Baleno";
      brand = "Suzuki";
      model = "Baleno";
      year = 2023;
      vehicleType = "Car";
      price = 800000;
      fuelType = "Petrol";
      transmission = "Automatic";
    },
    {
      id = 13;
      name = "Suzuki Access 125";
      brand = "Suzuki";
      model = "Access 125";
      year = 2022;
      vehicleType = "Scooter";
      price = 75000;
      fuelType = "Petrol";
      transmission = "Automatic";
    },

    // Royal Enfield
    {
      id = 14;
      name = "Royal Enfield Classic 350";
      brand = "Royal Enfield";
      model = "Classic 350";
      year = 2024;
      vehicleType = "Bike";
      price = 200000;
      fuelType = "Petrol";
      transmission = "Manual";
    },
    {
      id = 15;
      name = "Royal Enfield Bullet 350";
      brand = "Royal Enfield";
      model = "Bullet 350";
      year = 2021;
      vehicleType = "Bike";
      price = 180000;
      fuelType = "Petrol";
      transmission = "Manual";
    },

    // Bajaj
    {
      id = 16;
      name = "Bajaj Pulsar NS200";
      brand = "Bajaj";
      model = "Pulsar NS200";
      year = 2023;
      vehicleType = "Bike";
      price = 120000;
      fuelType = "Petrol";
      transmission = "Manual";
    },
    {
      id = 17;
      name = "Bajaj Chetak Electric";
      brand = "Bajaj";
      model = "Chetak Electric";
      year = 2024;
      vehicleType = "EV";
      price = 150000;
      fuelType = "Electric";
      transmission = "Automatic";
    },
  ];

  public query ({ caller }) func getAllVehicles() : async [Vehicle] {
    vehicles;
  };

  public query ({ caller }) func searchVehicles(searchQuery : Text, brand : Text, model : Text, year : Nat, vehicleType : Text) : async [Vehicle] {
    vehicles.filter(
      func(vehicle) {
        let matchesQuery = searchQuery.isEmpty() or vehicle.name.toLower().contains(#text(searchQuery.toLower()));
        let matchesBrand = brand.isEmpty() or Text.equal(vehicle.brand, brand);
        let matchesModel = model.isEmpty() or Text.equal(vehicle.model, model);
        let matchesYear = year == 0 or vehicle.year == year;
        let matchesType = vehicleType.isEmpty() or Text.equal(vehicle.vehicleType, vehicleType);

        matchesQuery and matchesBrand and matchesModel and matchesYear and matchesType
      }
    );
  };

  public query ({ caller }) func getBrands() : async [Text] {
    let brandsSet = Set.empty<Text>();
    for (vehicle in vehicles.values()) {
      brandsSet.add(vehicle.brand);
    };
    brandsSet.values().toArray();
  };

  public query ({ caller }) func getModels(brand : Text) : async [Text] {
    if (brand.isEmpty()) { return [] };
    let modelsSet = Set.empty<Text>();
    for (vehicle in vehicles.values()) {
      if (Text.equal(vehicle.brand, brand)) {
        modelsSet.add(vehicle.model);
      };
    };
    modelsSet.values().toArray();
  };

  public query ({ caller }) func getYears() : async [Nat] {
    let yearsSet = Set.empty<Nat>();
    for (vehicle in vehicles.values()) {
      yearsSet.add(vehicle.year);
    };
    yearsSet.values().toArray();
  };

  public query ({ caller }) func getVehicleTypes() : async [Text] {
    let typesSet = Set.empty<Text>();
    for (vehicle in vehicles.values()) {
      typesSet.add(vehicle.vehicleType);
    };
    typesSet.values().toArray();
  };
};
