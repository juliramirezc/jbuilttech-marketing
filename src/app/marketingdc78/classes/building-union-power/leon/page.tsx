import type { Metadata } from "next";
import { LEON_CLASS } from "@/lib/buildingUnionPower/classes";
import { BuildingUnionPowerRegistrationForm } from "@/components/buildingUnionPower/BuildingUnionPowerRegistrationForm";

export const metadata: Metadata = {
  title: "Building Union Power 2 — Leon County | IUPAT District Council 78",
  description:
    "Register for the Building Union Power 2 class in Leon County on Saturday, November 7, 2026 at 2757 West Pensacola Street, Tallahassee, Florida.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function LeonBuildingUnionPowerPage() {
  return (
    <BuildingUnionPowerRegistrationForm
      classConfig={LEON_CLASS}
      apiPath="/api/building-union-power/leon"
    />
  );
}
