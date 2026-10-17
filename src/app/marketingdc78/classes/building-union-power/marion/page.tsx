import type { Metadata } from "next";
import { MARION_CLASS } from "@/lib/buildingUnionPower/classes";
import { BuildingUnionPowerRegistrationForm } from "@/components/buildingUnionPower/BuildingUnionPowerRegistrationForm";

export const metadata: Metadata = {
  title: "Building Union Power 2 — Marion County | IUPAT District Council 78",
  description:
    "Register for the Building Union Power 2 class in Marion County on Saturday, October 24, 2026 at Marion Public Library.",
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

export default function MarionBuildingUnionPowerPage() {
  return (
    <BuildingUnionPowerRegistrationForm
      classConfig={MARION_CLASS}
      apiPath="/api/building-union-power/marion"
    />
  );
}
