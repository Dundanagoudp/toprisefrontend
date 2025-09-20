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
import { Input } from "@/components/ui/input";
import { Search, User, Settings, LogOut as LogOutIcon } from "lucide-react";
import { CartSidebar } from "./CartSideBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/types/User/cart-Types";
import { useToast } from "@/components/ui/toast";

import { searchRequest, searchSuccess, searchFailure } from "@/store/slice/search/searchSlice";
import logo from "../../../../public/assets/logo.png";
import Image from "next/image";
import { LogOut } from "@/store/slice/auth/authSlice";
import SearchInput from "@/components/common/search/SearchInput";
import { smartSearch } from "@/service/user/smartSearchService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { selectVehicleType, selectVehicleTypeId, toggleVehicleType } from "@/store/slice/vehicle/vehicleSlice";
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


];

export const Header = () => {
  const userId = useAppSelector((state) => state.auth.user?._id);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const vehicleType = useAppSelector(selectVehicleType);
  const typeId = useAppSelector(selectVehicleTypeId);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
    router.replace('/shop');
    window.location.reload();
  };

  const handleSettings = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      // For non-authenticated users, navigate to profile page or show login prompt
      router.push('/login');
    }
  };
  const handleSearch = async (query: string) => {
    const response = await smartSearch(query);
    console.log(response);
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
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              onSubmit={handleSearchSubmit}
              placeholder="Search products..."
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
      <Label htmlFor="mode-toggle" className="text-sm text-gray-700">
        car
      </Label>
      <Switch
        id="mode-toggle"
        checked={vehicleType === "bike"}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="mode-toggle" className="text-sm text-gray-700">
        bike
      </Label>
    </div>

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
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
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
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push('/login')}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Please Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
