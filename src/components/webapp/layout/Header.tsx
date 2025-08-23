"use client";
import { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

// import { GitHubLogoIcon } from "@radix-ui/react-icons";
// import { buttonVariants } from "./ui/button";
import { Bell, Menu, Phone, Search, User } from "lucide-react";
import DynamicButton from "@/components/common/button/button";
import logo from "../../../../public/assets/logo.png";
import Image from "next/image";
import ContactDialog from "@/components/landingPage/module/popup/contactus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCart } from "@/service/user/cartService";
import { useAppSelector } from "@/store/hooks";
import { CartItem } from "@/types/User/cart-Types";
import { CartSidebar } from "./CartSideBar";

// import ContactDialog from "./popup/contactus";
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
    label: "Privacy Policy",
  },
  {
    href: "/ShippingAndReturnPolicy",
    label: "Shipping & Returns Policy ",
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

export const Header = () => {
  const userId = useAppSelector((state) => state.auth.user._id);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [cart, setCart] = useState<any>(null);
  const [cartOpen, setCartOpen] = useState(false);
  
  const handleSLAFormSubmit = (data: any) => {
    setContactUsOpen(false);
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart(userId);
        setCart(response.data || null);
      } catch (err: any) {
        console.error("Failed to fetch cart:", err);
      }
    };
    fetchCart();
  }, [userId]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart((prevCart: any) => ({
      ...prevCart,
      items: prevCart.items.map((item: CartItem) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart: any) => ({
      ...prevCart,
      items: prevCart.items.filter((item: CartItem) => item._id !== itemId)
    }));
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total: number, item: CartItem) => total + item.product_total, 0);
  };

  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-16 px-4 w-screen flex justify-between">
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="ml-2 font-bold text-lg sm:text-xl flex cursor-pointer"
            >
              <Image
                src={logo}
                alt="Logo"
                className="hover:opacity-80 transition-opacity"
              />
            </a>
            
          </NavigationMenuItem>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Spare parts"
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 bg-red-600 hover:bg-red-700 text-white rounded-md px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <CartSidebar
              cart={cart}
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              handleQuantityChange={handleQuantityChange}
              removeFromCart={removeFromCart}
              calculateTotal={calculateTotal}
            />

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-600"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
      <ContactDialog
        open={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
      />
    </header>
  );
};
