
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import SearchComponent from "./SearchComponent";
import NotificationBell from "./NotificationBell";
import { useEffect } from "react";

interface HeaderProps {
  onResultSelect?: (result: any) => void;
}

const Header = ({ onResultSelect }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { plan } = useUserPlan();

  console.log('=== HEADER RENDER ===');
  console.log('User:', user?.email);
  console.log('Plan:', plan);

  useEffect(() => {
    console.log('=== HEADER MOUNTED ===');
    console.log('Header element should be visible now');
    
    // Verificar se o header está no DOM
    setTimeout(() => {
      const header = document.querySelector('header');
      if (header) {
        console.log('Header found in DOM:', header);
        console.log('Header styles:', window.getComputedStyle(header));
        console.log('Header visible:', window.getComputedStyle(header).display !== 'none');
        
        // Verificar posição e dimensões
        const rect = header.getBoundingClientRect();
        console.log('Header bounding box:', {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        });
        console.log('Header in viewport:', (
          rect.top >= 0 && 
          rect.left >= 0 && 
          rect.bottom <= window.innerHeight && 
          rect.right <= window.innerWidth
        ));
      } else {
        console.log('Header NOT found in DOM!');
      }
    }, 100);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const getPlanDisplayName = () => {
    switch (plan) {
      case 'free':
        return 'Free';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  return (
    <header 
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
      style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid rgb(229, 231, 235)',
        position: 'sticky',
        top: '0',
        zIndex: '9999',
        display: 'block',
        width: '100%',
        height: 'auto',
        minHeight: '60px'
      }}
    >
      <div className="container mx-auto px-2 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img 
                src="/lovable-uploads/f8cf239b-cebe-4496-b0bd-b1cc1231627f.png" 
                alt="AutomatizeAI Academy Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutomatizeAI Academy
              </h1>
              <p className="text-xs text-gray-500">Plataforma Educacional</p>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4 xl:mx-8">
            {onResultSelect ? (
              <SearchComponent onResultSelect={onResultSelect} />
            ) : (
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="search-courses"
                  name="search"
                  type="text"
                  placeholder="Buscar cursos, tópicos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Buscar cursos e tópicos"
                />
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <NotificationBell />

            {/* User Profile */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">{getPlanDisplayName()}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={5}>
                  <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
