import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();
  const nav = useNavigate();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2"
      onClick={() => {
        logout();
        nav("/login");
      }}
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}