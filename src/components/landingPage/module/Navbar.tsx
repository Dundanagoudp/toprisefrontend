"use client";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// import { GitHubLogoIcon } from "@radix-ui/react-icons";
// import { buttonVariants } from "./ui/button";
import { Menu } from "lucide-react";
import DynamicButton from "@/components/common/button/button";
// import { ModeToggle } from "./mode-toggle";
// import { LogoIcon } from "./Icons";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "/TermsAndConditions",
    label: "Terms & Conditions",
  },
  {
    href: "/PrivacyPolicy",
    label: "Privacy and Policy",
  },
//   {
//     href: "#pricing",
//     label: "Pricing",
//   },
//   {
//     href: "#faq",
//     label: "FAQ",
//   },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-16 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-xl flex"
            >
              {/* <LogoIcon /> */}
              TopRise Ventures
            </a>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            {/* <ModeToggle /> */}

            <Sheet
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    Shadcn/React
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-4 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="text-red-500 font-medium hover:text-red-600 transition-colors text-center py-2"
                    >
                      {label}
                    </a>
                  ))}
                  <DynamicButton
                    variant="default"
                    className="mt-4 w-full max-w-xs"
                    text="Contact Us"
                  />
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {routeList.map((route: RouteProps, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className="font-semibold font-sans text-[#1A1A1A] hover:text-gray-600 transition-colors"
              >
                {route.label}
              </a>
            ))}
            <DynamicButton
              variant="default"
              className="ml-2 bg-[#C72920]"
              text="Contact Us"
            />
          </nav>

   
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
