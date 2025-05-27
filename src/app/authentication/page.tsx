import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignupForm from "./components/signup-form";
import LoginForm from "./components/login-form";

export default function AuthenticationPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Criar Conta</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
