"use client"

import type * as React from "react"
import { BarChart3, Briefcase, DollarSign, Home, Moon, Sun, Upload, Users, FileSpreadsheet } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Departments",
      icon: BarChart3,
      items: [
        {
          title: "Human Resources",
          url: "/hr",
          icon: Users,
        },
        {
          title: "Finance & Accounting",
          url: "/finance",
          icon: DollarSign,
        },
        {
          title: "Field Operations",
          url: "/operations",
          icon: Briefcase,
        },
      ],
    },
    {
      title: "User Management",
      url: "/users",
      icon: Users,
    },
    {
      title: "Data Management",
      icon: Upload,
      items: [
        {
          title: "Upload HR Data",
          url: "/upload/hr",
          icon: FileSpreadsheet,
        },
        {
          title: "Upload Finance Data",
          url: "/upload/finance",
          icon: FileSpreadsheet,
        },
        {
          title: "Upload Operations Data",
          url: "/upload/operations",
          icon: FileSpreadsheet,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="offcanvas"
      className="group/sidebar-hover hover:w-64 transition-all duration-300 ease-in-out"
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <BarChart3 className="h-6 w-6" />
          <span className="font-semibold">Corporate Dashboard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.items?.some((subItem) => pathname === subItem.url)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    {item.items ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className="hover:bg-orange-500 hover:text-white transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:group-hover/sidebar-hover:justify-start"
                          >
                            {item.icon && <item.icon />}
                            <span className="group-data-[collapsible=icon]:group-hover/sidebar-hover:block group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:group-hover/sidebar-hover:block group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="group-data-[collapsible=icon]:group-hover/sidebar-hover:block group-data-[collapsible=icon]:hidden">
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                  className="hover:bg-orange-400 hover:text-white transition-colors duration-200"
                                >
                                  <Link href={subItem.url}>
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : (
                      <SidebarMenuButton
                        tooltip={item.title}
                        asChild
                        isActive={pathname === item.url}
                        className="hover:bg-orange-500 hover:text-white transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:group-hover/sidebar-hover:justify-start"
                      >
                        <Link href={item.url || "#"}>
                          {item.icon && <item.icon />}
                          <span className="group-data-[collapsible=icon]:group-hover/sidebar-hover:block group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              tooltip="Toggle theme"
              className="hover:bg-orange-500 hover:text-white transition-colors duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:group-hover/sidebar-hover:justify-start"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span className="group-data-[collapsible=icon]:group-hover/sidebar-hover:block group-data-[collapsible=icon]:hidden">
                Toggle Theme
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
