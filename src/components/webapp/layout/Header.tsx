"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut as LogOutIcon } from "lucide-react";
import { CartSidebar } from "./CartSideBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/types/User/cart-Types";
import { useToast } from "@/components/ui/toast";

import { searchRequest, searchSuccess, searchFailure } from "@/store/slice/search/searchSlice";
import LogoNoname from "../../../../public/assets/logo.png";
import Image from "next/image";
import { LogOut } from "@/store/slice/auth/authSlice";
import SearchInput from "@/components/common/search/SearchInput";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { selectVehicleType, selectVehicleTypeId, toggleVehicleType } from "@/store/slice/vehicle/vehicleSlice";

export const Header = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const vehicleType = useAppSelector(selectVehicleType);
  const typeId = useAppSelector(selectVehicleTypeId);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    cartData: cart,
    fetchCart,
    increaseItemQuantity,
    decreaseItemQuantity,
    removeItemFromCart
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('lastlogin');
    localStorage.clear();
    sessionStorage.clear();
    dispatch(LogOut());
    router.replace('/');
    window.location.reload();
  };

  const handleSettings = () => {

    router.push('profile');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

const handleSearchSubmit = async () => {
  if (!searchValue.trim()) return;

  try {
    const params = new URLSearchParams({
      query: searchValue.trim(),
      vehicleTypeId: typeId,
    });

    router.push(`/shop/search/?${params.toString()}`);
  } catch (error) {
    console.error("Failed to execute search:", error);
  }
};

  const handleSearchClear = () => {
    setSearchValue("");
  };

  const handleToggle = () => {
    dispatch(toggleVehicleType());
  };

  const handleQuantityChange = async (productId: string, action: 'increase' | 'decrease') => {
    try {
      if (action === 'increase') {
        await increaseItemQuantity(productId);
        showToast("Quantity increased successfully", "success");
      } else if (action === 'decrease') {
        await decreaseItemQuantity(productId);
        showToast("Quantity decreased successfully", "success");
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      showToast("Failed to update quantity", "error");
    }
  };

  const removeFromCart = (itemId: string) => {
    removeItemFromCart(itemId);
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total: number, item: CartItem) => total + item.product_total, 0);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center group">
              <Image
                src={LogoNoname}
                alt="Toprise logo"
                className="h-16 sm:h-20 w-auto transition-all duration-300 ease-in-out group-hover:opacity-90 group-hover:scale-105"
              />
              <span className="ml-0 text-2xl sm:text-3xl font-extrabold text-[#1C1C1C] select-none leading-none tracking-tight bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-gray-700 group-hover:to-gray-900">
                Toprise
              </span>
            </a>
          </div>


          {/* Center Search Bar */}
          <div className="flex-grow flex justify-center">
            <div className="w-full max-w-md">
              <SearchInput
                value={searchValue}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                onSubmit={handleSearchSubmit}
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Right Side - Vehicle Toggle, Navigation Menu, Cart, Profile */}
          <div className="flex items-center space-x-4">
            {/* Vehicle Type Toggle */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="mode-toggle" className="text-sm text-gray-700">
                Car
              </Label>
              <Switch
                id="mode-toggle"
                checked={vehicleType === "bike"}
                onCheckedChange={handleToggle}
              />
              <Label htmlFor="mode-toggle" className="text-sm text-gray-700">
                Bike/Scooter
              </Label>
            </div>

            {/* Navigation Menu Moved to the Right */}
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <NavigationMenuLink
                        href="/services/upload-parts"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Upload Required Parts List
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        href="/services/upcoming"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Upcoming Services
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <NavigationMenuLink
                        href="/PrivacyPolicy"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Privacy Policy
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        href="/ShippingAndReturnPolicy"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Shipping Policy
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        href="/TermsAndConditions"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Terms & Conditions
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        href="/aboutus"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        About Us
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        href="/contact"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Contact Us
                      </NavigationMenuLink>

                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {/* Account link intentionally hidden */}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Cart */}
            <CartSidebar
              cart={cart}
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              handleQuantityChange={handleQuantityChange}
              removeFromCart={removeFromCart}
              calculateTotal={calculateTotal}
            />
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={handleSettings}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
