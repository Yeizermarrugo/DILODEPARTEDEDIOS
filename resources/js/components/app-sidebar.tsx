import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Edit3, GraduationCap, Image, LayoutGrid, PlusCircle } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Nuevo Devocional',
        href: '/devocionalesAgregar',
        icon: PlusCircle,
    },
    {
        title: 'Editar Contenido',
        href: '/devocionales-edit',
        icon: Edit3,
    },
    {
        title: 'Imágenes de Post',
        href: '/postImage',
        icon: Image,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Devocionales',
        href: '/devocionales',
        icon: BookOpen,
    },
    {
        title: 'Estudios Bíblicos',
        href: '/estudios',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" style={{ backgroundColor: '#2d465e', textDecoration: 'none' }}>
            <SidebarHeader style={{ backgroundColor: '#2d465e', textDecoration: 'none' }}>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent style={{ backgroundColor: '#2d465e', textDecoration: 'none' }}>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter style={{ backgroundColor: '#2d465e', textDecoration: 'none' }}>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
