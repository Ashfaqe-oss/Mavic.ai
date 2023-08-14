"use client";

import { Carrot, Home, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Music,
  Settings,
  VideoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatCompletionResponseMessageRoleEnum } from "openai";
import { FreeCounter } from "../free-counter";

const sidebar = ({
  apiLimitCount = 0,
  isPro = false,
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pathname = usePathname();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  const onNavigate = (url: string, pro: boolean) => {
    return router.push(url);
  };

  const routes = [
    {
      icon: Home,
      href: "/",
      label: "Home",
      pro: false,
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
      pro: true,
    },
    {
      icon: Plus,
      href: "/companion/new",
      label: "Create",
      pro: true,
    },
    {
      label: "Companion",
      icon: MessageSquare,
      href: "/companion",
      color: "text-violet-500",
      pro: true,
    },
    {
      label: "Music",
      icon: Music,
      color: "text-emerald-500",
      href: "/music",
      pro: true,
    },
    {
      label: "Video",
      icon: VideoIcon,
      color: "text-orange-700",
      href: "/video",
      pro: true,
    },

    {
      label: "Image",
      icon: ImageIcon,
      color: "text-pink-700",
      href: "/image",
      pro: true,
    },

    {
      label: "Code",
      icon: Code,
      color: "text-green-700",
      href: "/code",
      pro: true,
    },
    {
      label: "Cartoon",
      icon: Carrot,
      color: "text-pink-700",
      href: "/cartoon",
      pro: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      pro: false,
    },
  ];
  return (
    <div className="space-y-5 flex flex-col h-full border-r-2 border-slate-600 text-primary bg-secondary mb-4">
      <div className="p-3 flex-1 flex justify-center overflow-y-scroll no-scrollbar pb-24">
        <div>
          {routes.map((route) => (
            <div
              key={route.href}
              onClick={() => onNavigate(route.href, route.pro)}
              className={cn(
                "text-muted-foreground text-xs group flex p-3 my-1 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href && "bg-primary/10 text-primary"
              )}
            >
              <div className="flex flex-col gap-y-2 items-center flex-1">
                <route.icon className="w-6 h-6" />
                {route.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!isPro && <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />}
    </div>
  );
};

export default sidebar;
