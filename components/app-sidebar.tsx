"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { BarChart3, Briefcase, DollarSign, Home, Moon, Sun, Upload, Users, FileSpreadsheet, ChevronRight, Link2, Database, Globe } from "lucide-react"
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
import { cn } from "@/lib/utils"

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
      title: "API Integrations",
      icon: Link2,
      items: [
        {
          title: "Connections",
          url: "/api/connections",
          icon: Globe,
        },
        {
          title: "Data Sources",
          url: "/api/sources",
          icon: Database,
        },
      ],
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Initialize expanded state based on current path
  useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {}
    data.navMain.forEach((item) => {
      if (item.items?.some((subItem) => pathname === subItem.url)) {
        newExpandedItems[item.title] = true
      }
    })
    setExpandedItems(newExpandedItems)
  }, [pathname])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  return (
    <Sidebar
      collapsible="icon"
      className="group/sidebar w-[--sidebar-width-icon] hover:w-64 transition-all duration-300 ease-in-out"
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <BarChart3 className="h-6 w-6" />
          <span className="font-semibold hidden group-hover/sidebar:inline">Corporate Dashboard</span>
          <span className="font-semibold inline group-hover/sidebar:hidden">CD</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title} className="relative">
                  {item.items ? (
                    <>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => toggleExpanded(item.title)}
                        className="hover:bg-orange-500 hover:text-white transition-colors duration-200 justify-center group-hover/sidebar:justify-start"
                      >
                        {item.icon && <item.icon />}
                        <span className="hidden group-hover/sidebar:block">
                          {item.title}
                        </span>
                        <ChevronRight 
                          className={cn(
                            "ml-auto hidden group-hover/sidebar:block transition-transform duration-200", 
                            expandedItems[item.title] && "rotate-90"
                          )} 
                        />
                      </SidebarMenuButton>
                      
                      {/* Submenu items */}
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          !expandedItems[item.title] && "h-0",
                          expandedItems[item.title] && "h-auto",
                          "hidden group-hover/sidebar:block"
                        )}
                      >
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
                      </div>
                    </>
                  ) : (
                    <SidebarMenuButton
                      tooltip={item.title}
                      asChild
                      isActive={pathname === item.url}
                      className="hover:bg-orange-500 hover:text-white transition-colors duration-200 justify-center group-hover/sidebar:justify-start"
                    >
                      <Link href={item.url || "#"}>
                        {item.icon && <item.icon />}
                        <span className="hidden group-hover/sidebar:block">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
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
              className="hover:bg-orange-500 hover:text-white transition-colors duration-200 justify-center group-hover/sidebar:justify-start"
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              <span className="hidden group-hover/sidebar:block">
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
