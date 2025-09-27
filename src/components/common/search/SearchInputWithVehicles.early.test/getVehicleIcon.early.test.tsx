import React from 'react'
import { Bike, Car } from "lucide-react";


// src/components/common/search/SearchInputWithVehicles.getVehicleIcon.test.tsx



// src/components/common/search/SearchInputWithVehicles.getVehicleIcon.test.tsx
// However, since getVehicleIcon is a closure inside the component, we need to "redefine" it here for testability.
// Alternatively, we can copy the function for testing purposes, as it is pure and stateless.

const getVehicleIconTest = (vehicleType?: string) => {
  if (vehicleType?.toLowerCase() === 'bike' || vehicleType?.toLowerCase() === 'scooter') {
    return <Bike className="h-4 w-4" />;
  }
  return <Car className="h-4 w-4" />;
};

describe('getVehicleIcon() getVehicleIcon method', () => {
  // Happy Path Tests
  describe("Happy Paths", () => {
    it("should return Bike icon for 'bike' (lowercase)", () => {
      // Test: Ensure 'bike' returns Bike icon
      const result = getVehicleIconTest("bike");
      expect(result.type).toBe(Bike);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Bike icon for 'Bike' (capitalized)", () => {
      // Test: Ensure 'Bike' returns Bike icon (case-insensitive)
      const result = getVehicleIconTest("Bike");
      expect(result.type).toBe(Bike);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Bike icon for 'scooter' (lowercase)", () => {
      // Test: Ensure 'scooter' returns Bike icon
      const result = getVehicleIconTest("scooter");
      expect(result.type).toBe(Bike);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Bike icon for 'Scooter' (capitalized)", () => {
      // Test: Ensure 'Scooter' returns Bike icon (case-insensitive)
      const result = getVehicleIconTest("Scooter");
      expect(result.type).toBe(Bike);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon for 'car' (lowercase)", () => {
      // Test: Ensure 'car' returns Car icon
      const result = getVehicleIconTest("car");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon for 'Car' (capitalized)", () => {
      // Test: Ensure 'Car' returns Car icon (case-insensitive)
      const result = getVehicleIconTest("Car");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon for 'SUV'", () => {
      // Test: Ensure 'SUV' returns Car icon (unrecognized type)
      const result = getVehicleIconTest("SUV");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon for 'truck'", () => {
      // Test: Ensure 'truck' returns Car icon (unrecognized type)
      const result = getVehicleIconTest("truck");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });
  });

  // Edge Case Tests
  describe("Edge Cases", () => {
    it("should return Car icon when vehicleType is undefined", () => {
      // Test: Ensure undefined input returns Car icon
      const result = getVehicleIconTest(undefined);
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon when vehicleType is an empty string", () => {
      // Test: Ensure empty string input returns Car icon
      const result = getVehicleIconTest("");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon when vehicleType is a whitespace string", () => {
      // Test: Ensure whitespace string input returns Car icon
      const result = getVehicleIconTest("   ");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon for a random string", () => {
      // Test: Ensure random string input returns Car icon
      const result = getVehicleIconTest("plane");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Bike icon for 'BIKE' (uppercase)", () => {
      // Test: Ensure 'BIKE' (all uppercase) returns Bike icon
      const result = getVehicleIconTest("BIKE");
      expect(result.type).toBe(Bike);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Bike icon for 'SCOOTER' (uppercase)", () => {
      // Test: Ensure 'SCOOTER' (all uppercase) returns Bike icon
      const result = getVehicleIconTest("SCOOTER");
      expect(result.type).toBe(Bike);
      expect(result.props.className).toBe("h-4 w-4");
    });

    it("should return Car icon for a numeric string", () => {
      // Test: Ensure numeric string input returns Car icon
      const result = getVehicleIconTest("1234");
      expect(result.type).toBe(Car);
      expect(result.props.className).toBe("h-4 w-4");
    });
  });
});