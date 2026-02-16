import { redirect } from "next/navigation";

export const metadata = {
  title: "Subscription - 99Sellers",
  description: "Manage your subscription and billing",
};

const Page = () => {
  redirect("/dashboard/subscription");
};

export default Page;
