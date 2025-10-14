"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AppUser, UserRole } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUser, updateUser } from "@/ai/flows/user-management-flow";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).optional(),
  displayName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  role: z.enum(["admin", "supervisor", "vendedor"]),
  reportsTo: z.string().optional(),
});

type UserDialogProps = {
  user?: AppUser;
  children?: React.ReactNode;
};

export function UserDialog({ user, children }: UserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const isEditMode = !!user;

  // Adjust schema for edit mode (password is not required)
  const finalSchema = isEditMode
    ? formSchema.omit({ email: true, password: true }) // Can't change email or password in edit mode
    : formSchema.refine(data => data.password, {
        message: "La contraseña es obligatoria para nuevos usuarios.",
        path: ["password"],
      });

  const form = useForm<z.infer<typeof finalSchema>>({
    resolver: zodResolver(finalSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      role: user?.role || "vendedor",
      reportsTo: user?.reportsTo || "",
      ...(isEditMode ? {} : { email: "", password: "" }),
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        displayName: user?.displayName || "",
        role: user?.role || "vendedor",
        reportsTo: user?.reportsTo || "",
         ...(isEditMode ? {} : { email: "", password: "" }),
      });
    }
  }, [open, user, form, isEditMode]);

  async function onSubmit(values: z.infer<typeof finalSchema>) {
    try {
      if (isEditMode && user?.uid) {
        // Update existing user
        await updateUser({ 
            uid: user.uid, 
            displayName: values.displayName,
            role: values.role,
            reportsTo: values.reportsTo
        });
        toast({
          title: "Usuario actualizado",
          description: `${values.displayName} ha sido guardado.`,
        });
      } else {
        // Create new user (casting to access full schema properties)
        const createValues = values as z.infer<typeof formSchema>;
        await createUser({
          email: createValues.email,
          password: createValues.password!, // Password is required by schema here
          displayName: createValues.displayName,
          role: createValues.role,
          reportsTo: createValues.reportsTo
        });

        toast({
          title: "Usuario creado",
          description: `${values.displayName} ha sido creado con éxito.`,
        });
      }
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to save user:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "No se pudo guardar el usuario. Revisa la consola para más detalles.",
      });
    }
  }

  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nuevo Usuario
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Usuario" : "Añadir Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualiza los detalles del usuario."
              : "Rellena los datos para crear un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {!isEditMode && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!isEditMode && (
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        ["admin", "supervisor", "vendedor"] as UserRole[]
                      ).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* TODO: Add supervisor selector for 'reportsTo' field */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}