"use client";

import PropertyDetailsPage from "@/components/dashboard/PropertyDetailsPage";

interface PageProps {
  params: { id: string };
}

const Page = ({ params }: PageProps) => {
  return <PropertyDetailsPage propertyId={parseInt(params.id)} />;
};

export default Page;
