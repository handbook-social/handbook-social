'use client';
import { useAuth } from '@/core/context/AuthContext';
import { useSidebarCollapse } from '@/core/context/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { navbarLink } from '@/shared/constants';
import { USER_ROLES } from '@/types/entites';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icons from '../ui/Icons';
import NavbarNotification from './NavbarNotification';
import NavbarSearch from './NavbarSearch';
import NavbarUser from './NavbarUser';

const Navbar = () => {
    const { user, openLoginModal } = useAuth();
    const path = usePathname();
    const { setIsSidebarOpen } = useSidebarCollapse();

    return (
        <nav className="fixed left-0 right-0 top-0 z-10 h-[--navbar-height] w-screen shadow-md md:px-2">
            <div className="relative flex h-full w-full items-center justify-between px-5 md:px-1">
                <div className="flex w-1/4 items-center md:w-1/2">
                    <div className={'flex items-center justify-center'}>
                        <Link className="flex h-8 w-8 items-center" href={'/'}>
                            <Icons.Logo className="text-4xl text-primary-2" />
                        </Link>
                    </div>

                    <NavbarSearch />

                    <div className="ml-2 hidden lg:block">
                        <Button
                            id="sidebar-toggle-btn"
                            onClick={() => setIsSidebarOpen((prev) => !prev)}
                            size={'md'}
                            variant={'ghost'}
                        >
                            <Icons.Menu />
                        </Button>
                    </div>
                </div>

                <div className="mx-auto flex h-full w-1/2 max-w-[400px] flex-1 items-center justify-center md:hidden">
                    <ul
                        className={
                            'top-14 flex h-full w-full items-center justify-between overflow-hidden bg-white dark:bg-dark-secondary-1'
                        }
                    >
                        {navbarLink.map((link) => {
                            if (link.role === USER_ROLES.ADMIN && user?.role !== USER_ROLES.ADMIN) return null;

                            const isActived =
                                path === link.path ||
                                (path.includes(link.path) && link.path !== '/' && !path.includes('/admin'));
                            const Icon = () => {
                                return link.icon;
                            };

                            return (
                                <TooltipProvider key={link.name}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <li
                                                className={cn(
                                                    `flex h-full w-full cursor-pointer items-center p-2 hover:bg-hover-2 dark:hover:bg-dark-hover-1 md:rounded-xl`,
                                                    {
                                                        'border-b-4 border-b-blue': isActived,
                                                    }
                                                )}
                                            >
                                                <Link
                                                    className={cn(
                                                        'flex h-full w-full items-center justify-center dark:text-dark-primary-1 md:justify-start',
                                                        {
                                                            'text-blue dark:text-blue': isActived,
                                                        }
                                                    )}
                                                    href={link.path || '/'}
                                                    onClick={(e) => {
                                                        if (!user && link.path !== '/') {
                                                            e.preventDefault();
                                                            openLoginModal();
                                                        }
                                                    }}
                                                >
                                                    <Icon />

                                                    <span className="ml-2 hidden text-xs md:block">{link.name}</span>
                                                </Link>
                                            </li>
                                        </TooltipTrigger>

                                        <TooltipContent>{link.name}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex h-full w-1/4 items-center justify-end md:w-1/2">
                    <div className="mr-2 flex h-full items-center justify-center">
                        <NavbarNotification />
                    </div>
                    <div className="flex h-full items-center">
                        <NavbarUser />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
