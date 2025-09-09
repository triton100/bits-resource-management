// "use client"

// import type React from "react"

// import { useEffect, useState } from "react"
// import { usePathname, useRouter } from "next/navigation"
// import Link from "next/link"
// import { LayoutDashboard, User, Briefcase, ShieldCheck, LogOut, Menu, X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/components/ui/use-toast"
// import { useAuth } from "@/context/auth-context"
// import {
//   SidebarProvider,
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarFooter,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarTrigger,
// } from "@/components/ui/sidebar"

// interface DashboardLayoutProps {
//   children: React.ReactNode
// }

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [userRole, setUserRole] = useState<string | null>(null)
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//   const { logout } = useAuth()
//   const router = useRouter()
//   const pathname = usePathname()
//   const { toast } = useToast()

//   const handleLogout = () => {
//     localStorage.removeItem("isAuthenticated")
//     localStorage.removeItem("userRole")

//     toast({
//       title: "Logged out",
//       description: "You have been successfully logged out.",
//     })

//     router.push("/login")
//   }


//   const navigation = [
//     { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//     { name: "My Profile", href: "/dashboard/profile", icon: User },
//     { name: "Skills", href: "/dashboard/skills", icon: Briefcase },
//   ]

//   if (userRole === "admin") {
//     return null;
//   }

//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen">
//         {/* Desktop Sidebar */}
//         <Sidebar className="hidden md:flex">
//           <SidebarHeader className="p-4">
//             <div className="flex items-center gap-2 font-bold text-xl text-teal-600">
//               <span>Bits Resource Management</span>
//             </div>
//           </SidebarHeader>
//           <SidebarContent>
//             <SidebarMenu>
//               {navigation.map((item) => (
//                 <SidebarMenuItem key={item.name}>
//                   <SidebarMenuButton asChild isActive={pathname === item.href}>
//                     <Link href={item.href}>
//                       <item.icon className="h-5 w-5" />
//                       <span>{item.name}</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarContent>
//           <SidebarFooter className="p-4">
//             <Button variant="ghost" className="w-full justify-start" onClick={logout}>
//               <LogOut className="mr-2 h-5 w-5" />
//               Logout
//             </Button>
//           </SidebarFooter>
//         </Sidebar>

//         {/* Mobile Menu */}
//         <div
//           className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
//           style={{ display: isMobileMenuOpen ? "block" : "none" }}
//         >
//           <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg">
//             <div className="flex items-center justify-between">
//               <div className="font-bold text-xl text-teal-600">Bits Resource Management</div>
//               <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
//                 <X className="h-6 w-6" />
//               </Button>
//             </div>
//             <nav className="mt-6 flex flex-col gap-4">
//               {navigation.map((item) => (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
//                     pathname === item.href ? "bg-teal-100 text-teal-700" : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                   onClick={() => setIsMobileMenuOpen(false)}
//                 >
//                   <item.icon className="h-5 w-5" />
//                   {item.name}
//                 </Link>
//               ))}
//               <Button variant="ghost" className="mt-4 w-full justify-start" onClick={handleLogout}>
//                 <LogOut className="mr-2 h-5 w-5" />
//                 Logout
//               </Button>
//             </nav>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex flex-1 flex-col">
//           <header className="sticky top-0 z-10 border-b bg-background">
//             <div className="flex h-16 items-center gap-4 px-4">
//               <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
//                 <Menu className="h-6 w-6" />
//                 <span className="sr-only">Toggle menu</span>
//               </Button>
//               <SidebarTrigger className="hidden md:flex" />
//               <div className="ml-auto flex items-center gap-4">
//                 <span className="text-sm font-medium">{userRole === "admin" ? "Admin User" : "Team Member"}</span>
//               </div>
//             </div>
//           </header>
//           <main className="flex-1 p-4 md:p-6">{children}</main>
//         </div>
//       </div>
//     </SidebarProvider>
//   )
// }
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { LayoutDashboard, User, LogOut, Menu, X, Users, Grid3X3, Target, Settings, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navigation = isAdmin
    ? [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        // { name: "Resources", href: "/dashboard/resources", icon: Users },
        // { name: "Skills Matrix", href: "/dashboard/skills-matrix", icon: Grid3X3 },
        { name: "Learning Goals", href: "/dashboard/idp", icon: Target },
        // { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Profile", href: "/dashboard/profile", icon: User },
        { name: "Skills", href: "/dashboard/skills", icon: Briefcase },
        { name: "Individual Development Plan", href: "/dashboard/idp", icon: Target },
      ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <Image src="/reallogo.jpg" alt="Bits Technologies" width={180} height={40} className="h-12 w-auto rounded-[10px]" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Menu */}
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          style={{ display: isMobileMenuOpen ? "block" : "none" }}
        >
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <Image src="/logo.png" alt="Bits Technologies" width={120} height={40} className="h-8 w-auto" />
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="mt-6 flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href ? "bg-teal-100 text-teal-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <Button variant="ghost" className="mt-4 w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="flex h-16 items-center gap-4 px-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <SidebarTrigger className="hidden md:flex" />

              <div className="ml-auto flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback>
                          {user.displayName
                            ? user.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {isAdmin ? "Administrator" : "Resource"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
