import Heading from "@/components/heading";
import SubscriptionButton from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";
import { Settings } from "lucide-react";
import React from "react";

const SettingsPage = async () => {
  const isPro = await checkSubscription();

  return (
    <div className="flex items-center flex-col">
      <div>
        <Heading
          title="MAVIC Settings"
          desc="Always there to help you.."
          icon={Settings}
          imgUrl="/logo.png"
        />
      </div>
      <div className="p-6 lg:px-8 space-y-4">
        <h3>Account Settings </h3>
        <div className="text-muted-foreground text-sm">
          {isPro ? "You are currently on a Pro plan." : "You are currently on a free plan."}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default SettingsPage;
