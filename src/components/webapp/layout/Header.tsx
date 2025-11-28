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
import { User, Settings, LogOut as LogOutIcon, Menu, X } from "lucide-react";
import { CartSidebar } from "./CartSideBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "@/types/User/cart-Types";
import { useToast } from "@/components/ui/toast";
import LogoNoname from "../../../../public/assets/logo.png";
import Image from "next/image";
import { LogOut } from "@/store/slice/auth/authSlice";
import SearchInputWithVehicles from "@/components/common/search/SearchInputWithVehicles";
import { UserVehicleDetails } from "@/service/user/userService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { selectVehicleType, selectVehicleTypeId, toggleVehicleType } from "@/store/slice/vehicle/vehicleSlice";
import PurchaseOrderDialog from "../modules/UserSetting/popup/PurchaseOrderBox";


export const Header = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const vehicleType = useAppSelector(selectVehicleType);
  const typeId = useAppSelector(selectVehicleTypeId);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();
    const [poOpen, setPoOpen] = useState(false);
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

    router.push('/profile');
  };

  const handleSignup = () => {
    router.push('/login');
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

      router.push(`/shop/search-results/?${params.toString()}`);
    } catch (error) {
      console.error("Failed to execute search:", error);
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
  };

  const handleVehicleSelect = (vehicle: UserVehicleDetails) => {
    // You can customize this behavior based on your needs
    // For example, you might want to search for parts for this specific vehicle
    const searchQuery = `${vehicle.brand} ${vehicle.model} ${vehicle.variant || ''}`.trim();
    setSearchValue(searchQuery);

    // Optionally trigger search immediately
    if (searchQuery) {
      const params = new URLSearchParams({
        query: searchQuery,
        vehicleTypeId: typeId,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        variant: vehicle.variant || '',
      });
      router.push(`/shop/search-results/?${params.toString()}`);
    }
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
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center group">
              <Image
                src={LogoNoname}
                alt="Toprise logo"
                className="h-12 lg:h-16 w-auto transition-all duration-300 ease-in-out group-hover:opacity-90 group-hover:scale-105"
              />
              <span className="ml-0 text-xl  lg:text-3xl font-extrabold text-[#1C1C1C] select-none leading-none tracking-tight bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 group-hover:from-gray-700 group-hover:to-gray-900">
                Toprise
              </span>
            </a>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-grow justify-center">
            <div className="w-full max-w-md">
              <SearchInputWithVehicles
                value={searchValue}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                onSubmit={handleSearchSubmit}
                onVehicleSelect={handleVehicleSelect}
                placeholder="Search Products..."
              />
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
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

            {/* Navigation Menu */}
            <NavigationMenu>
              <NavigationMenuList className="flex gap-4">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                        <button
            onClick={() => setPoOpen(true)}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Upload Purchase Request
          </button>
                      {/* <NavigationMenuLink
                        href="/services/upload-parts"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Upload Required Parts List
                      </NavigationMenuLink> */}
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
                      {/* <NavigationMenuLink
                        href="/aboutus"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        About Us
                      </NavigationMenuLink> */}
                      <NavigationMenuLink
                        href="/contactus"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Contact Us
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
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

            {/* Auth State */}
            {isAuthenticated ? (
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
                onClick={handleSignup}
              >
                Login / SignUp
              </Button>
            )}
          </div>

          {/* Mobile Right Side */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Vehicle Type Toggle */}
            <div className="flex items-center space-x-1">
              <Label htmlFor="mobile-header-mode-toggle" className="text-xs text-gray-700">
                Car
              </Label>
              <Switch
                id="mobile-header-mode-toggle"
                checked={vehicleType === "bike"}
                onCheckedChange={handleToggle}
                className="scale-75"
              />
              <Label htmlFor="mobile-header-mode-toggle" className="text-xs text-gray-700">
                Bike
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <SearchInputWithVehicles
            value={searchValue}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            onSubmit={handleSearchSubmit}
            onVehicleSelect={handleVehicleSelect}
            placeholder="Search Products..."
          />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <div className="px-4 py-2">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Services</h3>
                <div className="space-y-1 ml-4">
                  <button
                    onClick={() => {
                      setPoOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Upload Purchase Request
                  </button>
                  <a
                    href="/services/upload-parts"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Upload Required Parts List
                  </a>
                  <a
                    href="/services/upcoming"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Upcoming Services
                  </a>
                </div>
              </div>

              <div className="px-4 py-2">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Resources</h3>
                <div className="space-y-1 ml-4">
                  <a
                    href="/PrivacyPolicy"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/ShippingAndReturnPolicy"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shipping Policy
                  </a>
                  <a
                    href="/TermsAndConditions"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Terms & Conditions
                  </a>
                  <a
                    href="/aboutus"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </a>
                  <a
                    href="/contact"
                    className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </a>
                </div>
              </div>

              {/* Mobile Auth */}
              <div className="px-4 py-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleSettings();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full py-2 text-sm text-red-600 hover:text-red-700"
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleSignup();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login / SignUp
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        <PurchaseOrderDialog
        isOpen={poOpen}
        onClose={() => setPoOpen(false)}
        userId={user?._id}
        onSubmit={async ({ files, description }) => {
          // Minimal placeholder: log and close dialog
          console.log("PurchaseRequest payload:", { files, description });
          // If you want to keep open on failure, return false
          return true;
        }}
      />
      </div>
    </header>
  );
};