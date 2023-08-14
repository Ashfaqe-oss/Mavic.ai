import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./sidebar";

const mobileSidebar = ({
  apiLimitCount = 0,
  isPro = false
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4">
        <Menu/>
      </SheetTrigger>
      <SheetContent  side="left" className="p-0 bg-secondary pt-10 w-32">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount}/>
      </SheetContent>
    </Sheet>
  );
};

export default mobileSidebar;
