import { Disclosure, MenuButton, Menu,DisclosureButton, MenuItems,MenuItem } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useState } from "react";

const Navbar = ({ active }) => {
  const navigate = useNavigate();
  const [navigation] = useState([
    {
      name: "Preview",
      href: `/`,
      current: active === "preview",
    },
    {
      name: "Generate QR",
      href: `/qr`,
      current: active === "preview",
    },
  ]);

  const handleSignOut = async () => {
    await signOut(auth);
    localStorage.removeItem("userID");
    navigate("/");
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="inline-flex items-center justify-center p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none">
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              <XMarkIcon className="hidden h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="text-white font-bold text-2xl">
              Menu Management
            </Link>
            <div className="hidden sm:ml-6 sm:flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Profile dropdown */}
       
<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:ml-4 sm:pr-0">
  <Menu as="div" className="relative ml-3">
    <div>
      <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
        <span className="absolute -inset-1.5" />
        <span className="sr-only">Open user menu</span>
        <img
          alt="User Avatar"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          className="h-8 w-8 rounded-full"
        />
      </MenuButton>
    </div>
    <MenuItems
      transition
      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
    >
      {/* Profile Link */}
      <MenuItem as="a" href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Your Profile
      </MenuItem>

      {/* Settings Link */}
      <MenuItem as="a" href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        Settings
      </MenuItem>

      {/* Sign Out Button */}
      <MenuItem as="button" onClick={handleSignOut} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
        Sign out
      </MenuItem>
    </MenuItems>
  </Menu>
</div>








        </div>
      </div>

      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <Disclosure.Button
              key={item.name}
              as={Link}
              to={item.href}
              className={classNames(
                item.current
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.name}
            </Disclosure.Button>
          ))}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
};

export default Navbar;
